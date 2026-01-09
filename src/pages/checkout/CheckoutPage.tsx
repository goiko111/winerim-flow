import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Shield, Lock } from 'lucide-react';
import { getPlanBySlug, Plan } from '@/config/plans';
import { appConfig, PaymentMethod } from '@/config/app';
import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { PlanSummaryCard } from '@/components/checkout/PlanSummaryCard';
import { CompanyForm, CompanyFormData } from '@/components/checkout/CompanyForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { TermsCheckbox } from '@/components/checkout/TermsCheckbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // Parse URL parameters (support both old and new format)
  const customPrice = searchParams.get('price') 
    ? parseFloat(searchParams.get('price')!) 
    : searchParams.get('customPrice')
      ? parseFloat(searchParams.get('customPrice')!)
      : null;
  const customDescription = searchParams.get('desc') 
    ? decodeURIComponent(searchParams.get('desc')!) 
    : searchParams.get('customDesc')
      ? decodeURIComponent(searchParams.get('customDesc')!)
      : null;
  const billingInterval = searchParams.get('interval') || null;
  const allowedMethods = searchParams.get('methods')?.split(',') || null;

  // Parse prefill data from URL (support both old JSON format and new individual params)
  const prefillData = searchParams.get('prefill')
    ? JSON.parse(decodeURIComponent(searchParams.get('prefill')!))
    : {
        companyName: searchParams.get('cn') || undefined,
        vatId: searchParams.get('vat') || undefined,
        email: searchParams.get('email') || undefined,
        phone: searchParams.get('phone') || undefined,
        country: searchParams.get('country') || undefined,
        city: searchParams.get('city') || undefined,
        postalCode: searchParams.get('pc') || undefined,
        address: searchParams.get('addr') || undefined,
      };
  
  // Clean undefined values from prefillData
  const cleanedPrefillData = Object.fromEntries(
    Object.entries(prefillData).filter(([_, v]) => v !== undefined)
  );
  
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

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left column: Plan summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PlanSummaryCard plan={effectivePlan} isCustom={Boolean(isCustomCheckout || customPrice)} />
          </div>

          {/* Right column: Form */}
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
                Completa tu suscripción
              </h1>
              <p className="text-muted-foreground">
                Rellena los datos de facturación para comenzar con {appConfig.brandName}.
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
                defaultValues={Object.keys(cleanedPrefillData).length > 0 ? cleanedPrefillData : undefined}
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

              {/* Security badges */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  256-bit SSL
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Pago seguro con Stripe
                </span>
              </div>
            </div>

            {/* Legal footer */}
            <p className="text-xs text-center text-muted-foreground">
              {appConfig.companyLegalName} · Los cargos se realizarán según el plan seleccionado.
              <br />
              Puedes cancelar en cualquier momento desde tu panel de cliente.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
