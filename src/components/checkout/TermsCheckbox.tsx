import { appConfig } from '@/config/app';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: boolean;
}

export const TermsCheckbox = ({ checked, onCheckedChange, error }: TermsCheckboxProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className={error ? 'border-destructive' : ''}
        />
        <Label
          htmlFor="terms"
          className="text-sm text-foreground/80 leading-relaxed cursor-pointer"
        >
          He leído y acepto las{' '}
          <a
            href={appConfig.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Condiciones de servicio
          </a>{' '}
          y la{' '}
          <a
            href={appConfig.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Política de privacidad
          </a>
          , y autorizo los cargos recurrentes según el plan contratado.
        </Label>
      </div>
      {error && (
        <p className="text-sm text-destructive ml-7">
          Debes aceptar los términos para continuar
        </p>
      )}
    </div>
  );
};
