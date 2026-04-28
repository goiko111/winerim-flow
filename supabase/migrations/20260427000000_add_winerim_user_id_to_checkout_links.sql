ALTER TABLE public.checkout_links
  ADD COLUMN IF NOT EXISTS winerim_user_id INTEGER DEFAULT NULL;
