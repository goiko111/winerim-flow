import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Billing interval configuration
const INTERVAL_CONFIG: Record<string, { interval: 'month' | 'year'; intervalCount: number; label: string }> = {
  'monthly': { interval: 'month', intervalCount: 1, label: 'Mensual' },
  'quarterly': { interval: 'month', intervalCount: 3, label: 'Trimestral' },
  'semestral': { interval: 'month', intervalCount: 6, label: 'Semestral' },
  'annual': { interval: 'year', intervalCount: 1, label: 'Anual' },
  // Legacy plan slugs support
  'mensual': { interval: 'month', intervalCount: 1, label: 'Mensual' },
  'anual': { interval: 'year', intervalCount: 1, label: 'Anual' },
};

// Payment method mapping
const PAYMENT_METHOD_MAP: Record<string, string> = {
  'card': 'card',
  'sepa_debit': 'sepa_debit',
  'bank_transfer': 'customer_balance', // Stripe uses customer_balance for bank transfers
};

// EU country codes (for eu_vat fallback)
const EU_COUNTRIES = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];

// Normalize VAT/CIF: uppercase, remove spaces, dots and dashes
const normalizeVat = (value: string): string =>
  (value || '').toUpperCase().replace(/[\s.\-\/]/g, '');

// Build an ordered list of {type, value} candidates to register in Stripe
const getTaxIdCandidates = (countryRaw: string, vatRaw: string): Array<{ type: string; value: string }> => {
  const country = (countryRaw || 'ES').toUpperCase();
  const raw = normalizeVat(vatRaw);
  if (!raw) return [];

  // Strip country prefix if present (e.g. ESB12345678 -> B12345678)
  const hasPrefix = raw.startsWith(country) && raw.length > country.length;
  const bare = hasPrefix ? raw.slice(country.length) : raw;
  const prefixed = `${country}${bare}`;

  const specific: Record<string, string> = {
    'ES': 'es_cif',
    'PT': 'pt_nif',
    'IT': 'it_vat',
    'DE': 'de_stn',
    'AT': 'at_vat',
    'BE': 'be_vat',
    'NL': 'nl_vat',
    'IE': 'ie_vat',
    'FR': 'fr_siret',
    'GB': 'gb_vat',
    'CH': 'ch_vat',
    'NO': 'no_vat',
    'MX': 'mx_rfc',
    'AR': 'ar_cuit',
    'CO': 'co_nit',
    'BR': 'br_cnpj',
    'CL': 'cl_tin',
    'PE': 'pe_ruc',
    'CR': 'cr_tin',
    'US': 'us_ein',
    'CA': 'ca_bn',
    'AU': 'au_abn',
  };

  const candidates: Array<{ type: string; value: string }> = [];
  const specificType = specific[country];

  if (country === 'ES') {
    // Spanish CIF/NIF without prefix, then EU VAT with prefix as fallback
    candidates.push({ type: 'es_cif', value: bare });
    candidates.push({ type: 'eu_vat', value: prefixed });
  } else if (EU_COUNTRIES.includes(country)) {
    candidates.push({ type: 'eu_vat', value: prefixed });
    if (specificType) candidates.push({ type: specificType, value: bare });
  } else if (specificType) {
    candidates.push({ type: specificType, value: bare });
  }
  // Last resort: never lose the number — Stripe accepts unknown as generic
  candidates.push({ type: 'eu_vat', value: prefixed });
  return candidates;
};

