import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail, Calendar } from 'lucide-react';
import { appConfig } from '@/config/app';
import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutData {
  companyName?: string;
  restaurantName?: string;
  email?: string;
  planSlug?: string;
  customPrice?: number;
  customDescription?: string;
  billingInterval?: string;
  paymentMethod?: string;
}

export const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const notificationSentRef = useRef(false);

  useEffect(() => {
    // Skip if already sent notification
    if (notificationSentRef.current) return;
    
    const stored = localStorage.getItem('winerim_checkout_data');
    const sessionId = searchParams.get('session_id');
    
    if (stored && sessionId) {
      const data = JSON.parse(stored);
      setCheckoutData(data);
      
      // Mark as sent BEFORE making the call to prevent duplicates
      notificationSentRef.current = true;
      
      // Send payment notification email
      sendPaymentNotification(sessionId, data).finally(() => {
        // Only clean up localStorage after notification attempt completes
        localStorage.removeItem('winerim_checkout_data');
      });
    } else if (stored) {
      // If we have data but no session_id, still show the data
      const data = JSON.parse(stored);
      setCheckoutData(data);
    }
  }, [searchParams]);

  const sendPaymentNotification = async (sessionId: string, data: CheckoutData) => {
    try {
      const intervalLabels: Record<string, string> = {
        'monthly': 'Mensual',
        'quarterly': 'Trimestral',
        'semestral': 'Semestral',
        'annual': 'Anual',
      };

      const response = await supabase.functions.invoke('send-payment-notification', {
        body: {
          sessionId,
          customerEmail: data.email || '',
          customerName: data.companyName || '',
          restaurantName: data.restaurantName || '',
          companyName: data.companyName || '',
          planName: data.customDescription || data.planSlug || 'Suscripción Winerim',
          amount: data.customPrice || 0,
          currency: 'eur',
          paymentMethod: data.paymentMethod || 'card',
          billingInterval: intervalLabels[data.billingInterval || 'monthly'] || 'Mensual',
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Error enviando notificación');
      }
      
      console.log('Payment notification sent successfully');
    } catch (error) {
      console.error('Failed to send payment notification:', error);
      // Send error notification
      await sendErrorNotification('Error al enviar notificación de pago exitoso', error, data);
    }
  };

  const sendErrorNotification = async (context: string, error: unknown, data?: CheckoutData) => {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await supabase.functions.invoke('send-payment-notification', {
        body: {
          isError: true,
          errorMessage,
          errorContext: context,
          customerEmail: data?.email || '',
          restaurantName: data?.restaurantName || '',
          companyName: data?.companyName || '',
          planName: data?.customDescription || data?.planSlug || '',
        },
      });
      console.log('Error notification sent');
    } catch (notifyError) {
      console.error('Failed to send error notification:', notifyError);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center space-y-6 animate-fade-in">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>

          {/* Main message */}
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-3">
              ¡Bienvenido a {appConfig.brandName}!
            </h1>
            <p className="text-lg text-muted-foreground">
              {checkoutData?.companyName 
                ? `Tu suscripción para ${checkoutData.companyName} está activa.`
                : 'Tu suscripción está activa y lista para empezar.'
              }
            </p>
          </div>

          {/* Next steps */}
          <div className="card-elevated p-8 text-left space-y-6 mt-8">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Próximos pasos
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Revisa tu email</p>
                  <p className="text-sm text-muted-foreground">
                    Te hemos enviado un email a {checkoutData?.email || 'tu dirección'} con las instrucciones de acceso.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Onboarding personalizado</p>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas para programar tu sesión de bienvenida.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                ¿Tienes alguna duda? Escríbenos a{' '}
                <a href={`mailto:${appConfig.supportEmail}`} className="text-primary hover:underline">
                  {appConfig.supportEmail}
                </a>
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild className="btn-wine">
              <a href="https://app.winerim.com" className="flex items-center gap-2">
                Ir al panel
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="btn-wine-outline">
              <Link to="/">
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutSuccess;
