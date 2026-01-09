import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Shield, Lock, Check, TrendingUp, Users, BarChart3, Sparkles, Wine, Clock, HeadphonesIcon, CreditCard } from 'lucide-react';
import { getPlanBySlug, Plan } from '@/config/plans';
import { appConfig, PaymentMethod } from '@/config/app';
import { CompanyForm, CompanyFormData } from '@/components/checkout/CompanyForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { TermsCheckbox } from '@/components/checkout/TermsCheckbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import winerimIcon from '@/assets/winerim-icon.png';

// Interval labels for custom plans
const INTERVAL_LABELS: Record<string, string> = {
  'monthly': 'Mensual',
  'quarterly': 'Trimestral', 
  'semestral': 'Semestral',
  'annual': 'Anual',
};

export const CheckoutPage = () => {
  const { planSlug } = useParams<{ planSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL parameters first (needed for initial state)
  const customPrice = searchParams.get('customPrice') 
    ? parseFloat(searchParams.get('customPrice')!) 
    : null;
  const customDescription = searchParams.get('customDesc') 
    ? decodeURIComponent(searchParams.get('customDesc')!) 
    : null;
  const billingInterval = searchParams.get('interval') || null;
  const allowedMethods = searchParams.get('methods')?.split(',') || null;

  // Parse prefill data from URL
  const prefillData = searchParams.get('prefill')
    ? JSON.parse(decodeURIComponent(searchParams.get('prefill')!))
    : undefined;
  
  // Default to card unless URL specifies only sepa_debit
  const initialPaymentMethod = allowedMethods?.length === 1 && allowedMethods[0] === 'sepa_debit' 
    ? 'sepa_debit' as PaymentMethod 
    : 'card' as PaymentMethod;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Determine if we should hide address fields (SEPA will ask for them in Stripe)
  const hideAddressFields = paymentMethod === 'sepa_debit';

  // Determine if this is a custom checkout (from quick link generator)
  const isCustomCheckout = planSlug === 'custom' && customPrice;

  // Get base plan or create custom plan
  const basePlan = planSlug && planSlug !== 'custom' ? getPlanBySlug(planSlug) : null;

  // Build effective plan
  const effectivePlan: Plan | null = isCustomCheckout
    ? {
        planSlug: 'custom',
        name: customDescription 
          ? `Suscripción ${INTERVAL_LABELS[billingInterval || 'monthly'] || 'Personalizada'} — ${customDescription}`
          : `Suscripción ${INTERVAL_LABELS[billingInterval || 'monthly'] || 'Personalizada'}`,
        price: customPrice,
        period: billingInterval === 'annual' ? 'annual' : 'monthly',
        features: [
          'Acceso completo a la plataforma',
          'Analítica avanzada de ventas',
          'Formación de sala ilimitada',
          'Recomendaciones de maridaje IA',
          'Soporte prioritario',
        ],
        stripePaymentLinkUrl: '',
      }
    : basePlan
      ? {
          ...basePlan,
          price: customPrice ?? basePlan.price,
          name: customDescription ? `${basePlan.name} — ${customDescription}` : basePlan.name,
        }
      : null;

  useEffect(() => {
    if (!effectivePlan) {
      navigate('/');
    }
  }, [effectivePlan, navigate]);

  if (!effectivePlan) {
    return null;
  }

  // Determine which payment methods to show
  const showBankTransfer = allowedMethods 
    ? allowedMethods.includes('bank_transfer')
    : appConfig.stripe.enableBankTransferForAnnual &&
      (effectivePlan.period === 'annual' || effectivePlan.planSlug === 'enterprise');

  // Hide payment method selector if only specific methods are allowed from URL
  const showPaymentSelector = !allowedMethods || allowedMethods.length > 1;

  const handleFormChange = (data: Partial<CompanyFormData>, isValid: boolean) => {
    if (isValid) {
      setFormData(data as CompanyFormData);
    }
    setIsFormValid(isValid);
  };

  const handleFormSubmit = (data: CompanyFormData) => {
    setFormData(data);
    setIsFormValid(true);
  };

  const sendErrorNotification = async (context: string, error: unknown, data?: CompanyFormData) => {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await supabase.functions.invoke('send-payment-notification', {
        body: {
          isError: true,
          errorMessage,
          errorContext: context,
          customerEmail: data?.email || formData?.email || '',
          restaurantName: data?.restaurantName || formData?.restaurantName || '',
          companyName: data?.companyName || formData?.companyName || '',
          planName: customDescription || effectivePlan.planSlug || '',
        },
      });
      console.log('Error notification sent');
    } catch (notifyError) {
      console.error('Failed to send error notification:', notifyError);
    }
  };

  const handlePaymentClick = async () => {
    // Check terms first
    if (!termsAccepted) {
      setTermsError(true);
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }
    setTermsError(false);

    // Validate form data exists and is valid
    if (!formData || !isFormValid) {
      toast.error('Por favor, completa todos los campos del formulario correctamente');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save form data to localStorage for retrieval after payment
      localStorage.setItem('winerim_checkout_data', JSON.stringify({
        ...formData,
        planSlug: effectivePlan.planSlug,
        customPrice: customPrice,
        customDescription: customDescription,
        billingInterval,
        paymentMethod,
        timestamp: Date.now(),
      }));

      // Create Checkout Session via Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planSlug: effectivePlan.planSlug,
          customPrice: customPrice || effectivePlan.price,
          customDescription: customDescription,
          billingInterval: billingInterval || (effectivePlan.period === 'annual' ? 'annual' : 'monthly'),
          paymentMethods: allowedMethods || [paymentMethod],
          customerData: formData,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        await sendErrorNotification('Error al crear sesión de Stripe Checkout', error, formData);
        throw new Error(error.message || 'Error al crear la sesión de pago');
      }

      if (data?.sessionUrl) {
        // Open Stripe checkout in a new tab to avoid iframe restrictions
        window.open(data.sessionUrl, '_blank');
        setIsSubmitting(false);
        toast.success('Se ha abierto la pasarela de pago en una nueva pestaña');
      } else {
        const noUrlError = new Error('No se recibió la URL de pago');
        await sendErrorNotification('Stripe no devolvió URL de checkout', noUrlError, formData);
        throw noUrlError;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Error al procesar el pago. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  // Value proposition blocks
  const valueBlocks = [
    {
      icon: Wine,
      title: 'Venta guiada en mesa',
      description: 'Tu carta de vinos se convierte en una herramienta de venta que aumenta el ticket medio.',
    },
    {
      icon: Users,
      title: 'Sumiller digital',
      description: 'Tu equipo de sala recomienda con confianza, sin necesidad de ser expertos en vino.',
    },
    {
      icon: BarChart3,
      title: 'Control de bodega',
      description: 'Visibilidad total del stock, rotación y márgenes. Menos vino muerto, más rentabilidad.',
    },
    {
      icon: TrendingUp,
      title: 'Decisiones inteligentes',
      description: 'Analítica de ventas que te dice qué vinos funcionan y cuáles rotar.',
    },
  ];

  // Trust logos (placeholders)
  const trustLogos = [
    'Restaurante El Bodegón',
    'Grupo La Viña',
    'Taberna del Mar',
    'Casa Martínez',
    'La Tasca Premium',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src={winerimIcon} alt="Winerim" className="w-9 h-9 object-contain" />
              <span className="font-display text-xl font-semibold text-foreground">
                {appConfig.brandName}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="hidden sm:flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Pago seguro
              </span>
              <a 
                href={`tel:${appConfig.supportPhone}`}
                className="hover:text-foreground transition-colors"
              >
                {appConfig.supportPhone}
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-light to-background py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              {/* Left: Hero copy */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-tight text-balance">
                    Estás a un paso de convertir tu carta de vinos en una{' '}
                    <span className="text-primary">máquina de vender más</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl">
                    Winerim es la plataforma de inteligencia que aumenta ventas, márgenes y rotación de vino en restaurantes.
                  </p>
                </div>

                {/* Impact bullets */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">+15–30%</p>
                      <p className="text-sm text-muted-foreground">en ventas de vino</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">Más margen</p>
                      <p className="text-sm text-muted-foreground">y mejor rotación</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                      <Wine className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">Menos stock</p>
                      <p className="text-sm text-muted-foreground">muerto</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Plan Summary Card */}
              <div className="lg:sticky lg:top-24">
                <div className="card-elevated p-6 sm:p-8 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {(isCustomCheckout || customPrice) && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full mb-3">
                          <Sparkles className="w-3 h-3" />
                          Oferta personalizada
                        </span>
                      )}
                      {!isCustomCheckout && !customPrice && effectivePlan.highlight && (
                        <span className="inline-flex text-xs font-medium uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full mb-3">
                          Más popular
                        </span>
                      )}
                      <h2 className="font-display text-xl font-semibold text-foreground">
                        {effectivePlan.name}
                      </h2>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-3xl font-display font-bold text-primary">
                        {effectivePlan.price}€
                      </p>
                      <p className="text-sm text-muted-foreground">
                        /{effectivePlan.period === 'monthly' ? 'mes' : 'año'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Tu plan incluye
                    </p>
                    <ul className="space-y-2.5">
                      {effectivePlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm text-foreground/80">
                          <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {effectivePlan.savings && (
                    <div className="bg-success/5 text-success text-sm font-medium px-4 py-3 rounded-lg text-center">
                      {effectivePlan.savings}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-12 lg:py-16 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                Qué estás contratando realmente
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                No es una carta digital. Es una plataforma de inteligencia comercial para tu bodega.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {valueBlocks.map((block, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl gradient-wine text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <block.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {block.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {block.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-10 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Restaurantes que ya venden más vino con Winerim
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {trustLogos.map((logo, index) => (
                  <span 
                    key={index} 
                    className="text-sm font-medium text-foreground/50 hover:text-foreground/70 transition-colors"
                  >
                    {logo}
                  </span>
                ))}
              </div>
              
              {/* Testimonial */}
              <div className="max-w-2xl mx-auto pt-6">
                <blockquote className="text-lg text-foreground/80 italic">
                  "Con Winerim hemos aumentado un 23% las ventas de vino por mesa. El equipo de sala ahora recomienda con confianza."
                </blockquote>
                <div className="mt-4">
                  <p className="font-medium text-foreground">María González</p>
                  <p className="text-sm text-muted-foreground">Directora, Restaurante El Bodegón</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Checkout Form Section */}
        <section className="py-12 lg:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-2">
                Completa tus datos y empieza la <span className="text-primary">reVINOlución</span>
              </h2>
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Tardarás menos de 2 minutos
              </p>
            </div>

            <div className="card-elevated p-6 sm:p-8 space-y-8">
              {/* Payment method selector FIRST */}
              {showPaymentSelector && (
                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  showBankTransfer={showBankTransfer}
                />
              )}

              {/* Company form - will show/hide address based on payment method */}
              <CompanyForm 
                onSubmit={handleFormSubmit}
                onFormChange={handleFormChange}
                defaultValues={prefillData}
                isSubmitting={isSubmitting}
                hideAddressFields={hideAddressFields}
              />

              <TermsCheckbox
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(checked);
                  if (checked) setTermsError(false);
                }}
                error={termsError}
              />

              <Button
                onClick={handlePaymentClick}
                disabled={isSubmitting}
                className="btn-wine w-full text-base h-14"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continuar al pago
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              {/* Security & Trust badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Pago seguro con Stripe</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Cancela cuando quieras</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <HeadphonesIcon className="w-4 h-4 text-primary" />
                  <span>Onboarding incluido</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src={winerimIcon} alt="Winerim" className="w-6 h-6 object-contain" />
                <span className="text-sm text-muted-foreground">
                  {appConfig.companyLegalName}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a 
                  href={appConfig.termsUrl} 
                  className="hover:text-foreground transition-colors"
                >
                  Términos y Condiciones
                </a>
                <a 
                  href={appConfig.privacyUrl} 
                  className="hover:text-foreground transition-colors"
                >
                  Política de Privacidad
                </a>
                <a 
                  href={`mailto:${appConfig.supportEmail}`}
                  className="hover:text-foreground transition-colors"
                >
                  {appConfig.supportEmail}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default CheckoutPage;
