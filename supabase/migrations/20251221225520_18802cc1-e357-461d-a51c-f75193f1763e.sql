-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_on_status_change BOOLEAN NOT NULL DEFAULT true,
  email_on_assignment BOOLEAN NOT NULL DEFAULT true,
  email_on_resolution BOOLEAN NOT NULL DEFAULT true,
  sms_on_status_change BOOLEAN NOT NULL DEFAULT false,
  sms_on_resolution BOOLEAN NOT NULL DEFAULT true,
  push_on_status_change BOOLEAN NOT NULL DEFAULT true,
  push_on_assignment BOOLEAN NOT NULL DEFAULT true,
  push_on_resolution BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own notification preferences"
ON public.notification_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
ON public.notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
ON public.notification_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create news table for ministry news
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  author_id UUID,
  category TEXT DEFAULT 'general',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Anyone can view published news
CREATE POLICY "Anyone can view published news"
ON public.news
FOR SELECT
USING (is_published = true);

-- Admins can view all news
CREATE POLICY "Admins can view all news"
ON public.news
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can create news
CREATE POLICY "Admins can create news"
ON public.news
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Admins can update news
CREATE POLICY "Admins can update news"
ON public.news
FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete news
CREATE POLICY "Admins can delete news"
ON public.news
FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();