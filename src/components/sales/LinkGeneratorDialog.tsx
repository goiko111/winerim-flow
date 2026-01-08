import { useState } from 'react';
import { plans, Plan } from '@/config/plans';
import { appConfig, PaymentMethod } from '@/config/app';
import { Customer, ActivityLog, saveActivityLog, generateId } from '@/lib/salesStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { Copy, Mail, ExternalLink, Check, FileText, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LinkGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onLinkGenerated: () => void;
}

export const LinkGeneratorDialog = ({
  open,
  onOpenChange,
  customer,
  onLinkGenerated,
}: LinkGeneratorDialogProps) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('anual');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Custom pricing
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');

  const plan = plans.find((p) => p.planSlug === selectedPlan);

  const showBankTransfer =
    appConfig.stripe.enableBankTransferForAnnual &&
    (plan?.period === 'annual' || selectedPlan === 'enterprise');

  const getFinalPrice = () => {
    if (useCustomPrice && customPrice) {
      return parseFloat(customPrice);
    }
    return plan?.price || 0;
  };

  const handleGenerateLink = async () => {
    if (!customer || !plan) return;

    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 500));

    // Generate prefilled checkout link
    const prefillData = {
      companyName: customer.companyName,
      vatId: customer.vatId,
      email: customer.email,
      phone: customer.phone,
      country: customer.country,
      state: customer.state,
      city: customer.city,
      postalCode: customer.postalCode,
      address: customer.address,
    };

    const baseUrl = window.location.origin;
    let checkoutUrl = `${baseUrl}/checkout/${plan.planSlug}?prefill=${encodeURIComponent(
      JSON.stringify(prefillData)
    )}`;

    // Add custom pricing params if enabled
    if (useCustomPrice && customPrice) {
      checkoutUrl += `&customPrice=${encodeURIComponent(customPrice)}`;
      if (customDescription) {
        checkoutUrl += `&customDesc=${encodeURIComponent(customDescription)}`;
      }
    }

    setGeneratedLink(checkoutUrl);

    // Log activity
    const log: ActivityLog = {
      id: generateId(),
      date: Date.now(),
      salesPerson: 'admin',
      customerId: customer.id,
      customerName: customer.companyName,
      planSlug: plan.planSlug,
      planName: useCustomPrice ? `${plan.name} (Personalizado: ${customPrice}€)` : plan.name,
      action: 'link_created',
      paymentMethod,
      link: checkoutUrl,
    };
    saveActivityLog(log);

    setIsGenerating(false);
    onLinkGenerated();
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: 'Link copiado',
        description: 'El enlace de pago ha sido copiado al portapapeles.',
      });
    }
  };

  const handleOpenCheckout = () => {
    if (generatedLink) {
      // Log checkout opened
      const log: ActivityLog = {
        id: generateId(),
        date: Date.now(),
        salesPerson: 'admin',
        customerId: customer?.id || '',
        customerName: customer?.companyName || '',
        planSlug: plan?.planSlug || '',
        planName: plan?.name || '',
        action: 'checkout_opened',
        link: generatedLink,
      };
      saveActivityLog(log);
      onLinkGenerated();

      window.open(generatedLink, '_blank');
    }
  };

  const handleSendEmail = () => {
    if (!customer || !generatedLink || !plan) return;

    const subject = encodeURIComponent(
      `Tu suscripción a Winerim - Plan ${plan.name}`
    );
    const body = encodeURIComponent(`Hola,

Aquí tienes el enlace para completar tu suscripción al plan ${plan.name} de Winerim:

${generatedLink}

Si tienes alguna duda, no dudes en contactarnos.

Un saludo,
El equipo de Winerim`);

    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`);
  };

  const resetState = () => {
    setGeneratedLink(null);
    setSelectedPlan('anual');
    setPaymentMethod('card');
    setUseCustomPrice(false);
    setCustomPrice('');
    setCustomDescription('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetState();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <FileText className="w-5 h-5 text-primary" />
            Crear suscripción
          </DialogTitle>
        </DialogHeader>

        {customer && (
          <div className="space-y-6 mt-4">
            {/* Customer info */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="font-medium text-foreground">{customer.companyName}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>

            {!generatedLink ? (
              <>
                {/* Plan selection */}
                <div>
                  <Label>Plan base</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="input-premium mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.planSlug} value={p.planSlug}>
                          {p.name} - {p.price}€/{p.period === 'monthly' ? 'mes' : 'periodo'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom pricing toggle */}
                <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Precio personalizado</Label>
                      <p className="text-xs text-muted-foreground">
                        Activar para usar un importe diferente al del plan
                      </p>
                    </div>
                    <Switch
                      checked={useCustomPrice}
                      onCheckedChange={setUseCustomPrice}
                    />
                  </div>

                  {useCustomPrice && (
                    <div className="space-y-3 animate-fade-in">
                      <div>
                        <Label htmlFor="customPrice">Importe (€)</Label>
                        <div className="relative mt-1.5">
                          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="customPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ej: 750"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="input-premium pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="customDesc">Descripción (opcional)</Label>
                        <Input
                          id="customDesc"
                          placeholder="Ej: Acuerdo especial 6 meses"
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          className="input-premium mt-1.5"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Price preview */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-sm text-muted-foreground">Importe final:</span>
                  <span className="text-lg font-semibold text-primary">{getFinalPrice()}€</span>
                </div>

                {/* Payment method */}
                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  showBankTransfer={showBankTransfer}
                />

                <Button
                  onClick={handleGenerateLink}
                  className="btn-wine w-full"
                  disabled={isGenerating || (useCustomPrice && !customPrice)}
                >
                  {isGenerating ? 'Generando...' : 'Generar enlace de pago'}
                </Button>
              </>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Enlace generado</span>
                  </div>
                  <p className="text-sm text-foreground/80 break-all">
                    {generatedLink}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button onClick={handleCopyLink} variant="outline" className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copiar
                  </Button>
                  <Button onClick={handleSendEmail} variant="outline" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button onClick={handleOpenCheckout} className="btn-wine flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Abrir ahora
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Usa "Abrir ahora" para completar el pago durante una llamada comercial.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
