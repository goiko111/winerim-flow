-- Create sequence for stripe international proforma numbers
CREATE SEQUENCE IF NOT EXISTS stripe_intl_proforma_seq START 1;

-- Create stripe_international_subscriptions table
CREATE TABLE public.stripe_international_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  vat_id TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  plan_name TEXT NOT NULL,
  plan_slug TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'card',
  description TEXT,
  next_billing_date DATE NOT NULL,
  last_billed_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stripe_international_payment_requests table
CREATE TABLE public.stripe_international_payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.stripe_international_subscriptions(id) ON DELETE CASCADE,
  proforma_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stripe_international_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_international_payment_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for sales portal access
CREATE POLICY "Allow all access to stripe_international_subscriptions"
ON public.stripe_international_subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to stripe_international_payment_requests"
ON public.stripe_international_payment_requests
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for proforma number generation
CREATE OR REPLACE FUNCTION public.generate_stripe_intl_proforma_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.proforma_number := 'INTL-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('stripe_intl_proforma_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER generate_stripe_intl_proforma_number_trigger
BEFORE INSERT ON public.stripe_international_payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.generate_stripe_intl_proforma_number();

-- Create trigger for updated_at
CREATE TRIGGER update_stripe_intl_subscription_updated_at
BEFORE UPDATE ON public.stripe_international_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_bank_subscription_updated_at();