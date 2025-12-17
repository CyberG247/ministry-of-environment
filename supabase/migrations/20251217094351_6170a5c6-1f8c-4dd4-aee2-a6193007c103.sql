-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INT;
  new_id TEXT;
BEGIN
  year_part := to_char(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_id FROM 12) AS INT)), 0) + 1
  INTO sequence_num
  FROM public.reports
  WHERE tracking_id LIKE 'ECSRS-' || year_part || '-%';
  
  new_id := 'ECSRS-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;