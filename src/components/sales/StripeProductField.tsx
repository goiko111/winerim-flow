import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STRIPE_PRODUCTS, type StripeProductKey } from '@/config/stripeProducts';

export function StripeProductField({ value, onChange }: { value: StripeProductKey; onChange: (v: StripeProductKey) => void }) {
  return (
    <div>
      <Label>Producto de Stripe *</Label>
      <Select value={value} onValueChange={(v) => onChange(v as StripeProductKey)}>
        <SelectTrigger className="input-premium mt-1.5"><SelectValue /></SelectTrigger>
        <SelectContent>
          {STRIPE_PRODUCTS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
