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
    planSlug: 'starter',
    name: 'Starter',
    price: 49,
    period: 'monthly',
    features: [
      'Hasta 50 referencias de vino',
      'Analítica básica de ventas',
      'Formación de sala online',
      'Soporte por email',
      'App móvil para el equipo',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_STARTER',
    stripePriceId: 'price_starter_monthly',
  },
  {
    planSlug: 'professional',
    name: 'Professional',
    price: 99,
    period: 'monthly',
    features: [
      'Hasta 200 referencias de vino',
      'Analítica avanzada + margen por botella',
      'Formación de sala ilimitada',
      'Recomendaciones de maridaje IA',
      'Integraciones con TPV',
      'Soporte prioritario',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_PROFESSIONAL',
    stripePriceId: 'price_professional_monthly',
    highlight: true,
  },
  {
    planSlug: 'professional-annual',
    name: 'Professional Anual',
    price: 990,
    period: 'annual',
    features: [
      'Todo lo de Professional',
      '2 meses gratis (ahorra 198€)',
      'Onboarding personalizado',
      'Consultoría trimestral',
      'Acceso anticipado a novedades',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_PROFESSIONAL_ANNUAL',
    stripePriceId: 'price_professional_annual',
    savings: 'Ahorra 198€',
  },
  {
    planSlug: 'enterprise',
    name: 'Enterprise',
    price: 249,
    period: 'monthly',
    features: [
      'Referencias ilimitadas',
      'Multi-establecimiento',
      'API personalizada',
      'Account manager dedicado',
      'Formación presencial',
      'SLA garantizado',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_ENTERPRISE',
    stripePriceId: 'price_enterprise_monthly',
  },
];

export const getPlanBySlug = (slug: string): Plan | undefined => {
  return plans.find(plan => plan.planSlug === slug);
};
