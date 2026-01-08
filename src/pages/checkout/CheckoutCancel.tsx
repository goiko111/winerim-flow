import { Link, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { appConfig } from '@/config/app';
import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { Button } from '@/components/ui/button';

export const CheckoutCancel = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    // Try to go back to the checkout page
    const stored = localStorage.getItem('winerim_checkout_data');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.planSlug) {
        navigate(`/checkout/${data.planSlug}`);
        return;
      }
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center space-y-6 animate-fade-in">
          {/* Cancel icon */}
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-muted-foreground" />
          </div>

          {/* Main message */}
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-3">
              Pago no completado
            </h1>
            <p className="text-lg text-muted-foreground">
              No se ha realizado ningún cargo. Puedes volver a intentarlo cuando quieras.
            </p>
          </div>

          {/* Help section */}
          <div className="card-elevated p-8 text-left space-y-4 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">¿Has tenido algún problema?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Si has encontrado algún error técnico o tienes dudas sobre el proceso de pago, 
                  nuestro equipo está aquí para ayudarte.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Escríbenos a{' '}
                <a href={`mailto:${appConfig.supportEmail}`} className="text-primary hover:underline">
                  {appConfig.supportEmail}
                </a>{' '}
                o llámanos al{' '}
                <a href="tel:+34944000000" className="text-primary hover:underline">
                  +34 944 00 00 00
                </a>
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button onClick={handleRetry} className="btn-wine">
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver a intentar
              </span>
            </Button>
            <Button asChild variant="outline" className="btn-wine-outline">
              <Link to="/">
                Ir al inicio
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutCancel;
