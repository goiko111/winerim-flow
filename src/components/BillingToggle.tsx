import { cn } from '@/lib/utils';

interface BillingToggleProps {
  isAnnual: boolean;
  onChange: (annual: boolean) => void;
  monthlyLabel?: string;
  annualLabel?: string;
  annualBadge?: string;
}

const BillingToggle = ({
  isAnnual,
  onChange,
  monthlyLabel = 'Mensual',
  annualLabel = 'Anual',
  annualBadge = 'Ahorra 33%',
}: BillingToggleProps) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
      <button
        onClick={() => onChange(false)}
        className={cn(
          'rounded-full px-5 py-2 text-sm font-medium transition-all',
          !isAnnual
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {monthlyLabel}
      </button>
      <button
        onClick={() => onChange(true)}
        className={cn(
          'rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-2',
          isAnnual
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {annualLabel}
        {annualBadge && (
          <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
            {annualBadge}
          </span>
        )}
      </button>
    </div>
  );
};

export default BillingToggle;
