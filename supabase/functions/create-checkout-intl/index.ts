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

    // Find or create customer
    let customerId: string | undefined;
    const customerEmail = customerData?.email;

    if (customerEmail) {
      logStep("Looking up customer", { email: customerEmail });
      const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });

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
        },
      };

      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        await stripe.customers.update(customerId, customerParams);
        logStep("Updated existing customer", { customerId });
      } else {
        const newCustomer = await stripe.customers.create(customerParams);
        customerId = newCustomer.id;
        logStep("Created new customer", { customerId });
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

    // Payment methods
    const currencyLower = (currency || 'USD').toLowerCase();
    const allMethods = (paymentMethods || ['card']).filter((m: string) =>
      ['card', 'sepa_debit', 'us_bank_account', 'link'].includes(m)
    );
    // Filter methods incompatible with currency
    const validMethods = allMethods.filter((m: string) => {
      if (m === 'us_bank_account' && currencyLower !== 'usd') return false;
      if (m === 'sepa_debit' && currencyLower !== 'eur') return false;
      return true;
    });
    if (validMethods.length === 0) validMethods.push('card');

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
