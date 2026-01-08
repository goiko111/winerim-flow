import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map plan slugs to Stripe price IDs
const PLAN_PRICE_MAP: Record<string, string> = {
  'startup': 'price_1RVacRRxJKzx8e3wMVJn4Vt9',      // Plan Startup - 199€/mes
  'advanced': 'price_1RVafsRxJKzx8e3wjHxLRmJq',     // Plan Advanced - 599€/mes
  'excellence': 'price_1RVagbRxJKzx8e3w0xKfPtWY',   // Plan Excellence - 999€/mes
  // Winerim plans mapping
  'mensual': 'price_1RVacRRxJKzx8e3wMVJn4Vt9',
  'semestral': 'price_1RVafsRxJKzx8e3wjHxLRmJq',
  'anual': 'price_1RVagbRxJKzx8e3w0xKfPtWY',
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

    // 1. Determine the price to use
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (customPrice && customPrice > 0) {
      // Use custom price_data for custom amounts
      logStep("Using custom price", { customPrice, customDescription });
      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: customDescription || `Plan personalizado - ${planSlug}`,
            description: `Suscripción personalizada Winerim`,
          },
          unit_amount: Math.round(customPrice * 100), // Convert to cents
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }];
    } else {
      // Use existing price from Stripe
      const priceId = PLAN_PRICE_MAP[planSlug];
      if (!priceId) {
        throw new Error(`Unknown plan: ${planSlug}`);
      }
      logStep("Using existing price", { planSlug, priceId });
      lineItems = [{
        price: priceId,
        quantity: 1,
      }];
    }

    // 2. Find or create customer
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
            cif: customerData.cif,
            phone: customerData.phone,
            address: customerData.address,
            postalCode: customerData.postalCode,
            city: customerData.city,
            province: customerData.province,
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
            cif: customerData.cif,
            address: customerData.address,
            postalCode: customerData.postalCode,
            city: customerData.city,
            province: customerData.province,
          },
        });
        customerId = newCustomer.id;
        logStep("Customer created", { customerId });
      }
    }

    // 3. Create checkout session
    const origin = req.headers.get("origin") || "https://winerim.com";
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
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

    logStep("Creating checkout session", { mode: sessionParams.mode });
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
