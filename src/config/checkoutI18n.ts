export type CheckoutLang = 'es' | 'en' | 'it';

export const checkoutLangLabels: Record<CheckoutLang, string> = {
  es: 'Español',
  en: 'English',
  it: 'Italiano',
};

export const parseCheckoutLang = (value?: string | null): CheckoutLang => {
  const v = (value || '').toLowerCase().slice(0, 2);
  return v === 'en' || v === 'it' ? v : 'es';
};

export interface CheckoutDict {
  // Plan summary
  customOffer: string;
  mostPopular: string;
  includes: string;
  expectedImpact: string;
  plusTax: string;
  periods: Record<string, string>;
  intervalNames: Record<string, string>;
  subscription: string;
  customSubscription: string;
  planFeatures: string[];
  impacts: string[];
  testimonialQuote: string;
  testimonialRole: string;
  // Page
  title: string;
  subtitle: string;
  continueToPayment: string;
  processing: string;
  securePayment: string;
  taxNotice: string;
  legalNotice: string;
  cancelAnytime: string;
  // Toasts / errors
  mustAcceptTerms: string;
  completeForm: string;
  paymentError: string;
  newTabOpened: string;
  // Payment methods
  paymentMethodLabel: string;
  methods: Record<string, { name: string; description: string; note?: string }>;
  // Terms
  termsPrefix: string;
  termsOfService: string;
  and: string;
  privacyPolicy: string;
  termsSuffix: string;
  termsError: string;
  // Form
  companySection: string;
  billingSection: string;
  optionalSection: string;
  companyName: string;
  restaurantName: string;
  vatId: string;
  phone: string;
  email: string;
  country: string;
  selectCountry: string;
  state: string;
  city: string;
  postalCode: string;
  address: string;
  promoCode: string;
  onboardingNotes: string;
  onboardingPlaceholder: string;
  sepaAddressNotice: string;
  errors: {
    companyName: string;
    restaurantName: string;
    vatId: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
    address: string;
  };
}