// Register the tax ID trying each candidate until Stripe accepts one
async function attachTaxId(
  stripe: Stripe,
  customerId: string,
  country: string,
  vatId: string,
): Promise<boolean> {
  const candidates = getTaxIdCandidates(country, vatId);
  for (const candidate of candidates) {
    try {
      await stripe.customers.createTaxId(customerId, {
        type: candidate.type as Stripe.CustomerCreateTaxIdParams['type'],
        value: candidate.value,
      });
      logStep("Tax ID added", candidate);
      return true;
    } catch (err) {
      logStep("Tax ID candidate rejected", { ...candidate, error: String(err) });
    }
  }
  logStep("WARNING: could not attach any Tax ID", { country, vatId });
  return false;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Cached stable product ID to avoid re-searching on every invocation
let cachedStableProductId: string | null = null;

async function getOrCreateStableProduct(stripe: Stripe): Promise<string> {
  if (cachedStableProductId) return cachedStableProductId;
  try {
    const search = await stripe.products.search({
      query: "metadata['winerim_stable']:'true' AND metadata['account']:'es'",
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
    name: 'Suscripción Winerim',
    description: 'Suscripción a la plataforma Winerim',
    metadata: { winerim_stable: 'true', account: 'es' },
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-04-30.basil",
    });

    const body = await req.json();
    const {
      planSlug,
      customPrice,
      customDescription,
      billingInterval,
      paymentMethods,
      customerData,
      successUrl,
      cancelUrl,
      winerimUserId,
    } = body;

    logStep("Request body parsed", { 
      planSlug, 
      customPrice, 
      billingInterval, 
      paymentMethods,
      hasCustomerData: !!customerData 
    });

    // Determine interval config - use billingInterval if provided, otherwise fall back to planSlug
    const intervalKey = billingInterval || planSlug || 'monthly';
    const intervalConfig = INTERVAL_CONFIG[intervalKey];
    
    if (!intervalConfig) {
      throw new Error(`Unknown billing interval: ${intervalKey}`);
    }

    // Determine final price
    const finalPrice = customPrice && customPrice > 0 ? customPrice : 0;
    if (finalPrice <= 0) {
      throw new Error('Price must be greater than 0');
    }

    // Build description
    const finalName = customDescription 
      ? `Suscripción ${intervalConfig.label} — ${customDescription}` 
      : `Suscripción ${intervalConfig.label} Winerim`;

    logStep("Using price_data", { 
      finalPrice, 
      finalName, 
      interval: intervalConfig.interval,
      intervalCount: intervalConfig.intervalCount 
    });

    // Use stable, reusable product so future price updates are possible
    const stableProductId = await getOrCreateStableProduct(stripe);

    // Build line items with price_data attached to the stable product
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price_data: {
        currency: 'eur',
        product: stableProductId,
        unit_amount: Math.round(finalPrice * 100), // Convert to cents
        recurring: {
          interval: intervalConfig.interval,
          interval_count: intervalConfig.intervalCount,
        },
      },
      quantity: 1,
    }];

    // Always create a NEW Stripe customer per subscription (one-per-subscription policy)
    let customerId: string | undefined;
    const customerEmail = customerData?.email;

    if (customerEmail) {
      const customerMetadata = {
        companyName: customerData.companyName || '',
        restaurantName: customerData.restaurantName || '',
        vatId: customerData.vatId || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        postalCode: customerData.postalCode || '',
        city: customerData.city || '',
        state: customerData.state || '',
        country: customerData.country || '',
        promoCode: customerData.promoCode || '',
        onboardingNotes: customerData.onboardingNotes || '',
        ...(winerimUserId && { winerimUserId: String(winerimUserId) }),
      };

      // Legal company name goes to the Stripe customer name (appears on the invoice).
      // If there is no company (individual), the restaurant name is used as a
      // trade name / "nickname" only — with no legal meaning.
      const companyName = (customerData.companyName || '').trim();
      const tradeName = (customerData.restaurantName || '').trim();
      const customerName = companyName || tradeName;

      logStep("Creating new customer (one-per-subscription policy)", { email: customerEmail, customerName });
      const newCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerName || undefined,
        phone: customerData.phone,
        description: companyName && tradeName
          ? `${companyName} (${tradeName})`
          : customerName || undefined,
        address: {
          line1: customerData.address,
          city: customerData.city,
          state: customerData.state,
          postal_code: customerData.postalCode,
          country: customerData.country,
        },
        metadata: customerMetadata,
      });
      customerId = newCustomer.id;
      logStep("Customer created", { customerId, legalName });

      // Add Tax ID (CIF/VAT) if provided — required on the legal invoice
      if (customerData.vatId) {
        await attachTaxId(stripe, customerId, customerData.country, customerData.vatId);
      }
    }

    // Determine payment methods
    let stripePaymentMethods: string[] = ['card', 'sepa_debit']; // defaults
    
    if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      stripePaymentMethods = paymentMethods
        .map((m: string) => PAYMENT_METHOD_MAP[m])
        .filter(Boolean);
    }

    // Filter out bank_transfer/customer_balance if present (requires special handling)
    const hasBankTransfer = paymentMethods?.includes('bank_transfer');
    const filteredPaymentMethods = stripePaymentMethods.filter(m => m !== 'customer_balance');

    logStep("Payment methods configured", { 
      requested: paymentMethods, 
      stripe: filteredPaymentMethods,
      hasBankTransfer 
    });

    // Create checkout session
    const origin = req.headers.get("origin") || "https://winerim.com";
    
    // Check if we have complete customer address data
    const hasCompleteAddress = customerData?.address && customerData?.city && customerData?.postalCode && customerData?.country;
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      mode: 'subscription',
      line_items: lineItems,
      success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/checkout/cancel`,
      // Force address collection so Stripe Tax uses the address confirmed at checkout
      // (critical for regions like Canary Islands/Ceuta/Melilla where IVA does NOT apply)
      billing_address_collection: 'required',
      // Update customer with the address confirmed in Stripe Checkout.
      // Keep the legal company name we already set (never let Checkout overwrite it).
      customer_update: {
        address: 'auto',
        name: customerData?.companyName ? 'never' : 'auto',
      },
      // Only ask for phone if we don't have it
      phone_number_collection: { enabled: !customerData?.phone },
      // Always allow tax ID (prefilled when we already attached it) so it prints on the invoice
      tax_id_collection: { enabled: true },
      payment_method_types: filteredPaymentMethods as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      // Require terms acceptance in Stripe Checkout
      consent_collection: {
        terms_of_service: 'required',
      },
      // Automatic tax calculation (requires Stripe Tax enabled in dashboard)
      automatic_tax: { enabled: true },
      // Add subscription metadata
      subscription_data: {
        metadata: {
          planSlug: planSlug || 'custom',
          billingInterval: intervalKey,
          customPrice: finalPrice.toString(),
          customDescription: customDescription || '',
          paymentMethods: (paymentMethods || []).join(','),
          companyName: customerData?.companyName || '',
          restaurantName: customerData?.restaurantName || '',
          vatId: customerData?.vatId || '',
          phone: customerData?.phone || '',
          address: customerData?.address || '',
          city: customerData?.city || '',
          postalCode: customerData?.postalCode || '',
          country: customerData?.country || '',
          source: 'winerim_sales_portal',
          ...(winerimUserId && { userId: String(winerimUserId) }),
        },
      },
      metadata: {
        planSlug: planSlug || 'custom',
        billingInterval: intervalKey,
        customPrice: finalPrice.toString(),
        customDescription: customDescription || '',
        paymentMethods: (paymentMethods || []).join(','),
        companyName: customerData?.companyName || '',
        restaurantName: customerData?.restaurantName || '',
        vatId: customerData?.vatId || '',
        phone: customerData?.phone || '',
        address: customerData?.address || '',
        city: customerData?.city || '',
        postalCode: customerData?.postalCode || '',
        country: customerData?.country || '',
        source: 'winerim_sales_portal',
      },
    };

    // Add bank transfer options if requested
    if (hasBankTransfer) {
      sessionParams.payment_method_options = {
        ...sessionParams.payment_method_options,
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: 'eu_bank_transfer',
            eu_bank_transfer: {
              country: customerData?.country || 'ES',
            },
          },
        },
      };
      // Add customer_balance to payment methods
      (sessionParams.payment_method_types as string[]).push('customer_balance');
    }

    logStep("Creating checkout session", { 
      mode: sessionParams.mode, 
      finalPrice,
      paymentMethods: sessionParams.payment_method_types 
    });
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ 
        sessionUrl: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
