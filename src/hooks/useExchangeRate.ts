import { useState, useEffect } from 'react';

const FALLBACK_RATE = 1.08; // reasonable fallback

/**
 * Round a number to the nearest value ending in 0, 5, or 9.
 * E.g. 162 → 160, 167 → 165, 171 → 169, 1304 → 1305
 */
export function roundToFriendly(value: number): number {
  const targets = [0, 5, 9];
  const base = Math.floor(value / 10) * 10;
  let best = base;
  let bestDist = Math.abs(value - base);

  for (const t of targets) {
    const candidate = base + t;
    const dist = Math.abs(value - candidate);
    if (dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
    // also check base+10 variants
    const candidateUp = base + 10 + t;
    const distUp = Math.abs(value - candidateUp);
    if (distUp < bestDist) {
      best = candidateUp;
      bestDist = distUp;
    }
  }

  return best;
}

export function useExchangeRate() {
  const [rate, setRate] = useState<number>(FALLBACK_RATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem('eur_usd_rate');
    const cachedAt = sessionStorage.getItem('eur_usd_rate_at');
    
    // Use cache if less than 1 hour old
    if (cached && cachedAt && Date.now() - Number(cachedAt) < 3600000) {
      setRate(Number(cached));
      setLoading(false);
      return;
    }

    fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD')
      .then(res => res.json())
      .then(data => {
        if (data?.rates?.USD) {
          const r = data.rates.USD;
          setRate(r);
          sessionStorage.setItem('eur_usd_rate', String(r));
          sessionStorage.setItem('eur_usd_rate_at', String(Date.now()));
        }
      })
      .catch(() => {
        // keep fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const convertToUsd = (eurAmount: number): number => {
    return roundToFriendly(Math.round(eurAmount * rate));
  };

  return { rate, loading, convertToUsd };
}
