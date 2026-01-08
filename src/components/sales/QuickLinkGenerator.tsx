import { useState } from 'react';
import { plans } from '@/config/plans';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { Copy, Check, Link2, Euro, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const QuickLinkGenerator = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('anual');
  const [useCustomPrice, setUseCustomPrice] = useState(true);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const plan = plans.find((p) => p.planSlug === selectedPlan);

  const getFinalPrice = () => {
    if (useCustomPrice && customPrice) {
      return parseFloat(customPrice);
    }
    return plan?.price || 0;
  };

  const handleGenerateLink = () => {
    if (!plan) return;

    const baseUrl = window.location.origin;
    let checkoutUrl = `${baseUrl}/checkout/${plan.planSlug}`;

    // Add custom pricing params if enabled
    if (useCustomPrice && customPrice) {
      checkoutUrl += `?customPrice=${encodeURIComponent(customPrice)}`;
      if (customDescription) {
        checkoutUrl += `&customDesc=${encodeURIComponent(customDescription)}`;
      }
    }

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
    setSelectedPlan('anual');
    setUseCustomPrice(true);
    setCustomPrice('');
    setCustomDescription('');
    setCopied(false);
  };

  const canGenerate = !useCustomPrice || (useCustomPrice && customPrice);

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
            Generar link de pago
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
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
                        {p.name} - {p.price}€
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom pricing toggle */}
              <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Importe personalizado</Label>
                    <p className="text-xs text-muted-foreground">
                      Define el importe exacto a cobrar
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
                      <Label htmlFor="quickCustomPrice">Importe (€)</Label>
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
                    <div>
                      <Label htmlFor="quickCustomDesc">Concepto (opcional)</Label>
                      <Input
                        id="quickCustomDesc"
                        placeholder="Ej: Acuerdo especial Q1"
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
                <span className="text-sm text-muted-foreground">Importe a cobrar:</span>
                <span className="text-lg font-semibold text-primary">{getFinalPrice()}€</span>
              </div>

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
