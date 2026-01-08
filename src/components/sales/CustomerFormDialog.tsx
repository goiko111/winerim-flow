import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Customer, saveCustomer, generateId } from '@/lib/salesStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Check } from 'lucide-react';

const customerSchema = z.object({
  name: z.string().min(2, 'Nombre obligatorio'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono obligatorio'),
  companyName: z.string().min(2, 'Empresa obligatoria'),
  vatId: z.string().min(5, 'CIF/VAT obligatorio'),
  country: z.string().min(2, 'País obligatorio'),
  state: z.string().min(2, 'Provincia obligatoria'),
  city: z.string().min(2, 'Ciudad obligatoria'),
  postalCode: z.string().min(4, 'CP obligatorio'),
  address: z.string().min(5, 'Dirección obligatoria'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated: (customer: Customer) => void;
  editCustomer?: Customer | null;
}

const countries = [
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'DE', name: 'Alemania' },
];

export const CustomerFormDialog = ({
  open,
  onOpenChange,
  onCustomerCreated,
  editCustomer,
}: CustomerFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: editCustomer || { country: 'ES' },
  });

  const selectedCountry = watch('country');

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));

    const customer: Customer = {
      id: editCustomer?.id || generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      vatId: data.vatId,
      country: data.country,
      state: data.state,
      city: data.city,
      postalCode: data.postalCode,
      address: data.address,
      createdAt: editCustomer?.createdAt || Date.now(),
      createdBy: 'admin',
    };

    saveCustomer(customer);
    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      onCustomerCreated(customer);
      setShowSuccess(false);
      reset();
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <UserPlus className="w-5 h-5 text-primary" />
            {editCustomer ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Cliente {editCustomer ? 'actualizado' : 'creado'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nombre contacto *</Label>
                <Input {...register('name')} className="input-premium mt-1" />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <Label>Empresa *</Label>
                <Input {...register('companyName')} className="input-premium mt-1" />
                {errors.companyName && (
                  <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <Label>Email *</Label>
                <Input type="email" {...register('email')} className="input-premium mt-1" />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label>Teléfono *</Label>
                <Input type="tel" {...register('phone')} className="input-premium mt-1" />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label>CIF/VAT *</Label>
                <Input {...register('vatId')} className="input-premium mt-1" />
                {errors.vatId && (
                  <p className="text-sm text-destructive mt-1">{errors.vatId.message}</p>
                )}
              </div>

              <div>
                <Label>País *</Label>
                <Select value={selectedCountry} onValueChange={(v) => setValue('country', v)}>
                  <SelectTrigger className="input-premium mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Provincia *</Label>
                <Input {...register('state')} className="input-premium mt-1" />
              </div>

              <div>
                <Label>Ciudad *</Label>
                <Input {...register('city')} className="input-premium mt-1" />
              </div>

              <div>
                <Label>Código postal *</Label>
                <Input {...register('postalCode')} className="input-premium mt-1" />
              </div>

              <div className="col-span-2">
                <Label>Dirección *</Label>
                <Input {...register('address')} className="input-premium mt-1" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="btn-wine" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editCustomer ? 'Actualizar' : 'Crear cliente'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
