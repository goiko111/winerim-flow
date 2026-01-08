import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Shield, Lock } from 'lucide-react';
import { getPlanBySlug } from '@/config/plans';
import { appConfig, PaymentMethod } from '@/config/app';
import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { PlanSummaryCard } from '@/components/checkout/PlanSummaryCard';
import { CompanyForm, CompanyFormData } from '@/components/checkout/CompanyForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { TermsCheckbox } from '@/components/checkout/TermsCheckbox';
import { Button } from '@/components/ui/button';

export const CheckoutPage = () => {
  const { planSlug } = useParams<{ planSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData | null>(null);

  const plan = planSlug ? getPlanBySlug(planSlug) : undefined;

  // Parse prefill data from URL
  const prefillData = searchParams.get('prefill')
    ? JSON.parse(decodeURIComponent(searchParams.get('prefill')!))
    : undefined;

  useEffect(() => {
    if (!plan) {
      navigate('/');
    }
  }, [plan, navigate]);

  if (!plan) {
    return null;
  }

  const showBankTransfer =
    appConfig.stripe.enableBankTransferForAnnual &&
    (plan.period === 'annual' || plan.planSlug === 'enterprise');

  const handleFormSubmit = (data: CompanyFormData) => {
    setFormData(data);
  };

  const handlePaymentClick = async () => {
    // Trigger form validation
    const form = document.getElementById('company-form') as HTMLFormElement;
    form?.requestSubmit();

    // Check terms
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setTermsError(false);

    if (!formData) return;

    setIsSubmitting(true);

    try {
      if (appConfig.integrationMode === 'payment-link') {
        // MODE 1: Redirect to Stripe Payment Link
        // Save form data to localStorage for retrieval after payment
        localStorage.setItem('winerim_checkout_data', JSON.stringify({
          ...formData,
          planSlug: plan.planSlug,
          paymentMethod,
          timestamp: Date.now(),
        }));

        // Build URL with prefill parameters (Stripe Payment Links support some prefill)
        const paymentUrl = new URL(plan.stripePaymentLinkUrl);
        paymentUrl.searchParams.set('prefilled_email', formData.email);
        
        // Redirect to payment
        window.location.href = paymentUrl.toString();
      } else {
        // MODE 2: Create Checkout Session via API
        // This is prepared for backend integration
        const response = await fetch(appConfig.apiEndpoints.createCheckoutSession, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: plan.stripePriceId,
            customerData: formData,
            paymentMethods: paymentMethod === 'sepa_debit' 
              ? ['sepa_debit', 'card'] 
              : ['card'],
            successUrl: `${window.location.origin}/checkout/success`,
            cancelUrl: `${window.location.origin}/checkout/cancel`,
            // Stripe Checkout Session options:
            mode: 'subscription',
            billing_address_collection: 'required',
            tax_id_collection: { enabled: true },
            customer_creation: 'always',
          }),
        });

        const { sessionUrl } = await response.json();
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
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
            <PlanSummaryCard plan={plan} />
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
              <CompanyForm 
                onSubmit={handleFormSubmit} 
                defaultValues={prefillData}
                isSubmitting={isSubmitting}
              />

              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
                showBankTransfer={showBankTransfer}
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
