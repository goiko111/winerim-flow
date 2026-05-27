import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-key",
};

const log = (s: string, d?: Record<string, unknown>) =>
  console.log(`[UPDATE-SUB-PRICE] ${s}${d ? ' - ' + JSON.stringify(d) : ''}`);

async function getOrCreateStableProduct(stripe: Stripe, account: 'es' | 'intl'): Promise<string> {
  const name = account === 'es' ? 'Suscripción Winerim' : 'Winerim International Subscription';
  try {
    const search = await stripe.products.search({
      query: `metadata['winerim_stable']:'true' AND metadata['account']:'${account}'`,
      limit: 1,
    });
    if (search.data.length > 0) return search.data[0].id;
  } catch (err) {
    log("search failed, creating", { err: String(err) });
  }
  const p = await stripe.products.create({ name, metadata: { winerim_stable: 'true', account } });
  return p.id;
}

async function getOrCreatePrice(
  stripe: Stripe,
  account: 'es' | 'intl',
  productId: string,
  unitAmount: number,
  currency: string,
  interval: 'day' | 'week' | 'month' | 'year',
  intervalCount: number,
): Promise<string> {
  const lookupKey = `winerim_${account}_${unitAmount}_${currency}_${interval}_${intervalCount}`.toLowerCase();
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (existing.data.length > 0) return existing.data[0].id;
  const p = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    recurring: { interval, interval_count: intervalCount },
    lookup_key: lookupKey,
  });
  return p.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const internalKey = req.headers.get('x-internal-key');
    const expected = Deno.env.get('WINERIM_INTERNAL_API_KEY');
    if (!expected || internalKey !== expected) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const account: 'es' | 'intl' = body.account === 'intl' ? 'intl' : 'es';
    const subscriptionId: string = body.stripeSubscriptionId;
    const newAmount: number = Number(body.newAmount); // in major units (EUR/USD)
    const prorationBehavior: 'none' | 'create_prorations' | 'always_invoice' =
      body.prorationBehavior || 'none';

    if (!subscriptionId || !newAmount || newAmount <= 0) {
      return new Response(JSON.stringify({ error: 'stripeSubscriptionId and newAmount > 0 are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripeKey = account === 'es'
      ? Deno.env.get('STRIPE_SECRET_KEY')
      : Deno.env.get('STRIPE_SECRET_KEY_INTL');
    if (!stripeKey) throw new Error(`Missing Stripe key for account=${account}`);

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' });
    const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
    const item = sub.items.data[0];
    const currentPrice = item.price;
    if (!currentPrice.recurring) throw new Error('Subscription price has no recurring config');

    const stableProductId = await getOrCreateStableProduct(stripe, account);
    const unitAmount = Math.round(newAmount * 100);
    const newPriceId = await getOrCreatePrice(
      stripe, account, stableProductId, unitAmount, currentPrice.currency,
      currentPrice.recurring.interval, currentPrice.recurring.interval_count,
    );

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: item.id, price: newPriceId }],
      proration_behavior: prorationBehavior,
      metadata: { ...(sub.metadata || {}), last_price_update: new Date().toISOString() },
    });

    log('Updated subscription', { subscriptionId, newPriceId, unitAmount });
    return new Response(JSON.stringify({
      success: true,
      subscriptionId: updated.id,
      newPriceId,
      newAmount,
      currency: currentPrice.currency,
      interval: currentPrice.recurring.interval,
      intervalCount: currentPrice.recurring.interval_count,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('ERROR', { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
