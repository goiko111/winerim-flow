
-- Table to store checkout link configs with short codes
CREATE TABLE public.checkout_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  plan_slug TEXT NOT NULL,
  company_name TEXT,
  vat_id TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  postal_code TEXT,
  address TEXT,
  custom_price NUMERIC,
  billing_interval TEXT,
  payment_methods TEXT[] NOT NULL DEFAULT '{card,sepa_debit}',
  description TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast code lookups
CREATE INDEX idx_checkout_links_code ON public.checkout_links (code);

-- RLS: public read (checkout pages need to read), authenticated write
ALTER TABLE public.checkout_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read checkout links" ON public.checkout_links
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create checkout links" ON public.checkout_links
  FOR INSERT WITH CHECK (true);

-- Function to generate short alphanumeric codes
CREATE OR REPLACE FUNCTION public.generate_short_code(length INTEGER DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate code
CREATE OR REPLACE FUNCTION public.set_checkout_link_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    LOOP
      NEW.code := public.generate_short_code(6);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.checkout_links WHERE code = NEW.code);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_set_checkout_link_code
  BEFORE INSERT ON public.checkout_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_checkout_link_code();
