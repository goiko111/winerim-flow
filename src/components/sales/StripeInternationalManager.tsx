import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Mail, 
  Phone, 
  Send, 
  Calendar,
  Loader2,
  RefreshCw,
  Plus,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Globe,
  Banknote,
  ExternalLink,
  Copy,
  Link,
} from 'lucide-react';
import { BILLING_INTERVALS, getIntervalLabel } from '@/config/bankDetails';
import { Customer } from '@/lib/salesStore';
interface StripeIntlSubscription {
  id: string;
  customer_name: string;
  company_name: string;
  vat_id: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  plan_name: string;
  plan_slug: string;
  amount: number;
  currency: string;
  billing_interval: string;
  payment_method: string;
  description: string | null;
  next_billing_date: string;
  last_billed_date: string | null;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_by: string;
  created_at: string;
}

interface StripeIntlPaymentRequest {
  id: string;
  proforma_number: string;
  amount: number;
  currency: string;
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  status: string;
  sent_at: string | null;
  paid_at: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
}

interface StripeInternationalManagerProps {
  customers: Customer[];
  currentUser: string;
}

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'MXN', label: 'MXN ($)', symbol: '$' },
  { value: 'COP', label: 'COP ($)', symbol: '$' },
  { value: 'ARS', label: 'ARS ($)', symbol: '$' },
  { value: 'CLP', label: 'CLP ($)', symbol: '$' },
  { value: 'PEN', label: 'PEN (S/)', symbol: 'S/' },
];

const COUNTRIES = [
  { value: 'US', label: 'Estados Unidos' },
  { value: 'MX', label: 'México' },
  { value: 'CO', label: 'Colombia' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'GB', label: 'Reino Unido' },
  { value: 'DE', label: 'Alemania' },
  { value: 'FR', label: 'Francia' },
  { value: 'IT', label: 'Italia' },
  { value: 'PT', label: 'Portugal' },
  { value: 'BR', label: 'Brasil' },
  { value: 'OTHER', label: 'Otro' },
];

const PAYMENT_METHODS = [
  { value: 'card', label: 'Tarjeta de crédito' },
  { value: 'sepa_debit', label: 'SEPA Direct Debit' },
  { value: 'us_bank_account', label: 'ACH (US Bank)' },
  { value: 'link', label: 'Link (Stripe)' },
];

