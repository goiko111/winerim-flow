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

// Base schema without address fields
const baseCompanyFormSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa es obligatorio'),
  restaurantName: z.string().min(2, 'El nombre del restaurante es obligatorio'),
  vatId: z.string().min(5, 'CIF/NIF/VAT es obligatorio'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono es obligatorio'),
  promoCode: z.string().optional(),
  onboardingNotes: z.string().optional(),
});

// Address fields schema
const addressFieldsSchema = z.object({
  country: z.string().min(2, 'País es obligatorio'),
  state: z.string().min(2, 'Provincia/Estado es obligatorio'),
  city: z.string().min(2, 'Ciudad es obligatoria'),
  postalCode: z.string().min(4, 'Código postal es obligatorio'),
  address: z.string().min(5, 'Dirección es obligatoria'),
});

// Optional address fields schema (for SEPA)
const optionalAddressFieldsSchema = z.object({
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),
});

// Full schema with required address
const companyFormSchema = baseCompanyFormSchema.merge(addressFieldsSchema);

// Schema without required address (for SEPA)
const companyFormSchemaWithoutAddress = baseCompanyFormSchema.merge(optionalAddressFieldsSchema);

export type CompanyFormData = z.infer<typeof companyFormSchema>;

// Export schema for external validation
export { companyFormSchema };

interface CompanyFormProps {
  onSubmit: (data: CompanyFormData) => void;
  onFormChange?: (data: Partial<CompanyFormData>, isValid: boolean) => void;
  defaultValues?: Partial<CompanyFormData>;
  isSubmitting?: boolean;
  hideAddressFields?: boolean;
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
  { code: 'CH', name: 'Suiza' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'SE', name: 'Suecia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'PL', name: 'Polonia' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'SK', name: 'Eslovaquia' },
  { code: 'HU', name: 'Hungría' },
  { code: 'SI', name: 'Eslovenia' },
  { code: 'HR', name: 'Croacia' },
  { code: 'RO', name: 'Rumanía' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'GR', name: 'Grecia' },
  { code: 'LT', name: 'Lituania' },
  { code: 'LV', name: 'Letonia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Chipre' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'BR', name: 'Brasil' },
  { code: 'JP', name: 'Japón' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'Nueva Zelanda' },
  { code: 'ZA', name: 'Sudáfrica' },
  { code: 'AE', name: 'Emiratos Árabes Unidos' },
  { code: 'TR', name: 'Turquía' },
  { code: 'IL', name: 'Israel' },
  { code: 'TH', name: 'Tailandia' },
  { code: 'SG', name: 'Singapur' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'PH', name: 'Filipinas' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malasia' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'IN', name: 'India' },
];

export const CompanyForm = ({ onSubmit, onFormChange, defaultValues, isSubmitting, hideAddressFields = false }: CompanyFormProps) => {
  // Use appropriate schema based on whether address fields are hidden
  const schema = hideAddressFields ? companyFormSchemaWithoutAddress : companyFormSchema;
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(schema),
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

      {/* Billing address - hidden for SEPA as Stripe will collect it */}
      {!hideAddressFields && (
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
      )}
      
      {/* Info message when address is hidden (SEPA) */}
      {hideAddressFields && (
        <div className="rounded-lg bg-muted/50 border border-border p-4">
          <p className="text-sm text-muted-foreground">
            La dirección de facturación se solicitará en el siguiente paso como parte del mandato SEPA.
          </p>
        </div>
      )}

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
