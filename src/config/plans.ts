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

/** Full feature list included in ALL plans */
export const allPlanFeatures = [
  'Carta digital interactiva con QR y link',
  'Filtros dinámicos y comparador de vinos',
  'Multiidioma automático (4 idiomas)',
  'Maridajes automáticos con IA',
  'Recomendaciones inteligentes vino-plato',
  'Fichas de vino generadas por IA',
  'Analítica avanzada de ventas',
  'KPIs: ticket medio, rotación, margen',
  'Control de stock e inventario',
  'Alertas de stock bajo automáticas',
  'Pricing y análisis de márgenes',
  'Detección de vinos sin rotación',
  'Formación de sala integrada',
  'Decision Center con acciones priorizadas',
  'Integraciones con TPV',
  'Soporte prioritario',
];

export const plans: Plan[] = [
  {
    planSlug: 'mensual',
    name: 'Mensual',
    price: 149,
    period: 'monthly',
    features: [
      'Acceso completo a la plataforma',
      'Todas las funcionalidades incluidas',
      'Soporte prioritario',
      'Sin permanencia',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_MENSUAL',
    stripePriceId: 'price_mensual',
  },
  {
    planSlug: 'semestral',
    name: 'Semestral',
    price: 795,
    period: 'annual',
    features: [
      'Todo lo del plan Mensual',
      'Ahorra 99€ (11% descuento)',
      'Onboarding personalizado',
      'Consultoría trimestral',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_SEMESTRAL',
    stripePriceId: 'price_semestral',
    savings: 'Ahorra 99€',
  },
  {
    planSlug: 'anual',
    name: 'Anual',
    price: 1199,
    period: 'annual',
    features: [
      'Todo lo del plan Mensual',
      'Ahorra 589€ (33% descuento)',
      'Onboarding personalizado',
      'Consultoría trimestral',
      'Acceso anticipado a novedades',
      'Account manager dedicado',
    ],
    stripePaymentLinkUrl: 'https://buy.stripe.com/PLACEHOLDER_ANUAL',
    stripePriceId: 'price_anual',
    savings: 'Ahorra 589€',
    highlight: true,
  },
];
export const getPlanBySlug = (slug: string): Plan | undefined => {
  return plans.find(plan => plan.planSlug === slug);
};
