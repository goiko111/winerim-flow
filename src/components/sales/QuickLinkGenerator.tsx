import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Link2, Euro, Zap, CreditCard, Building2, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type BillingInterval = 'monthly' | 'quarterly' | 'semestral' | 'annual';
type PaymentMethodOption = 'card' | 'sepa_debit' | 'bank_transfer';

const BILLING_INTERVALS: { value: BillingInterval; label: string; months: number }[] = [
  { value: 'monthly', label: 'Mensual', months: 1 },
  { value: 'quarterly', label: 'Trimestral', months: 3 },
  { value: 'semestral', label: 'Semestral', months: 6 },
  { value: 'annual', label: 'Anual', months: 12 },
];

const PAYMENT_METHODS: { value: PaymentMethodOption; label: string; icon: typeof CreditCard }[] = [
  { value: 'card', label: 'Tarjeta', icon: CreditCard },
  { value: 'sepa_debit', label: 'SEPA (Domiciliación)', icon: Building2 },
  { value: 'bank_transfer', label: 'Transferencia bancaria', icon: Landmark },
];

export const QuickLinkGenerator = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // Form state
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethodOption[]>(['card', 'sepa_debit']);
  
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const togglePaymentMethod = (method: PaymentMethodOption) => {
    setSelectedPaymentMethods(prev => {
      if (prev.includes(method)) {
        // Don't allow removing the last method
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== method);
      }
      return [...prev, method];
    });
  };

  const handleGenerateLink = () => {
    if (!customPrice) return;

    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    
    params.set('p', customPrice);
    params.set('i', billingInterval);
    params.set('m', selectedPaymentMethods.join(','));
    
    if (customDescription) {
      params.set('d', customDescription);
    }

    const checkoutUrl = `${baseUrl}/checkout/custom?${params.toString()}`;
    setGeneratedLink(checkoutUrl);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: 'Link copiado',
        description: 'El enlace de pago ha sido copiado al portapapeles.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetState = () => {
    setGeneratedLink(null);
    setCustomPrice('');
    setCustomDescription('');
    setBillingInterval('monthly');
    setSelectedPaymentMethods(['card', 'sepa_debit']);
    setCopied(false);
  };

  const canGenerate = customPrice && parseFloat(customPrice) > 0 && selectedPaymentMethods.length > 0;

  const intervalLabel = BILLING_INTERVALS.find(i => i.value === billingInterval)?.label || '';

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetState();
        setOpen(o);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Zap className="w-4 h-4" />
          Link rápido
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Link2 className="w-5 h-5 text-primary" />
            Crear link de pago personalizado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {!generatedLink ? (
            <>
              {/* Price */}
              <div>
                <Label htmlFor="quickCustomPrice">Importe (€) *</Label>
                <div className="relative mt-1.5">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="quickCustomPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 750"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="input-premium pl-9"
                    autoFocus
                  />
                </div>
              </div>

              {/* Billing interval */}
              <div>
                <Label>Periodicidad de cobro *</Label>
                <Select value={billingInterval} onValueChange={(v) => setBillingInterval(v as BillingInterval)}>
                  <SelectTrigger className="input-premium mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_INTERVALS.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="quickCustomDesc">Concepto / Descripción</Label>
                <Input
                  id="quickCustomDesc"
                  placeholder="Ej: Acuerdo especial Q1 2026"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="input-premium mt-1.5"
                />
              </div>

              {/* Payment methods */}
              <div className="space-y-3">
                <Label>Métodos de pago permitidos *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedPaymentMethods.includes(method.value);
                    return (
                      <label
                        key={method.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => togglePaymentMethod(method.value)}
                        />
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {method.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              {customPrice && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Importe:</span>
                    <span className="text-lg font-semibold text-primary">{customPrice}€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cobro:</span>
                    <span className="text-sm font-medium text-foreground">{intervalLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Métodos:</span>
                    <span className="text-sm text-foreground">
                      {selectedPaymentMethods.map(m => 
                        PAYMENT_METHODS.find(pm => pm.value === m)?.label
                      ).join(', ')}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateLink}
                className="btn-wine w-full"
                disabled={!canGenerate}
              >
                Generar enlace
              </Button>
            </>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Enlace listo</span>
                </div>
                <p className="text-sm text-foreground/80 break-all font-mono text-xs">
                  {generatedLink}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleCopyLink} 
                  className="btn-wine flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar enlace'}
                </Button>
                <Button 
                  onClick={() => window.open(generatedLink, '_blank')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Probar
                </Button>
              </div>

              <Button
                onClick={resetState}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Crear otro enlace
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
