export interface Plan {
  planSlug: string;
  name: string;
  price: number;
  period: 'monthly' | 'annual';
  features: string[];
  stripePaymentLinkUrl: string;
  stripePriceId?: string;
  highlight?: boolean;
  savings?: string;
}

export const plans: Plan[] = [
  {
    planSlug: 'mensual',
    name: 'Mensual',
    price: 1,
    period: 'monthly',
    features: [
      'Acceso completo a la plataforma',
      'Analítica avanzada de ventas',
      'Formación de sala ilimitada',
      'Recomendaciones de maridaje IA',
      'Integraciones con TPV',
      'Soporte prioritario',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_MENSUAL',
    stripePriceId: 'price_mensual',
  },
  {
    planSlug: 'semestral',
    name: 'Semestral',
    price: 645,
    period: 'annual',
    features: [
      'Todo lo del plan Mensual',
      'Ahorra 105€ (14% descuento)',
      'Onboarding personalizado',
      'Consultoría trimestral',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_SEMESTRAL',
    stripePriceId: 'price_semestral',
    savings: 'Ahorra 105€',
  },
  {
    planSlug: 'anual',
    name: 'Anual',
    price: 990,
    period: 'annual',
    features: [
      'Todo lo del plan Mensual',
      'Ahorra 510€ (34% descuento)',
      'Onboarding personalizado',
      'Consultoría trimestral',
      'Acceso anticipado a novedades',
      'Account manager dedicado',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_ANUAL',
    stripePriceId: 'price_anual',
    savings: 'Ahorra 510€',
    highlight: true,
  },
];

export const getPlanBySlug = (slug: string): Plan | undefined => {
  return plans.find(plan => plan.planSlug === slug);
};