export const checkoutI18n: Record<CheckoutLang, CheckoutDict> = {
  es: {
    customOffer: 'Oferta personalizada',
    mostPopular: 'Más popular',
    includes: 'Incluye',
    expectedImpact: 'Impacto esperado',
    plusTax: '+ imp.',
    periods: { monthly: 'mes', quarterly: 'trimestre', semestral: 'semestre', annual: 'año', mensual: 'mes', anual: 'año' },
    intervalNames: { monthly: 'Mensual', quarterly: 'Trimestral', semestral: 'Semestral', annual: 'Anual' },
    subscription: 'Suscripción',
    customSubscription: 'Personalizada',
    planFeatures: [
      'Acceso completo a la plataforma',
      'Analítica avanzada de ventas',
      'Formación de sala ilimitada',
      'Recomendaciones de maridaje IA',
      'Soporte prioritario',
    ],
    impacts: [
      'Mayor rotación de carta',
      'Mejor margen por botella',
      'Equipo de sala más preparado',
      'Decisiones basadas en datos',
    ],
    testimonialQuote: 'Con Winerim hemos aumentado un 23% las ventas de vino por mesa. El equipo de sala ahora recomienda con confianza.',
    testimonialRole: 'Directora, Restaurante El Bodegón',
    title: 'Completa tu suscripción',
    subtitle: 'Rellena los datos de facturación para comenzar con',
    continueToPayment: 'Continuar al pago',
    processing: 'Procesando...',
    securePayment: 'Pago seguro con Stripe',
    taxNotice: 'Impuestos no incluidos. Los impuestos aplicables se calcularán en el momento del pago.',
    legalNotice: 'Los cargos se realizarán según el plan seleccionado.',
    cancelAnytime: 'Puedes cancelar en cualquier momento desde tu panel de cliente.',
    mustAcceptTerms: 'Debes aceptar los términos y condiciones',
    completeForm: 'Por favor, completa todos los campos del formulario correctamente',
    paymentError: 'Error al procesar el pago. Por favor, inténtalo de nuevo.',
    newTabOpened: 'Se ha abierto la pasarela de pago en una nueva pestaña',
    paymentMethodLabel: 'Método de pago',
    methods: {
      card: { name: 'Tarjeta de crédito/débito', description: 'Visa, Mastercard, American Express' },
      sepa_debit: { name: 'Domiciliación bancaria (SEPA)', description: 'Cargo directo en cuenta bancaria', note: 'La confirmación de SEPA puede tardar 2-5 días hábiles según el banco.' },
      bank_transfer: { name: 'Transferencia bancaria', description: 'Solo disponible para planes anuales', note: 'Recibirás los datos bancarios por email tras confirmar.' },
      us_bank_account: { name: 'Domiciliación ACH (banco de EE. UU.)', description: 'Cargo directo en cuenta bancaria de EE. UU.', note: 'La confirmación ACH puede tardar 2-4 días hábiles.' },
    },
    termsPrefix: 'He leído y acepto las',
    termsOfService: 'Condiciones de servicio',
    and: 'y la',
    privacyPolicy: 'Política de privacidad',
    termsSuffix: ', y autorizo los cargos recurrentes según el plan contratado.',
    termsError: 'Debes aceptar los términos para continuar',
    companySection: 'Datos de la empresa',
    billingSection: 'Dirección de facturación',
    optionalSection: 'Opcional',
    companyName: 'Razón social / Empresa',
    restaurantName: 'Nombre del restaurante',
    vatId: 'CIF / NIF / VAT',
    phone: 'Teléfono',
    email: 'Email',
    country: 'País',
    selectCountry: 'Selecciona país',
    state: 'Provincia / Estado',
    city: 'Ciudad',
    postalCode: 'Código postal',
    address: 'Dirección',
    promoCode: 'Código promocional',
    onboardingNotes: 'Notas para el onboarding',
    onboardingPlaceholder: 'Cuéntanos más sobre tu negocio, número de mesas, tipo de carta de vinos...',
    sepaAddressNotice: 'La dirección de facturación se solicitará en el siguiente paso como parte del mandato SEPA.',
    errors: {
      companyName: 'El nombre de la empresa es obligatorio',
      restaurantName: 'El nombre del restaurante es obligatorio',
      vatId: 'CIF/NIF/VAT es obligatorio',
      email: 'Email inválido',
      phone: 'Teléfono es obligatorio',
      country: 'País es obligatorio',
      state: 'Provincia/Estado es obligatorio',
      city: 'Ciudad es obligatoria',
      postalCode: 'Código postal es obligatorio',
      address: 'Dirección es obligatoria',
    },
  },
  en: {
    customOffer: 'Custom offer',
    mostPopular: 'Most popular',
    includes: 'Includes',
    expectedImpact: 'Expected impact',
    plusTax: '+ tax',
    periods: { monthly: 'month', quarterly: 'quarter', semestral: 'semester', annual: 'year', mensual: 'month', anual: 'year' },
    intervalNames: { monthly: 'Monthly', quarterly: 'Quarterly', semestral: 'Semi-annual', annual: 'Annual' },
    subscription: 'Subscription',
    customSubscription: 'Custom',
    planFeatures: [
      'Full access to the platform',
      'Advanced sales analytics',
      'Unlimited staff training',
      'AI wine pairing recommendations',
      'Priority support',
    ],
    impacts: [
      'Higher wine list rotation',
      'Better margin per bottle',
      'A better prepared floor team',
      'Data-driven decisions',
    ],
    testimonialQuote: 'With Winerim we increased wine sales per table by 23%. Our floor team now recommends with confidence.',
    testimonialRole: 'Director, El Bodegón Restaurant',
    title: 'Complete your subscription',
    subtitle: 'Fill in your billing details to get started with',
    continueToPayment: 'Continue to payment',
    processing: 'Processing...',
    securePayment: 'Secure payment with Stripe',
    taxNotice: 'Taxes not included. Applicable taxes are calculated at payment time.',
    legalNotice: 'Charges will be made according to the selected plan.',
    cancelAnytime: 'You can cancel at any time from your customer portal.',
    mustAcceptTerms: 'You must accept the terms and conditions',
    completeForm: 'Please complete all form fields correctly',
    paymentError: 'Error processing the payment. Please try again.',
    newTabOpened: 'The payment gateway opened in a new tab',
    paymentMethodLabel: 'Payment method',
    methods: {
      card: { name: 'Credit/Debit Card', description: 'Visa, Mastercard, American Express' },
      sepa_debit: { name: 'SEPA Direct Debit', description: 'Direct debit from your bank account', note: 'SEPA confirmation may take 2-5 business days.' },
      bank_transfer: { name: 'Bank transfer', description: 'Available for annual plans only', note: 'You will receive the bank details by email after confirming.' },
      us_bank_account: { name: 'ACH Direct Debit (US Bank)', description: 'Direct debit from US bank account', note: 'ACH confirmation may take 2-4 business days.' },
    },
    termsPrefix: 'I have read and accept the',
    termsOfService: 'Terms of Service',
    and: 'and the',
    privacyPolicy: 'Privacy Policy',
    termsSuffix: ', and I authorise recurring charges according to the selected plan.',
    termsError: 'You must accept the terms to continue',
    companySection: 'Company details',
    billingSection: 'Billing address',
    optionalSection: 'Optional',
    companyName: 'Legal name / Company',
    restaurantName: 'Restaurant name',
    vatId: 'Tax ID / VAT',
    phone: 'Phone',
    email: 'Email',
    country: 'Country',
    selectCountry: 'Select country',
    state: 'State / Province',
    city: 'City',
    postalCode: 'Postal code',
    address: 'Address',
    promoCode: 'Promo code',
    onboardingNotes: 'Onboarding notes',
    onboardingPlaceholder: 'Tell us more about your business, number of tables, wine list type...',
    sepaAddressNotice: 'The billing address will be requested in the next step as part of the SEPA mandate.',
    errors: {
      companyName: 'Company name is required',
      restaurantName: 'Restaurant name is required',
      vatId: 'Tax ID / VAT is required',
      email: 'Invalid email',
      phone: 'Phone is required',
      country: 'Country is required',
      state: 'State/Province is required',
      city: 'City is required',
      postalCode: 'Postal code is required',
      address: 'Address is required',
    },
  },
  it: {
    customOffer: 'Offerta personalizzata',
    mostPopular: 'Più popolare',
    includes: 'Include',
    expectedImpact: 'Impatto previsto',
    plusTax: '+ imp.',
    periods: { monthly: 'mese', quarterly: 'trimestre', semestral: 'semestre', annual: 'anno', mensual: 'mese', anual: 'anno' },
    intervalNames: { monthly: 'Mensile', quarterly: 'Trimestrale', semestral: 'Semestrale', annual: 'Annuale' },
    subscription: 'Abbonamento',
    customSubscription: 'Personalizzato',
    planFeatures: [
      'Accesso completo alla piattaforma',
      'Analisi avanzata delle vendite',
      'Formazione illimitata per la sala',
      'Consigli di abbinamento con IA',
      'Supporto prioritario',
    ],
    impacts: [
      'Maggiore rotazione della carta',
      'Miglior margine per bottiglia',
      'Team di sala più preparato',
      'Decisioni basate sui dati',
    ],
    testimonialQuote: 'Con Winerim abbiamo aumentato del 23% le vendite di vino per tavolo. Il team di sala ora consiglia con sicurezza.',
    testimonialRole: 'Direttrice, Ristorante El Bodegón',
    title: 'Completa il tuo abbonamento',
    subtitle: 'Inserisci i dati di fatturazione per iniziare con',
    continueToPayment: 'Continua al pagamento',
    processing: 'Elaborazione...',
    securePayment: 'Pagamento sicuro con Stripe',
    taxNotice: 'Imposte escluse. Le imposte applicabili saranno calcolate al momento del pagamento.',
    legalNotice: 'Gli addebiti saranno effettuati secondo il piano selezionato.',
    cancelAnytime: 'Puoi disdire in qualsiasi momento dal tuo pannello cliente.',
    mustAcceptTerms: 'Devi accettare i termini e le condizioni',
    completeForm: 'Completa correttamente tutti i campi del modulo',
    paymentError: 'Errore durante il pagamento. Riprova.',
    newTabOpened: 'Il gateway di pagamento si è aperto in una nuova scheda',
    paymentMethodLabel: 'Metodo di pagamento',
    methods: {
      card: { name: 'Carta di credito/debito', description: 'Visa, Mastercard, American Express' },
      sepa_debit: { name: 'Addebito diretto SEPA', description: 'Addebito diretto sul conto bancario', note: 'La conferma SEPA può richiedere 2-5 giorni lavorativi.' },
      bank_transfer: { name: 'Bonifico bancario', description: 'Disponibile solo per i piani annuali', note: 'Riceverai i dati bancari via email dopo la conferma.' },
      us_bank_account: { name: 'Addebito ACH (banca USA)', description: 'Addebito diretto su conto bancario USA', note: 'La conferma ACH può richiedere 2-4 giorni lavorativi.' },
    },
    termsPrefix: 'Ho letto e accetto le',
    termsOfService: 'Condizioni di servizio',
    and: 'e la',
    privacyPolicy: 'Informativa sulla privacy',
    termsSuffix: ', e autorizzo gli addebiti ricorrenti secondo il piano scelto.',
    termsError: 'Devi accettare i termini per continuare',
    companySection: 'Dati aziendali',
    billingSection: 'Indirizzo di fatturazione',
    optionalSection: 'Opzionale',
    companyName: 'Ragione sociale / Azienda',
    restaurantName: 'Nome del ristorante',
    vatId: 'Partita IVA / VAT',
    phone: 'Telefono',
    email: 'Email',
    country: 'Paese',
    selectCountry: 'Seleziona paese',
    state: 'Provincia / Stato',
    city: 'Città',
    postalCode: 'CAP',
    address: 'Indirizzo',
    promoCode: 'Codice promozionale',
    onboardingNotes: 'Note per l\'onboarding',
    onboardingPlaceholder: 'Raccontaci di più sulla tua attività, numero di tavoli, tipo di carta dei vini...',
    sepaAddressNotice: 'L\'indirizzo di fatturazione sarà richiesto nel passaggio successivo come parte del mandato SEPA.',
    errors: {
      companyName: 'La ragione sociale è obbligatoria',
      restaurantName: 'Il nome del ristorante è obbligatorio',
      vatId: 'Partita IVA / VAT obbligatoria',
      email: 'Email non valida',
      phone: 'Telefono obbligatorio',
      country: 'Paese obbligatorio',
      state: 'Provincia/Stato obbligatorio',
      city: 'Città obbligatoria',
      postalCode: 'CAP obbligatorio',
      address: 'Indirizzo obbligatorio',
    },
  },
};

export const getCheckoutDict = (lang: CheckoutLang): CheckoutDict => checkoutI18n[lang] ?? checkoutI18n.es;
