import { useState } from 'react';
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Loader2, Send, Copy, CheckCircle } from 'lucide-react';
import { BILLING_INTERVALS, BANK_DETAILS } from '@/config/bankDetails';
import { Customer } from '@/lib/salesStore';

interface ProformaGeneratorProps {
  customer: Customer;
  onGenerated?: () => void;
}

export const ProformaGenerator = ({ customer, onGenerated }: ProformaGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [proformaNumber, setProformaNumber] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    planName: 'Winerim',
    amount: '125',
    billingInterval: 'monthly',
    description: '',
    createSubscription: true,
  });

  const handleGenerate = async () => {
    if (!formData.planName || !formData.amount) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      // Calculate billing period dates
      const today = new Date();
      const periodEnd = new Date(today);
      const intervalMonths = BILLING_INTERVALS.find(i => i.value === formData.billingInterval)?.months || 1;
      periodEnd.setMonth(periodEnd.getMonth() + intervalMonths);
      periodEnd.setDate(periodEnd.getDate() - 1);
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 10);

      let subscriptionId: string | null = null;

      // Optionally create subscription for future billing
      if (formData.createSubscription) {
        const nextBillingDate = new Date(periodEnd);
        nextBillingDate.setDate(nextBillingDate.getDate() + 1);

        const { data: subData, error: subError } = await supabase
          .from('bank_transfer_subscriptions')
          .insert({
            customer_name: customer.name,
            company_name: customer.companyName,
            vat_id: customer.vatId,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            postal_code: customer.postalCode,
            plan_name: formData.planName,
            plan_slug: formData.planName.toLowerCase().replace(/\s+/g, '-'),
            amount: parseFloat(formData.amount),
            billing_interval: formData.billingInterval,
            description: formData.description || null,
            next_billing_date: nextBillingDate.toISOString().split('T')[0],
            created_by: localStorage.getItem('winerim_sales_user') || 'comercial',
          })
          .select()
          .single();

        if (subError) throw subError;
        subscriptionId = subData.id;
      }

      // Create payment request and send email
      const { data, error } = await supabase.functions.invoke('send-proforma', {
        body: {
          customer: {
            company_name: customer.companyName,
            customer_name: customer.name,
            vat_id: customer.vatId,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            postal_code: customer.postalCode,
          },
          subscription: {
            plan_name: formData.planName,
            amount: parseFloat(formData.amount),
            billing_interval: formData.billingInterval,
            description: formData.description,
          },
          subscriptionId,
          billingPeriodStart: today.toISOString().split('T')[0],
          billingPeriodEnd: periodEnd.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
        },
      });

      if (error) throw error;

      setProformaNumber(data.proformaNumber);
      setSuccess(true);
      toast.success('Proforma enviada correctamente');
      onGenerated?.();
    } catch (error: any) {
      console.error('Error generating proforma:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSuccess(false);
    setProformaNumber(null);
    setFormData({
      planName: 'Winerim',
      amount: '125',
      billingInterval: 'monthly',
      description: '',
      createSubscription: true,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetState();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Proforma
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generar proforma
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-lg">Proforma enviada</p>
              <p className="text-sm text-muted-foreground">
                Enviada a {customer.email}
              </p>
            </div>
            {proformaNumber && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Número de proforma</p>
                <p className="font-mono font-medium">{proformaNumber}</p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={resetState}>
                Crear otra
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Customer info */}
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium">{customer.companyName}</p>
              <p className="text-muted-foreground">{customer.email}</p>
              <p className="text-muted-foreground text-xs">{customer.vatId}</p>
            </div>

            {/* Form */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nombre del plan *</Label>
                <Input
                  value={formData.planName}
                  onChange={(e) => setFormData(p => ({ ...p, planName: e.target.value }))}
                  placeholder="Ej: Winerim"
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
              <Label>Descripción (opcional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción adicional..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createSubscription"
                checked={formData.createSubscription}
                onChange={(e) => setFormData(p => ({ ...p, createSubscription: e.target.checked }))}
                className="rounded border-input"
              />
              <Label htmlFor="createSubscription" className="text-sm font-normal cursor-pointer">
                Crear suscripción recurrente tras el pago
              </Label>
            </div>

            {/* Bank info preview */}
            <div className="bg-muted/30 p-3 rounded-lg border text-xs space-y-1">
              <p className="font-medium text-sm mb-2">La proforma incluirá:</p>
              <p><span className="text-muted-foreground">IBAN:</span> {BANK_DETAILS.iban}</p>
              <p><span className="text-muted-foreground">Beneficiario:</span> {BANK_DETAILS.accountHolder}</p>
              <p><span className="text-muted-foreground">Fecha límite:</span> 10 días desde hoy</p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Generar y enviar proforma
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
