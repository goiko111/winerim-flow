export type StripeProductKey = 'winerim' | 'tpv' | 'spiritsrim';

export const STRIPE_PRODUCTS: { value: StripeProductKey; label: string }[] = [
  { value: 'winerim', label: 'Suscripción App Winerim' },
  { value: 'tpv', label: 'Suscripción Integración TPV' },
  { value: 'spiritsrim', label: 'Suscripción App Spiritsrim' },
];
