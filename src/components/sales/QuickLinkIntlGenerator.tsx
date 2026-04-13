import { useState } from 'react';
import { createCheckoutLink } from '@/lib/checkoutLinks';
import { useExchangeRate, roundToFriendly } from '@/hooks/useExchangeRate';
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
import { Copy, Check, Link2, DollarSign, Euro, Globe, CreditCard, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type BillingInterval = 'monthly' | 'quarterly' | 'semestral' | 'annual';
type PaymentMethodOption = 'card' | 'us_bank_account';
type Currency = 'EUR' | 'USD';

const BILLING_INTERVALS: { value: BillingInterval; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semestral', label: 'Semi-annual' },
  { value: 'annual', label: 'Annual' },
];

const PAYMENT_METHODS: { value: PaymentMethodOption; label: string; icon: typeof CreditCard }[] = [
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'us_bank_account', label: 'ACH (US Bank)', icon: Landmark },
];

export const QuickLinkIntlGenerator = () => {
  const { toast } = useToast();
  const { convertToUsd } = useExchangeRate();
  const [open, setOpen] = useState(false);

  const [customPrice, setCustomPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [customDescription, setCustomDescription] = useState('');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethodOption[]>(['card']);

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const togglePaymentMethod = (method: PaymentMethodOption) => {
    setSelectedPaymentMethods(prev => {
      if (prev.includes(method)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== method);
      }
      return [...prev, method];
    });
  };

  const displayPrice = (): string => {
    if (!customPrice) return '';
    const num = parseFloat(customPrice);
    if (isNaN(num)) return '';
    if (currency === 'USD') {
      return `$${convertToUsd(num)} (~${num}€)`;
    }
    return `${num}€`;
  };

  const handleGenerateLink = async () => {
    if (!customPrice) return;
    const priceNum = parseFloat(customPrice);

    try {
      const result = await createCheckoutLink({
        planSlug: 'custom',
        customPrice: priceNum,
        billingInterval,
        paymentMethods: selectedPaymentMethods,
        description: customDescription || undefined,
      });
      // Append intl params
      const url = new URL(result.url);
      url.searchParams.set('intl', '1');
      url.searchParams.set('currency', currency);
      setGeneratedLink(url.toString());
    } catch {
      toast({
        title: 'Error',
        description: 'Could not generate the link. Try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({ title: 'Link copied', description: 'Payment link copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetState = () => {
    setGeneratedLink(null);
    setCustomPrice('');
    setCurrency('EUR');
    setCustomDescription('');
    setBillingInterval('monthly');
    setSelectedPaymentMethods(['card']);
    setCopied(false);
  };

  const priceNumVal = parseFloat(customPrice);
  const isBelowMinimum = customPrice !== '' && !isNaN(priceNumVal) && priceNumVal > 0 && priceNumVal < 0.5;
  const canGenerate = customPrice && priceNumVal >= 0.5 && selectedPaymentMethods.length > 0;
  const intervalLabel = BILLING_INTERVALS.find(i => i.value === billingInterval)?.label || '';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetState(); setOpen(o); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Globe className="w-4 h-4" />
          Link Intl
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Link2 className="w-5 h-5 text-primary" />
            International payment link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {!generatedLink ? (
            <>
              {/* Price + Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="intlPrice">Amount (EUR base) *</Label>
                  <div className="relative mt-1.5">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="intlPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 750"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="input-premium pl-9"
                      autoFocus
                    />
                  {isBelowMinimum && (
                    <p className="text-xs text-destructive mt-1">Min. amount: 0.50 (Stripe requirement)</p>
                  )}
                </div>
              </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger className="input-premium mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR €</SelectItem>
                      <SelectItem value="USD">USD $</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Billing interval */}
              <div>
                <Label>Billing interval *</Label>
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
                <Label htmlFor="intlDesc">Description</Label>
                <Input
                  id="intlDesc"
                  placeholder="e.g. Special agreement Q1 2026"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="input-premium mt-1.5"
                />
              </div>

              {/* Payment methods */}
              <div className="space-y-3">
                <Label>Allowed payment methods *</Label>
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

              {/* Currency warning */}
              {currency === 'EUR' && selectedPaymentMethods.includes('us_bank_account') && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ ACH solo funciona con USD. Se usará solo Card para EUR.
                </p>
              )}

              {/* Preview */}
              {customPrice && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="text-lg font-semibold text-primary">{displayPrice()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Billing:</span>
                    <span className="text-sm font-medium text-foreground">{intervalLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Methods:</span>
                    <span className="text-sm text-foreground">
                      {selectedPaymentMethods.map(m =>
                        PAYMENT_METHODS.find(pm => pm.value === m)?.label
                      ).join(', ')}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleGenerateLink} className="btn-wine w-full" disabled={!canGenerate}>
                Generate link
              </Button>
            </>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Link ready</span>
                </div>
                <p className="text-sm text-foreground/80 break-all font-mono text-xs">
                  {generatedLink}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCopyLink} className="btn-wine flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy link'}
                </Button>
                <Button onClick={() => window.open(generatedLink!, '_blank')} variant="outline" className="flex items-center gap-2">
                  Test
                </Button>
              </div>

              <Button onClick={resetState} variant="ghost" className="w-full text-muted-foreground">
                Create another link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
