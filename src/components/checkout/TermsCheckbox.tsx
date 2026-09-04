import { appConfig } from '@/config/app';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckoutLang, getCheckoutDict } from '@/config/checkoutI18n';

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: boolean;
  lang?: CheckoutLang;
}

export const TermsCheckbox = ({ checked, onCheckedChange, error, lang = 'es' }: TermsCheckboxProps) => {
  const t = getCheckoutDict(lang);
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
          {t.termsPrefix}{' '}
          <a
            href={appConfig.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {t.termsOfService}
          </a>{' '}
          {t.and}{' '}
          <a
            href={appConfig.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {t.privacyPolicy}
          </a>
          {t.termsSuffix}
        </Label>
      </div>
      {error && (
        <p className="text-sm text-destructive ml-7">
          {t.termsError}
        </p>
      )}
    </div>
  );
};
