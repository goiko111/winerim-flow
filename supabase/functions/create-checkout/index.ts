import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan configuration with pricing
const PLANS: Record<string, { name: string; price: number; interval: 'month' | 'year'; intervalCount: number }> = {
  'mensual': { name: 'Plan Mensual', price: 125, interval: 'month', intervalCount: 1 },
  'semestral': { name: 'Plan Semestral', price: 645, interval: 'month', intervalCount: 6 },
  'anual': { name: 'Plan Anual', price: 990, interval: 'year', intervalCount: 1 },
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
      customerData,
      successUrl,
      cancelUrl,
    } = body;

    logStep("Request body parsed", { planSlug, customPrice, hasCustomerData: !!customerData });

    const basePlan = PLANS[planSlug];
    if (!basePlan) {
      throw new Error(`Unknown plan: ${planSlug}`);
    }

    // Determine final price and description
    const finalPrice = customPrice && customPrice > 0 ? customPrice : basePlan.price;
    const finalName = customDescription 
      ? `${basePlan.name} — ${customDescription}` 
      : basePlan.name;

    logStep("Using price_data", { finalPrice, finalName, interval: basePlan.interval });

    // Always use price_data for flexibility
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: finalName,
          description: `Suscripción Winerim - ${finalName}`,
        },
        unit_amount: Math.round(finalPrice * 100), // Convert to cents
        recurring: {
          interval: basePlan.interval,
          interval_count: basePlan.intervalCount,
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

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
        logStep("Found existing customer", { customerId });
        
        // Update customer metadata with latest company data
        await stripe.customers.update(customerId, {
          name: customerData.companyName,
          metadata: {
            cif: customerData.cif || '',
            phone: customerData.phone || '',
            address: customerData.address || '',
            postalCode: customerData.postalCode || '',
            city: customerData.city || '',
            province: customerData.province || '',
          },
        });
      } else {
        // Create new customer
        logStep("Creating new customer", { email: customerEmail });
        const newCustomer = await stripe.customers.create({
          email: customerEmail,
          name: customerData.companyName,
          phone: customerData.phone,
          metadata: {
            cif: customerData.cif || '',
            address: customerData.address || '',
            postalCode: customerData.postalCode || '',
            city: customerData.city || '',
            province: customerData.province || '',
          },
        });
        customerId = newCustomer.id;
        logStep("Customer created", { customerId });
      }
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "https://winerim.com";
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      customer_update: customerId ? { name: 'auto', address: 'auto' } : undefined,
      mode: 'subscription',
      line_items: lineItems,
      success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/checkout/cancel`,
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      payment_method_types: ['card', 'sepa_debit'],
      metadata: {
        planSlug,
        customPrice: customPrice?.toString() || '',
        customDescription: customDescription || '',
        source: 'winerim_sales_portal',
      },
    };

    logStep("Creating checkout session", { mode: sessionParams.mode, finalPrice });
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