export const StripeInternationalManager = ({ customers, currentUser }: StripeInternationalManagerProps) => {
  const [subscriptions, setSubscriptions] = useState<StripeIntlSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<Record<string, StripeIntlPaymentRequest[]>>({});
  
  // Form state for new subscription
  const [formData, setFormData] = useState({
    customerId: '',
    planName: '',
    planSlug: '',
    amount: '',
    currency: 'USD',
    billingInterval: 'monthly',
    paymentMethod: 'card',
    country: 'US',
    description: '',
    nextBillingDate: new Date().toISOString().split('T')[0],
  });

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stripe_international_subscriptions')
        .select('*')
        .order('next_billing_date', { ascending: true });
      
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchPaymentHistory = async (subscriptionId: string) => {
    try {
      const { data, error } = await supabase
        .from('stripe_international_payment_requests')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setSelectedPayments(prev => ({ ...prev, [subscriptionId]: data || [] }));
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handleCreateSubscription = async () => {
    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (!formData.planName || !formData.amount) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      const { error } = await supabase.from('stripe_international_subscriptions').insert({
        customer_name: customer.name,
        company_name: customer.companyName,
        vat_id: customer.vatId,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postalCode,
        country: formData.country,
        plan_name: formData.planName,
        plan_slug: formData.planSlug || formData.planName.toLowerCase().replace(/\s+/g, '-'),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        billing_interval: formData.billingInterval,
        payment_method: formData.paymentMethod,
        description: formData.description || null,
        next_billing_date: formData.nextBillingDate,
        created_by: currentUser,
      });

      if (error) throw error;
      
      toast.success('Suscripción internacional creada');
      setIsDialogOpen(false);
      setFormData({
        customerId: '',
        planName: '',
        planSlug: '',
        amount: '',
        currency: 'USD',
        billingInterval: 'monthly',
        paymentMethod: 'card',
        country: 'US',
        description: '',
        nextBillingDate: new Date().toISOString().split('T')[0],
      });
      fetchSubscriptions();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast.error('Error al crear suscripción');
    }
  };

  const handleSendPaymentRequest = async (subscriptionId: string) => {
    setSendingId(subscriptionId);
    try {
      // For now, create a payment request record manually
      // Later this can be connected to a Stripe edge function
      const sub = subscriptions.find(s => s.id === subscriptionId);
      if (!sub) throw new Error('Subscription not found');

      const today = new Date();
      const nextBilling = new Date(sub.next_billing_date);
      const periodEnd = new Date(nextBilling);
      
      // Calculate period based on interval
      switch (sub.billing_interval) {
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case 'quarterly':
          periodEnd.setMonth(periodEnd.getMonth() + 3);
          break;
        case 'semestral':
          periodEnd.setMonth(periodEnd.getMonth() + 6);
          break;
        case 'annual':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
      }

      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 15);

      // Note: proforma_number is generated by database trigger
      const { error } = await supabase.from('stripe_international_payment_requests').insert({
        subscription_id: subscriptionId,
        amount: sub.amount,
        currency: sub.currency,
        billing_period_start: sub.next_billing_date,
        billing_period_end: periodEnd.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        status: 'sent',
        sent_at: new Date().toISOString(),
        proforma_number: '', // Will be overwritten by trigger
      } as any);

      if (error) throw error;

      // Update subscription next billing date
      await supabase.from('stripe_international_subscriptions')
        .update({ 
          next_billing_date: periodEnd.toISOString().split('T')[0],
          last_billed_date: sub.next_billing_date,
        })
        .eq('id', subscriptionId);
      
      toast.success('Solicitud de pago creada');
      fetchSubscriptions();
      fetchPaymentHistory(subscriptionId);
    } catch (error: any) {
      console.error('Error sending payment request:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setSendingId(null);
    }
  };

  const handleMarkAsPaid = async (paymentRequestId: string, subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('stripe_international_payment_requests')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', paymentRequestId);
      
      if (error) throw error;
      toast.success('Marcado como pagado');
      fetchPaymentHistory(subscriptionId);
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      toast.error('Error al actualizar');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      active: { variant: 'default', icon: CheckCircle },
      paused: { variant: 'secondary', icon: Clock },
      cancelled: { variant: 'destructive', icon: AlertCircle },
    };
    const { variant, icon: Icon } = styles[status] || styles.active;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status === 'active' ? 'Activa' : status === 'paused' ? 'Pausada' : 'Cancelada'}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'Pendiente' },
      sent: { variant: 'secondary', label: 'Enviado' },
      paid: { variant: 'default', label: 'Pagado' },
      overdue: { variant: 'destructive', label: 'Vencido' },
    };
    const { variant, label } = styles[status] || styles.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getCurrencySymbol = (currency: string) => {
    return CURRENCIES.find(c => c.value === currency)?.symbol || currency;
  };

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);
    } catch {
      return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
    }
  };

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  const getCountryLabel = (code: string) =>
    COUNTRIES.find(c => c.value === code)?.label || code;

  const getPaymentMethodLabel = (method: string) =>
    PAYMENT_METHODS.find(m => m.value === method)?.label || method;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Suscripciones Stripe Internacional
          </h2>
          <p className="text-sm text-muted-foreground">
            Pagos internacionales con tarjeta, ACH, SEPA y más
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubscriptions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nueva suscripción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nueva suscripción internacional</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cliente *</Label>
                  <Select 
                    value={formData.customerId} 
                    onValueChange={(v) => setFormData(p => ({ ...p, customerId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.companyName} ({c.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>País *</Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(v) => setFormData(p => ({ ...p, country: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Método de pago</Label>
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(v) => setFormData(p => ({ ...p, paymentMethod: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nombre del plan *</Label>
                    <Input
                      value={formData.planName}
                      onChange={(e) => setFormData(p => ({ ...p, planName: e.target.value }))}
                      placeholder="Ej: Premium"
                    />
                  </div>
                  <div>
                    <Label>Periodicidad</Label>
                    <Select 
                      value={formData.billingInterval} 
                      onValueChange={(v) => setFormData(p => ({ ...p, billingInterval: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BILLING_INTERVALS.map(i => (
                          <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Importe *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                      placeholder="125.00"
                    />
                  </div>
                  <div>
                    <Label>Moneda</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(v) => setFormData(p => ({ ...p, currency: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Próximo cobro</Label>
                  <Input
                    type="date"
                    value={formData.nextBillingDate}
                    onChange={(e) => setFormData(p => ({ ...p, nextBillingDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Descripción (opcional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Descripción del servicio..."
                  />
                </div>

                <Button className="w-full" onClick={handleCreateSubscription}>
                  Crear suscripción internacional
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay suscripciones internacionales registradas
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{sub.company_name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {sub.customer_name} • {sub.vat_id} • 
                        <span className="ml-1 font-medium">{getCountryLabel(sub.country)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Banknote className="w-3 h-3" />
                      {sub.currency}
                    </Badge>
                    {getStatusBadge(sub.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Plan</p>
                    <p className="font-medium">{sub.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Importe</p>
                    <p className="font-medium">{formatCurrency(Number(sub.amount), sub.currency)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Periodicidad</p>
                    <p className="font-medium">{getIntervalLabel(sub.billing_interval)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Método</p>
                    <p className="font-medium flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {getPaymentMethodLabel(sub.payment_method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Próximo cobro</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(sub.next_billing_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3" /> {sub.email}
                  {sub.phone && (
                    <>
                      <span className="mx-1">•</span>
                      <Phone className="w-3 h-3" /> {sub.phone}
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchPaymentHistory(sub.id)}
                  >
                    Ver historial
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleSendPaymentRequest(sub.id)}
                    disabled={sendingId === sub.id || sub.status !== 'active'}
                  >
                    {sendingId === sub.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Crear cobro
                  </Button>
                </div>

                {/* Payment History */}
                {selectedPayments[sub.id] && selectedPayments[sub.id].length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Historial de cobros</p>
                    {selectedPayments[sub.id].map((pr) => (
                      <div key={pr.id} className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{pr.proforma_number}</span>
                          {getPaymentStatusBadge(pr.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{formatCurrency(Number(pr.amount), pr.currency)}</span>
                          <span className="text-muted-foreground">
                            Vence: {formatDate(pr.due_date)}
                          </span>
                          {pr.status === 'sent' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => handleMarkAsPaid(pr.id, sub.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Marcar pagado
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StripeInternationalManager;
