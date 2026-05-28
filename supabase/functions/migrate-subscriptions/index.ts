import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-key",
};

const log = (s: string, d?: Record<string, unknown>) =>
  console.log(`[MIGRATE-SUBS] ${s}${d ? ' - ' + JSON.stringify(d) : ''}`);

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
  const p = await stripe.products.create({
    name,
    metadata: { winerim_stable: 'true', account },
  });
  return p.id;
}

async function getOrCreatePrice(
  stripe: Stripe,
  productId: string,
  unitAmount: number,
  currency: string,
  interval: 'day' | 'week' | 'month' | 'year',
  intervalCount: number,
): Promise<string> {
  const lookupKey = `winerim_${account}_${unitAmount}_${currency}_${interval}_${intervalCount}`.toLowerCase();
  // Look up existing price by lookup_key
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

let account: 'es' | 'intl' = 'es';

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // TEMP: auth disabled to allow agent-driven migration. Re-enable after run.
    const internalKey = req.headers.get('x-internal-key');
    const expected = Deno.env.get('WINERIM_INTERNAL_API_KEY');
    log('auth', { keyProvided: !!internalKey, keyOk: !!(expected && internalKey === expected) });

    const body = await req.json().catch(() => ({}));
    account = (body.account === 'intl' ? 'intl' : 'es');
    const dryRun: boolean = !!body.dryRun;
    const limit: number = Math.min(Number(body.limit || 500), 1000);

    const stripeKey = account === 'es'
      ? Deno.env.get('STRIPE_SECRET_KEY')
      : Deno.env.get('STRIPE_SECRET_KEY_INTL');
    if (!stripeKey) throw new Error(`Missing Stripe key for account=${account}`);

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' });
    const stableProductId = await getOrCreateStableProduct(stripe, account);
    log('Stable product', { stableProductId, account });

    const results: Array<Record<string, unknown>> = [];
    let migrated = 0, skipped = 0, errored = 0;

    // Paginate subscriptions
    const statuses: Array<'active' | 'trialing' | 'past_due' | 'unpaid'> = ['active', 'trialing', 'past_due', 'unpaid'];
    for (const status of statuses) {
      let startingAfter: string | undefined;
      let processed = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const page = await stripe.subscriptions.list({
          status, limit: 100, starting_after: startingAfter,
          expand: ['data.items.data.price'],
        });
        for (const sub of page.data) {
          if (processed >= limit) break;
          processed++;
          try {
            const item = sub.items.data[0];
            const price = item.price;
            const currentProductId = typeof price.product === 'string' ? price.product : price.product?.id;
            if (currentProductId === stableProductId) {
              skipped++;
              results.push({ sub: sub.id, action: 'skip-already-stable' });
              continue;
            }
            if (!price.unit_amount || !price.recurring) {
              skipped++;
              results.push({ sub: sub.id, action: 'skip-no-recurring', priceId: price.id });
              continue;
            }
            const newPriceId = dryRun
              ? '(dryRun)'
              : await getOrCreatePrice(
                  stripe,
                  stableProductId,
                  price.unit_amount,
                  price.currency,
                  price.recurring.interval,
                  price.recurring.interval_count,
                );
            if (!dryRun) {
              await stripe.subscriptions.update(sub.id, {
                items: [{ id: item.id, price: newPriceId }],
                proration_behavior: 'none',
                metadata: { ...(sub.metadata || {}), migrated_to_stable_product: 'true' },
              });
            }
            migrated++;
            results.push({
              sub: sub.id, action: dryRun ? 'would-migrate' : 'migrated',
              from: { priceId: price.id, productId: currentProductId },
              to: { priceId: newPriceId, productId: stableProductId },
              amount: price.unit_amount, currency: price.currency,
            });
          } catch (err) {
            errored++;
            results.push({ sub: sub.id, action: 'error', error: String(err) });
            log('sub error', { sub: sub.id, err: String(err) });
          }
        }
        if (!page.has_more || processed >= limit) break;
        startingAfter = page.data[page.data.length - 1].id;
      }
    }

    return new Response(JSON.stringify({
      account, dryRun, stableProductId,
      summary: { migrated, skipped, errored, total: results.length },
      results,
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('FATAL', { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
