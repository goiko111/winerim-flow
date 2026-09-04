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
import { parseCheckoutLang, getCheckoutDict } from '@/config/checkoutI18n';

export const CheckoutPage = () => {
  const { planSlug } = useParams<{ planSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL parameters (support both old and new format)
  const customPrice = searchParams.get('p')
    ? parseFloat(searchParams.get('p')!)
    : searchParams.get('price') 
      ? parseFloat(searchParams.get('price')!) 
      : searchParams.get('customPrice')
        ? parseFloat(searchParams.get('customPrice')!)
        : null;
  const customDescription = searchParams.get('d')
    ? decodeURIComponent(searchParams.get('d')!)
    : searchParams.get('desc') 
      ? decodeURIComponent(searchParams.get('desc')!) 
      : searchParams.get('customDesc')
        ? decodeURIComponent(searchParams.get('customDesc')!)
        : null;
  const billingInterval = searchParams.get('i') || searchParams.get('interval') || null;
  const winerimUserId = searchParams.get('uid') ? Number(searchParams.get('uid')) : null;
  const allowedMethods = (searchParams.get('m') || searchParams.get('methods'))?.split(',') || null;
  const isIntl = searchParams.get('intl') === '1';
  const intlCurrency = searchParams.get('currency') || 'EUR';
  const lang = parseCheckoutLang(searchParams.get('lang'));
  const t = getCheckoutDict(lang);
  const INTERVAL_LABELS = t.intervalNames;

  // Parse prefill data from URL (support short, medium, and legacy params)
  const prefillData = searchParams.get('prefill')
    ? JSON.parse(decodeURIComponent(searchParams.get('prefill')!))
    : {
        companyName: searchParams.get('cn') || undefined,
        vatId: searchParams.get('v') || searchParams.get('vat') || undefined,
        email: searchParams.get('e') || searchParams.get('email') || undefined,
        phone: searchParams.get('ph') || searchParams.get('phone') || undefined,
        country: searchParams.get('co') || searchParams.get('country') || undefined,
        city: searchParams.get('ci') || searchParams.get('city') || undefined,
        postalCode: searchParams.get('pc') || undefined,
        address: searchParams.get('a') || searchParams.get('addr') || undefined,
      };
  
  // Clean undefined values from prefillData
  const cleanedPrefillData = Object.fromEntries(
    Object.entries(prefillData).filter(([_, v]) => v !== undefined)
  );
  
  // Default to card; for intl with only us_bank_account, default to that
  const initialPaymentMethod = allowedMethods?.length === 1 && allowedMethods[0] === 'sepa_debit' 
    ? 'sepa_debit' as PaymentMethod 
    : allowedMethods?.length === 1 && allowedMethods[0] === 'us_bank_account'
      ? 'us_bank_account' as PaymentMethod
      : 'card' as PaymentMethod;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Determine if we should hide address fields (SEPA will ask for them in Stripe)
  const hideAddressFields = paymentMethod === 'sepa_debit';

  // Determine if this is a custom checkout (from quick link generator or with custom params)
  const isCustomCheckout = planSlug === 'custom' && customPrice;
  const hasCustomParams = customPrice !== null || billingInterval !== null;

  // Get base plan or create custom plan
  const basePlan = planSlug && planSlug !== 'custom' ? getPlanBySlug(planSlug) : null;

  // Determine effective period based on billing interval parameter
  const getEffectivePeriod = (): 'monthly' | 'annual' => {
    if (billingInterval) {
      return billingInterval === 'annual' ? 'annual' : 'monthly';
    }
    return basePlan?.period || 'monthly';
  };

  // Build effective plan
  const effectivePlan: Plan | null = isCustomCheckout
    ? {
        planSlug: 'custom',
        name: customDescription 
          ? `${t.subscription} ${INTERVAL_LABELS[billingInterval || 'monthly'] || t.customSubscription} — ${customDescription}`
          : `${t.subscription} ${INTERVAL_LABELS[billingInterval || 'monthly'] || t.customSubscription}`,
        price: customPrice,
        period: getEffectivePeriod(),
        features: t.planFeatures,
        stripePaymentLinkUrl: '',
      }
    : basePlan
      ? {
          ...basePlan,
          price: customPrice ?? basePlan.price,
          name: hasCustomParams && customDescription 
            ? `${t.subscription} ${INTERVAL_LABELS[billingInterval || basePlan.period] || basePlan.name} — ${customDescription}`
            : hasCustomParams && billingInterval
              ? `${t.subscription} ${INTERVAL_LABELS[billingInterval]}`
              : customDescription 
                ? `${basePlan.name} — ${customDescription}` 
                : basePlan.name,
          period: getEffectivePeriod(),
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
          account: window.location.hostname.includes('checkout.winerim') ? 'intl' : 'es',
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
      toast.error(t.mustAcceptTerms);
      return;
    }
    setTermsError(false);

    // Validate form data exists and is valid
    if (!formData || !isFormValid) {
      toast.error(t.completeForm);
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
      const edgeFn = isIntl ? 'create-checkout-intl' : 'create-checkout';
      const bodyPayload: Record<string, unknown> = {
        planSlug: effectivePlan.planSlug,
        customPrice: customPrice || effectivePlan.price,
        customDescription: customDescription,
        billingInterval: billingInterval || (effectivePlan.period === 'annual' ? 'annual' : 'monthly'),
        paymentMethods: [paymentMethod],
        customerData: formData,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout/cancel`,
        ...(winerimUserId && { winerimUserId }),
      };
      if (isIntl) {
        bodyPayload.price = customPrice || effectivePlan.price;
        bodyPayload.currency = intlCurrency;
        bodyPayload.description = customDescription || undefined;
      }
      // Open the window synchronously during the user gesture — iOS Safari blocks window.open() after await
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.documentElement.innerHTML = `<head><meta charset="utf-8"><title>Cargando pago...</title><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#f9fafb;color:#374151}p{font-size:1.1rem;margin-top:1rem}.spinner{width:40px;height:40px;border:3px solid #e5e7eb;border-top-color:#6366f1;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div class="spinner"></div><p>Preparando pasarela de pago…</p></body>`;
      }

      const { data, error } = await supabase.functions.invoke(edgeFn, {
        body: bodyPayload,
      });

      if (error) {
        newTab?.close();
        console.error('Edge function error:', error);
        await sendErrorNotification('Error al crear sesión de Stripe Checkout', error, formData);
        throw new Error(error.message || 'Error al crear la sesión de pago');
      }

      if (data?.sessionUrl) {
        if (newTab) {
          newTab.location.href = data.sessionUrl;
        } else {
          window.location.href = data.sessionUrl;
        }
        setIsSubmitting(false);
        toast.success(t.newTabOpened);
      } else {
        const noUrlError = new Error('No se recibió la URL de pago');
        await sendErrorNotification('Stripe no devolvió URL de checkout', noUrlError, formData);
        throw noUrlError;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(t.paymentError);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader lang={lang} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left column: Plan summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PlanSummaryCard plan={effectivePlan} isCustom={Boolean(isCustomCheckout || customPrice)} isIntl={isIntl} billingInterval={billingInterval} currency={isIntl ? intlCurrency : null} lang={lang} />
          </div>

          {/* Right column: Form */}
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
                {t.title}
              </h1>
              <p className="text-muted-foreground">
                {t.subtitle} {appConfig.brandName}.
              </p>
            </div>

            <div className="card-elevated p-6 sm:p-8 space-y-8">
              {/* Payment method selector FIRST */}
              {showPaymentSelector && (
                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  showBankTransfer={showBankTransfer}
                  isIntl={isIntl}
                  lang={lang}
                />
              )}

              {/* Company form - will show/hide address based on payment method */}
              <CompanyForm 
                onSubmit={handleFormSubmit}
                onFormChange={handleFormChange}
                defaultValues={Object.keys(cleanedPrefillData).length > 0 ? cleanedPrefillData : undefined}
                isSubmitting={isSubmitting}
                hideAddressFields={hideAddressFields}
                lang={lang}
              />

              <TermsCheckbox
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(checked);
                  if (checked) setTermsError(false);
                }}
                error={termsError}
                lang={lang}
              />

              <Button
                onClick={handlePaymentClick}
                disabled={isSubmitting}
                className="btn-wine w-full text-base h-14"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.processing}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t.continueToPayment}
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
                  {t.securePayment}
                </span>
              </div>
            </div>

            {/* Legal footer */}
            {!isIntl && (
              <p className="text-xs text-center text-muted-foreground">
                {t.taxNotice}
              </p>
            )}
            <p className="text-xs text-center text-muted-foreground">
              {appConfig.companyLegalName} · {t.legalNotice}
              <br />
              {t.cancelAnytime}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
