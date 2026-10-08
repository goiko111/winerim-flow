import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  existing: boolean;
  onExistingChange: (v: boolean) => void;
  value: string;
  onValueChange: (v: string) => void;
  lang?: 'es' | 'en';
}

export const isValidWinerimUserId = (existing: boolean, value: string) =>
  !existing || /^\d+$/.test(value.trim());

export const parseWinerimUserId = (existing: boolean, value: string): number | undefined =>
  existing && /^\d+$/.test(value.trim()) ? Number(value.trim()) : undefined;

export const WinerimUserIdField = ({ existing, onExistingChange, value, onValueChange, lang = 'es' }: Props) => {
  const t = lang === 'en'
    ? { check: 'Existing restaurant in Winerim', label: 'Restaurant ID in Winerim *', hint: 'User ID shown in the Winerim admin. Do not guess it by email.', err: 'Enter a numeric ID' }
    : { check: 'Es un restaurante que ya existe en Winerim', label: 'ID del restaurante en Winerim *', hint: 'El id de usuario que aparece en el admin de Winerim. No lo deduzcas por email.', err: 'Introduce un id numérico' };
  const invalid = existing && value !== '' && !/^\d+$/.test(value.trim());

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <Checkbox checked={existing} onCheckedChange={(c) => onExistingChange(c === true)} />
        {t.check}
      </label>
      {existing && (
        <div>
          <Label htmlFor="winerimUserId">{t.label}</Label>
          <Input
            id="winerimUserId"
            inputMode="numeric"
            placeholder="12345"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="input-premium mt-1.5"
          />
          <p className={`text-xs mt-1 ${invalid ? 'text-destructive' : 'text-muted-foreground'}`}>
            {invalid ? t.err : t.hint}
          </p>
        </div>
      )}
    </div>
  );
};
