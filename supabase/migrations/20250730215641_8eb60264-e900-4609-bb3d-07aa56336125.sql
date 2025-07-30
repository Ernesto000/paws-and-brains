-- Create enum for veterinary specializations
CREATE TYPE public.veterinary_specialization AS ENUM (
  'small_animal',
  'large_animal', 
  'equine',
  'exotic',
  'emergency_critical_care',
  'surgery',
  'internal_medicine',
  'dermatology',
  'ophthalmology',
  'cardiology',
  'oncology',
  'pathology',
  'radiology',
  'anesthesiology',
  'behavior',
  'nutrition',
  'public_health',
  'research',
  'other'
);

-- Create profiles table for veterinarians
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  specialization veterinary_specialization,
  license_number TEXT,
  practice_name TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

-- Create storage policies for verification documents
CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);