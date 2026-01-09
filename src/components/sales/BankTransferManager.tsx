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
  Euro,
  Loader2,
  RefreshCw,
  Plus,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { BILLING_INTERVALS, getIntervalLabel, BANK_DETAILS } from '@/config/bankDetails';
import { Customer } from '@/lib/salesStore';

interface BankSubscription {
  id: string;
  customer_name: string;
  company_name: string;
  vat_id: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  plan_name: string;
  plan_slug: string;
  amount: number;
  billing_interval: string;
  description: string | null;
  next_billing_date: string;
  last_billed_date: string | null;
  status: string;
  created_by: string;
  created_at: string;
}

interface PaymentRequest {
  id: string;
  proforma_number: string;
  amount: number;
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  status: string;
  sent_at: string | null;
  paid_at: string | null;
}

interface BankTransferManagerProps {
  customers: Customer[];
  currentUser: string;
}

export const BankTransferManager = ({ customers, currentUser }: BankTransferManagerProps) => {
  const [subscriptions, setSubscriptions] = useState<BankSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<Record<string, PaymentRequest[]>>({});
  
  // Form state for new subscription
  const [formData, setFormData] = useState({
    customerId: '',
    planName: '',
    planSlug: '',
    amount: '',
    billingInterval: 'monthly',
    description: '',
    nextBillingDate: new Date().toISOString().split('T')[0],
  });

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_transfer_subscriptions')
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
        .from('payment_requests')
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
      const { error } = await supabase.from('bank_transfer_subscriptions').insert({
        customer_name: customer.name,
        company_name: customer.companyName,
        vat_id: customer.vatId,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postalCode,
        plan_name: formData.planName,
        plan_slug: formData.planSlug || formData.planName.toLowerCase().replace(/\s+/g, '-'),
        amount: parseFloat(formData.amount),
        billing_interval: formData.billingInterval,
        description: formData.description || null,
        next_billing_date: formData.nextBillingDate,
        created_by: currentUser,
      });

      if (error) throw error;
      
      toast.success('Suscripción creada correctamente');
      setIsDialogOpen(false);
      setFormData({
        customerId: '',
        planName: '',
        planSlug: '',
        amount: '',
        billingInterval: 'monthly',
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
      const { data, error } = await supabase.functions.invoke('send-payment-request', {
        body: { subscriptionId },
      });

      if (error) throw error;
      
      if (data.results?.[0]?.status === 'sent') {
        toast.success('Solicitud de pago enviada');
        fetchSubscriptions();
        fetchPaymentHistory(subscriptionId);
      } else {
        throw new Error(data.results?.[0]?.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error sending payment request:', error);
      toast.error(`Error al enviar: ${error.message}`);
    } finally {
      setSendingId(null);
    }
  };

  const handleMarkAsPaid = async (paymentRequestId: string, subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('payment_requests')
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

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Suscripciones por Transferencia
          </h2>
          <p className="text-sm text-muted-foreground">
            IBAN: {BANK_DETAILS.iban} • {BANK_DETAILS.accountHolder}
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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nueva suscripción por transferencia</DialogTitle>
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
                    <Label>Nombre del plan *</Label>
                    <Input
                      value={formData.planName}
                      onChange={(e) => setFormData(p => ({ ...p, planName: e.target.value }))}
                      placeholder="Ej: Premium"
                    />
                  </div>
                  <div>
                    <Label>Importe (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                      placeholder="125.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                  <div>
                    <Label>Próximo cobro</Label>
                    <Input
                      type="date"
                      value={formData.nextBillingDate}
                      onChange={(e) => setFormData(p => ({ ...p, nextBillingDate: e.target.value }))}
                    />
                  </div>
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
                  Crear suscripción
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
            No hay suscripciones por transferencia registradas
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{sub.company_name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{sub.customer_name} • {sub.vat_id}</p>
                    </div>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Plan</p>
                    <p className="font-medium">{sub.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Importe</p>
                    <p className="font-medium">{formatCurrency(Number(sub.amount))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Periodicidad</p>
                    <p className="font-medium">{getIntervalLabel(sub.billing_interval)}</p>
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
                    Enviar solicitud ahora
                  </Button>
                </div>

                {/* Payment History */}
                {selectedPayments[sub.id] && selectedPayments[sub.id].length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Historial de pagos</p>
                    {selectedPayments[sub.id].map((pr) => (
                      <div key={pr.id} className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{pr.proforma_number}</span>
                          {getPaymentStatusBadge(pr.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{formatCurrency(Number(pr.amount))}</span>
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
