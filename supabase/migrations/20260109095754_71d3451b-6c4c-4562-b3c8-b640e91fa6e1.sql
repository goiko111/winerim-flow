-- Create table for bank transfer subscriptions
CREATE TABLE public.bank_transfer_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Customer info
  customer_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  vat_id TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Address
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'ES',
  
  -- Subscription details
  plan_name TEXT NOT NULL,
  plan_slug TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'quarterly', 'semestral', 'annual')),
  description TEXT,
  
  -- Billing tracking
  next_billing_date DATE NOT NULL,
  last_billed_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  
  -- Metadata
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for finding due payments
CREATE INDEX idx_bank_transfer_subscriptions_next_billing 
ON public.bank_transfer_subscriptions(next_billing_date) 
WHERE status = 'active';

-- Index for email lookups
CREATE INDEX idx_bank_transfer_subscriptions_email 
ON public.bank_transfer_subscriptions(email);

-- Create table for payment request history
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.bank_transfer_subscriptions(id) ON DELETE CASCADE,
  
  -- Request details
  amount DECIMAL(10,2) NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Proforma reference (for your records, not official invoice)
  proforma_number TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for subscription payment history
CREATE INDEX idx_payment_requests_subscription 
ON public.payment_requests(subscription_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_bank_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_bank_transfer_subscriptions_updated_at
BEFORE UPDATE ON public.bank_transfer_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_bank_subscription_updated_at();

-- Function to generate proforma number
CREATE OR REPLACE FUNCTION public.generate_proforma_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.proforma_number := 'PRO-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(NEXTVAL('proforma_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Sequence for proforma numbers
CREATE SEQUENCE IF NOT EXISTS proforma_seq START 1;

CREATE TRIGGER set_proforma_number
BEFORE INSERT ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.generate_proforma_number();

-- Enable RLS but allow public access (internal sales tool, no auth)
ALTER TABLE public.bank_transfer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Allow all operations (internal tool without auth)
CREATE POLICY "Allow all access to bank_transfer_subscriptions" 
ON public.bank_transfer_subscriptions 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all access to payment_requests" 
ON public.payment_requests 
FOR ALL 
USING (true) 
WITH CHECK (true);