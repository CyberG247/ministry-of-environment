-- Create enum for report status
CREATE TYPE public.report_status AS ENUM ('submitted', 'assigned', 'in_progress', 'resolved', 'closed');

-- Create enum for report priority
CREATE TYPE public.report_priority AS ENUM ('low', 'medium', 'high', 'emergency');

-- Create enum for report category
CREATE TYPE public.report_category AS ENUM (
  'illegal_dumping', 
  'blocked_drainage', 
  'open_defecation', 
  'noise_pollution', 
  'sanitation_issues', 
  'environmental_nuisance'
);

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('citizen', 'field_officer', 'admin', 'super_admin');

-- Create LGA (Local Government Areas) reference table
CREATE TABLE public.lgas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert Jigawa State LGAs
INSERT INTO public.lgas (name, code) VALUES
  ('Auyo', 'AUY'),
  ('Babura', 'BAB'),
  ('Biriniwa', 'BIR'),
  ('Birnin Kudu', 'BKD'),
  ('Buji', 'BUJ'),
  ('Dutse', 'DUT'),
  ('Gagarawa', 'GAG'),
  ('Garki', 'GAR'),
  ('Gumel', 'GUM'),
  ('Guri', 'GUR'),
  ('Gwaram', 'GWA'),
  ('Gwiwa', 'GWI'),
  ('Hadejia', 'HAD'),
  ('Jahun', 'JAH'),
  ('Kafin Hausa', 'KFH'),
  ('Kaugama', 'KAU'),
  ('Kazaure', 'KAZ'),
  ('Kiri Kasama', 'KKS'),
  ('Kiyawa', 'KIY'),
  ('Maigatari', 'MAI'),
  ('Malam Madori', 'MAL'),
  ('Miga', 'MIG'),
  ('Ringim', 'RIN'),
  ('Roni', 'RON'),
  ('Sule Tankarkar', 'SUT'),
  ('Taura', 'TAU'),
  ('Yankwashi', 'YAN');

-- Create profiles table for user details
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  lga_id UUID REFERENCES public.lgas(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'citizen',
  assigned_lga_id UUID REFERENCES public.lgas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT NOT NULL UNIQUE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  
  -- Report details
  category report_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  lga_id UUID REFERENCES public.lgas(id),
  
  -- Status & Priority
  status report_status NOT NULL DEFAULT 'submitted',
  priority report_priority DEFAULT 'medium',
  
  -- Assignment
  assigned_officer_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Media (stored as array of storage URLs)
  media_urls TEXT[] DEFAULT '{}',
  
  -- Resolution
  resolution_notes TEXT,
  resolution_media_urls TEXT[] DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create report_updates table for tracking status changes
CREATE TABLE public.report_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  previous_status report_status,
  new_status report_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgas ENABLE ROW LEVEL SECURITY;

-- Function to check user role (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- Function to check if user is field officer
CREATE OR REPLACE FUNCTION public.is_field_officer(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'field_officer'
  )
$$;

-- Function to generate tracking ID
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Trigger to auto-generate tracking ID
CREATE OR REPLACE FUNCTION public.set_tracking_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := public.generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_report_tracking_id
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_id();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- LGAs: Public read access
CREATE POLICY "Anyone can view LGAs" ON public.lgas
  FOR SELECT USING (true);

-- Profiles: Users can view and update their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Roles: Only admins can manage, users can view their own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Reports: Citizens can create and view own, officers/admins can view assigned/all
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (reporter_id = auth.uid() OR is_anonymous = true)
  );

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Field officers can view assigned reports" ON public.reports
  FOR SELECT USING (
    public.is_field_officer(auth.uid()) AND 
    assigned_officer_id = auth.uid()
  );

CREATE POLICY "Admins can update all reports" ON public.reports
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Field officers can update assigned reports" ON public.reports
  FOR UPDATE USING (
    public.is_field_officer(auth.uid()) AND 
    assigned_officer_id = auth.uid()
  );

-- Report Updates: Users can view updates on their reports, admins/officers can manage
CREATE POLICY "Users can view own report updates" ON public.report_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reports 
      WHERE reports.id = report_updates.report_id 
      AND reports.reporter_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all report updates" ON public.report_updates
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create report updates" ON public.report_updates
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()) OR public.is_field_officer(auth.uid()));

-- Create storage bucket for report media
INSERT INTO storage.buckets (id, name, public) VALUES ('report-media', 'report-media', true);

-- Storage policies for report media
CREATE POLICY "Anyone can view report media" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-media');

CREATE POLICY "Authenticated users can upload report media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'report-media' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'report-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'report-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable realtime for reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;