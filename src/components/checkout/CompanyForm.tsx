import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const companyFormSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa es obligatorio'),
  restaurantName: z.string().min(2, 'El nombre del restaurante es obligatorio'),
  vatId: z.string().min(5, 'CIF/NIF/VAT es obligatorio'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono es obligatorio'),
  country: z.string().min(2, 'País es obligatorio'),
  state: z.string().min(2, 'Provincia/Estado es obligatorio'),
  city: z.string().min(2, 'Ciudad es obligatoria'),
  postalCode: z.string().min(4, 'Código postal es obligatorio'),
  address: z.string().min(5, 'Dirección es obligatoria'),
  promoCode: z.string().optional(),
  onboardingNotes: z.string().optional(),
});

export type CompanyFormData = z.infer<typeof companyFormSchema>;

// Export schema for external validation
export { companyFormSchema };

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void;
  onFormChange?: (data: Partial<CompanyFormData>, isValid: boolean) => void;
  defaultValues?: Partial<CompanyFormData>;
  isSubmitting?: boolean;
}

const countries = [
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'IE', name: 'Irlanda' },
];

export const CompanyForm = ({ onSubmit, onFormChange, defaultValues, isSubmitting }: CompanyFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      country: 'ES',
      ...defaultValues,
    },
    mode: 'onChange',
  });

  const selectedCountry = watch('country');
  const formValues = watch();

  // Notify parent of form changes
  useEffect(() => {
    onFormChange?.(formValues, isValid);
  }, [formValues, isValid, onFormChange]);

  return (
    <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company info */}
      <div className="space-y-4">
        <p className="section-header">Datos de la empresa</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Razón social / Empresa *</Label>
            <Input
              id="companyName"
              {...register('companyName')}
              className="input-premium mt-1.5"
              placeholder="Grupo Gastronómico S.L."
            />
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="restaurantName">Nombre del restaurante *</Label>
            <Input
              id="restaurantName"
              {...register('restaurantName')}
              className="input-premium mt-1.5"
              placeholder="El Bodegón"
            />
            {errors.restaurantName && (
              <p className="text-sm text-destructive mt-1">{errors.restaurantName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="vatId">CIF / NIF / VAT *</Label>
            <Input
              id="vatId"
              {...register('vatId')}
              className="input-premium mt-1.5"
              placeholder="B12345678"
            />
            {errors.vatId && (
              <p className="text-sm text-destructive mt-1">{errors.vatId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="input-premium mt-1.5"
              placeholder="+34 600 123 456"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="input-premium mt-1.5"
              placeholder="admin@restaurante.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Billing address */}
      <div className="space-y-4">
        <p className="section-header">Dirección de facturación</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">País *</Label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => setValue('country', value)}
            >
              <SelectTrigger className="input-premium mt-1.5">
                <SelectValue placeholder="Selecciona país" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">Provincia / Estado *</Label>
            <Input
              id="state"
              {...register('state')}
              className="input-premium mt-1.5"
              placeholder="Bizkaia"
            />
            {errors.state && (
              <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">Ciudad *</Label>
            <Input
              id="city"
              {...register('city')}
              className="input-premium mt-1.5"
              placeholder="Bilbao"
            />
            {errors.city && (
              <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postalCode">Código postal *</Label>
            <Input
              id="postalCode"
              {...register('postalCode')}
              className="input-premium mt-1.5"
              placeholder="48001"
            />
            {errors.postalCode && (
              <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              {...register('address')}
              className="input-premium mt-1.5"
              placeholder="Calle Gran Vía, 45"
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        <p className="section-header">Opcional</p>
        
        <div>
          <Label htmlFor="promoCode">Código promocional</Label>
          <Input
            id="promoCode"
            {...register('promoCode')}
            className="input-premium mt-1.5"
            placeholder="WINERIM2024"
          />
        </div>

        <div>
          <Label htmlFor="onboardingNotes">Notas para el onboarding</Label>
          <Textarea
            id="onboardingNotes"
            {...register('onboardingNotes')}
            className="input-premium mt-1.5 min-h-[80px]"
            placeholder="Cuéntanos más sobre tu negocio, número de mesas, tipo de carta de vinos..."
          />
        </div>
      </div>
    </form>
  );
};
