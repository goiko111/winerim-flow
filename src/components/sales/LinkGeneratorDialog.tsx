import { useState } from 'react';
import { plans, Plan } from '@/config/plans';
import { appConfig, PaymentMethod } from '@/config/app';
import { Customer, ActivityLog, saveActivityLog, generateId } from '@/lib/salesStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Copy, Mail, ExternalLink, Check, FileText } from 'lucide-react';
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
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const plan = plans.find((p) => p.planSlug === selectedPlan);

  const showBankTransfer =
    appConfig.stripe.enableBankTransferForAnnual &&
    (plan?.period === 'annual' || selectedPlan === 'enterprise');

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
    const checkoutUrl = `${baseUrl}/checkout/${plan.planSlug}?prefill=${encodeURIComponent(
      JSON.stringify(prefillData)
    )}`;

    setGeneratedLink(checkoutUrl);

    // Log activity
    const log: ActivityLog = {
      id: generateId(),
      date: Date.now(),
      salesPerson: 'admin',
      customerId: customer.id,
      customerName: customer.companyName,
      planSlug: plan.planSlug,
      planName: plan.name,
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
    setSelectedPlan('professional');
    setPaymentMethod('card');
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
                  <Label>Plan</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="input-premium mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.planSlug} value={p.planSlug}>
                          {p.name} - {p.price}€/{p.period === 'monthly' ? 'mes' : 'año'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  disabled={isGenerating}
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
