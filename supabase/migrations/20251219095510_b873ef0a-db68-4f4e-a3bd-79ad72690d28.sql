-- Fix security issue: Deny public/unauthenticated access to profiles
CREATE POLICY "Deny unauthenticated access to profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security issue: Ensure anonymous reports don't expose reporter_id
-- Create a function to safely get report data that masks reporter_id for anonymous reports
CREATE OR REPLACE FUNCTION public.mask_anonymous_reporter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_anonymous = true THEN
    NEW.reporter_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically null out reporter_id for anonymous reports
CREATE TRIGGER mask_anonymous_reporter_trigger
BEFORE INSERT OR UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.mask_anonymous_reporter();