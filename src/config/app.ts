export const appConfig = {
  // Brand
  brandName: 'Winerim',
  brandClaim: 'La reVINOlución',
  companyLegalName: 'Basque Highlands S.L. (Winerim)',
  
  // Contact
  supportEmail: 'soporte@winerim.com',
  salesEmail: 'ventas@winerim.com',
  supportPhone: '685739010',
  
  // Legal URLs
  termsUrl: '/legal/condiciones',
  privacyUrl: '/legal/privacidad',
  
  // Integration mode: 'payment-link' | 'checkout-session'
  integrationMode: 'payment-link' as const,
  
  // API endpoints (for checkout-session mode)
  apiEndpoints: {
    createCheckoutSession: '/api/stripe/create-checkout-session',
    createCustomer: '/api/stripe/create-customer',
    createSubscription: '/api/stripe/create-subscription',
    subscriptionStatus: '/api/stripe/subscription-status',
  },
  
  // Stripe config
  stripe: {
    // Payment methods to enable
    paymentMethods: ['card', 'sepa_debit'] as const,
    // Enable bank transfer for annual/enterprise only
    enableBankTransferForAnnual: true,
  },
};

export type IntegrationMode = typeof appConfig.integrationMode;
export type PaymentMethod = typeof appConfig.stripe.paymentMethods[number] | 'bank_transfer';
