import { useState } from 'react';
import { CreditCard, Building2, Landmark, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentMethod } from '@/config/app';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  showBankTransfer?: boolean;
  className?: string;
}

const paymentMethods = [
  {
    id: 'card' as PaymentMethod,
    name: 'Tarjeta de crédito/débito',
    description: 'Visa, Mastercard, American Express',
    icon: CreditCard,
    note: null,
  },
  {
    id: 'sepa_debit' as PaymentMethod,
    name: 'Domiciliación bancaria (SEPA)',
    description: 'Cargo directo en cuenta bancaria',
    icon: Building2,
    note: 'La confirmación de SEPA puede tardar 2-5 días hábiles según el banco.',
  },
  {
    id: 'bank_transfer' as PaymentMethod,
    name: 'Transferencia bancaria',
    description: 'Solo disponible para planes anuales',
    icon: Landmark,
    note: 'Recibirás los datos bancarios por email tras confirmar.',
  },
];

export const PaymentMethodSelector = ({
  value,
  onChange,
  showBankTransfer = false,
  className,
}: PaymentMethodSelectorProps) => {
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const availableMethods = paymentMethods.filter(
    (method) => method.id !== 'bank_transfer' || showBankTransfer
  );

  return (
    <div className={cn('space-y-3', className)}>
      <p className="section-header">Método de pago</p>
      
      <div className="space-y-2">
        {availableMethods.map((method) => {
          const isSelected = value === method.id;
          const Icon = method.icon;

          return (
            <div key={method.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(method.id);
                  if (method.note) {
                    setExpandedNote(method.id);
                  }
                }}
                className={cn(
                  'w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  isSelected
                    ? 'border-primary bg-primary-light'
                    : 'border-border bg-card hover:border-primary/30'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium', isSelected && 'text-primary')}>
                    {method.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              {/* Note for SEPA */}
              {method.note && isSelected && (
                <div className="mt-2 ml-14 flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg animate-fade-in">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>{method.note}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
