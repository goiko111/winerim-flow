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

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

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

    // Build line items with price_data
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: finalName,
          description: `Suscripción Winerim - ${finalName}`,
        },
        unit_amount: Math.round(finalPrice * 100), // Convert to cents
        recurring: {
          interval: intervalConfig.interval,
          interval_count: intervalConfig.intervalCount,
        },
      },
      quantity: 1,
    }];

    // Find or create customer
    let customerId: string | undefined;
    const customerEmail = customerData?.email;

    if (customerEmail) {
      logStep("Looking up customer by email", { email: customerEmail });
      const existingCustomers = await stripe.customers.list({ 
        email: customerEmail, 
        limit: 1 
      });

      // Build full address string
      const fullAddress = [
        customerData.address,
        customerData.postalCode,
        customerData.city,
        customerData.state,
        customerData.country,
      ].filter(Boolean).join(', ');

      const customerMetadata = {
        companyName: customerData.companyName || '',
        vatId: customerData.vatId || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        postalCode: customerData.postalCode || '',
        city: customerData.city || '',
        state: customerData.state || '',
        country: customerData.country || '',
        promoCode: customerData.promoCode || '',
        onboardingNotes: customerData.onboardingNotes || '',
      };

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
        logStep("Found existing customer", { customerId });
        
        // Update customer with latest company data
        await stripe.customers.update(customerId, {
          name: customerData.companyName,
          phone: customerData.phone,
          address: {
            line1: customerData.address,
            city: customerData.city,
            state: customerData.state,
            postal_code: customerData.postalCode,
            country: customerData.country,
          },
          metadata: customerMetadata,
        });
      } else {
        // Create new customer with all data
        logStep("Creating new customer", { email: customerEmail, companyName: customerData.companyName });
        const newCustomer = await stripe.customers.create({
          email: customerEmail,
          name: customerData.companyName,
          phone: customerData.phone,
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
        logStep("Customer created", { customerId });
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
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      // Required for tax_id_collection with existing customer
      customer_update: customerId ? { name: 'auto', address: 'auto' } : undefined,
      mode: 'subscription',
      line_items: lineItems,
      success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/checkout/cancel`,
      // Pre-fill billing address if we have customer data
      billing_address_collection: 'auto',
      tax_id_collection: { enabled: true },
      payment_method_types: filteredPaymentMethods as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      metadata: {
        planSlug: planSlug || 'custom',
        billingInterval: intervalKey,
        customPrice: finalPrice.toString(),
        customDescription: customDescription || '',
        paymentMethods: (paymentMethods || []).join(','),
        companyName: customerData?.companyName || '',
        vatId: customerData?.vatId || '',
        phone: customerData?.phone || '',
        source: 'winerim_sales_portal',
      },
    };

    // If we don't have a customer ID yet, pre-fill the phone number
    if (!customerId && customerData?.phone) {
      sessionParams.phone_number_collection = { enabled: true };
    }

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
