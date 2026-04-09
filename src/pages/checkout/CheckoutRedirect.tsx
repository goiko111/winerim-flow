import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getCheckoutLink } from '@/lib/checkoutLinks';
import { Loader2 } from 'lucide-react';

const CheckoutRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    getCheckoutLink(code).then((data) => {
      if (!data) {
        setError(true);
        return;
      }

      // Build the checkout URL with short params
      const params = new URLSearchParams();
      if (data.companyName) params.set('cn', data.companyName);
      if (data.vatId) params.set('v', data.vatId);
      if (data.email) params.set('e', data.email);
      if (data.phone) params.set('ph', data.phone);
      if (data.country) params.set('co', data.country);
      if (data.city) params.set('ci', data.city);
      if (data.postalCode) params.set('pc', data.postalCode);
      if (data.address) params.set('a', data.address);
      if (data.paymentMethods.length) params.set('m', data.paymentMethods.join(','));
      if (data.customPrice) params.set('p', String(data.customPrice));
      if (data.billingInterval) params.set('i', data.billingInterval);
      if (data.description) params.set('d', data.description);

      // Forward intl params from the original URL
      const intl = searchParams.get('intl');
      const currency = searchParams.get('currency');
      const lang = searchParams.get('lang');
      if (intl) params.set('intl', intl);
      if (currency) params.set('currency', currency);
      if (lang) params.set('lang', lang);

      navigate(`/checkout/${data.planSlug}?${params.toString()}`, { replace: true });
    });
  }, [code, navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium text-foreground">Enlace no encontrado</p>
          <p className="text-sm text-muted-foreground">Este enlace de pago no es válido o ha expirado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default CheckoutRedirect;
