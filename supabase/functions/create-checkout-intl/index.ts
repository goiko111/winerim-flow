import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTERVAL_CONFIG: Record<string, { interval: 'month' | 'year'; intervalCount: number; label: string }> = {
  'monthly': { interval: 'month', intervalCount: 1, label: 'Monthly' },
  'quarterly': { interval: 'month', intervalCount: 3, label: 'Quarterly' },
  'semestral': { interval: 'month', intervalCount: 6, label: 'Semi-Annual' },
  'annual': { interval: 'year', intervalCount: 1, label: 'Annual' },
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT-INTL] ${step}${detailsStr}`);
};

let cachedStableProductId: string | null = null;
async function getOrCreateStableProduct(stripe: Stripe): Promise<string> {
  if (cachedStableProductId) return cachedStableProductId;
  try {
    const search = await stripe.products.search({
      query: "metadata['winerim_stable']:'true' AND metadata['account']:'intl'",
      limit: 1,
    });
    if (search.data.length > 0) {
      cachedStableProductId = search.data[0].id;
      return cachedStableProductId;
    }
  } catch (err) {
    logStep("Stable product search failed, will create", { err: String(err) });
  }
  const product = await stripe.products.create({
    name: 'Winerim International Subscription',
    description: 'Winerim platform subscription (international)',
    metadata: { winerim_stable: 'true', account: 'intl' },
  });
  cachedStableProductId = product.id;
  logStep("Created stable product", { productId: product.id });
  return product.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY_INTL");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY_INTL is not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-04-30.basil" });

    const body = await req.json();
    const {
      price,
      currency,
      billingInterval,
      paymentMethods,
      customerData,
      description,
      successUrl,
      cancelUrl,
    } = body;

    logStep("Request body parsed", { price, currency, billingInterval, paymentMethods });

    const intervalKey = billingInterval || 'monthly';
    const intervalConfig = INTERVAL_CONFIG[intervalKey];
    if (!intervalConfig) throw new Error(`Unknown billing interval: ${intervalKey}`);

    if (!price || price <= 0) throw new Error('Price must be greater than 0');

    const finalName = description
      ? `${intervalConfig.label} Subscription — ${description}`
      : `${intervalConfig.label} Subscription — Winerim`;

    // Find or create customer — handle multi-currency by checking existing subscriptions
    let customerId: string | undefined;
    const customerEmail = customerData?.email;
    const targetCurrency = (currency || 'USD').toLowerCase();

    if (customerEmail) {
      logStep("Looking up customer", { email: customerEmail });
      const existing = await stripe.customers.list({ email: customerEmail, limit: 100 });

      const customerParams = {
        email: customerEmail,
        name: customerData.companyName || customerData.customerName,
        phone: customerData.phone || undefined,
        address: customerData.address ? {
          line1: customerData.address,
          city: customerData.city || undefined,
          postal_code: customerData.postalCode || undefined,
          country: customerData.country || undefined,
        } : undefined,
        metadata: {
          companyName: customerData.companyName || '',
          vatId: customerData.vatId || '',
          source: 'winerim_intl_portal',
          currency: targetCurrency,
        },
      };

      // Find a customer compatible with this currency (no active subs in another currency)
      let compatibleCustomer: string | undefined;
      for (const cust of existing.data) {
        const subs = await stripe.subscriptions.list({ customer: cust.id, limit: 10 });
        const activeSubs = subs.data.filter(s => ['active', 'trialing', 'past_due', 'incomplete'].includes(s.status));
        if (activeSubs.length === 0) {
          // No active subs — safe to reuse
          compatibleCustomer = cust.id;
          break;
        }
        const sameCurrency = activeSubs.every(s => s.currency === targetCurrency);
        if (sameCurrency) {
          compatibleCustomer = cust.id;
          break;
        }
      }

      if (compatibleCustomer) {
        customerId = compatibleCustomer;
        await stripe.customers.update(customerId, customerParams);
        logStep("Using compatible customer", { customerId, targetCurrency });
      } else {
        // Create a new customer for this currency
        const newCustomer = await stripe.customers.create(customerParams);
        customerId = newCustomer.id;
        logStep("Created new customer for currency", { customerId, targetCurrency });
      }
    }

    // Line items
    const lineItems = [{
      price_data: {
        currency: (currency || 'USD').toLowerCase(),
        product_data: {
          name: finalName,
          description: customerData?.companyName
            ? `${customerData.companyName} — Winerim International`
            : 'Winerim International Subscription',
        },
        unit_amount: Math.round(price * 100),
        recurring: {
          interval: intervalConfig.interval,
          interval_count: intervalConfig.intervalCount,
        },
      },
      quantity: 1,
    }];

    // Payment methods — auto-detect by currency
    const currencyLower = (currency || 'USD').toLowerCase();
    const requested = (paymentMethods || ['card']) as string[];
    const ALLOWED = ['card', 'link', 'us_bank_account', 'customer_balance'];
    const allMethods = requested.filter((m: string) => ALLOWED.includes(m));
    // Filter methods incompatible with currency
    const validMethods = allMethods.filter((m: string) => {
      if (m === 'us_bank_account' && currencyLower !== 'usd') return false;
      return true;
    });
    if (validMethods.length === 0) validMethods.push('card');
    // Always include link if card is present
    if (validMethods.includes('card') && !validMethods.includes('link')) {
      validMethods.push('link');
    }

    const origin = req.headers.get("origin") || "https://winerim.com";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      mode: 'subscription',
      line_items: lineItems,
      success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/checkout/cancel`,
      billing_address_collection: 'auto',
      customer_update: { address: 'auto', name: 'auto' },
      payment_method_types: validMethods,
      consent_collection: { terms_of_service: 'required' },
      subscription_data: {
        metadata: {
          billingInterval: intervalKey,
          currency: currency || 'USD',
          companyName: customerData?.companyName || '',
          vatId: customerData?.vatId || '',
          source: 'winerim_intl_portal',
        },
      },
    };

    // If customer_balance is included, configure bank transfer funding
    if (validMethods.includes('customer_balance')) {
      sessionParams.payment_method_options = {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: currencyLower === 'eur' ? 'eu_bank_transfer' :
                  currencyLower === 'gbp' ? 'gb_bank_transfer' :
                  currencyLower === 'mxn' ? 'mx_bank_transfer' :
                  'us_bank_transfer',
            ...(currencyLower === 'eur' ? { eu_bank_transfer: { country: 'DE' } } : {}),
          },
        },
      };
    }

    logStep("Creating checkout session", { paymentMethods: validMethods, currency });
    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ sessionUrl: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
