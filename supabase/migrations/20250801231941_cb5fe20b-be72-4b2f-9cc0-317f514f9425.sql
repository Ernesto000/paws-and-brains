-- Enable Row Level Security on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents table
-- Since documents appear to be a knowledge base, allow authenticated users to read
CREATE POLICY "Authenticated users can view documents" 
ON public.documents 
FOR SELECT 
TO authenticated 
USING (true);

-- Restrict write operations to admin users only for now
-- (This can be adjusted based on business requirements)
CREATE POLICY "Restrict document modifications" 
ON public.documents 
FOR ALL 
TO authenticated 
USING (false) 
WITH CHECK (false);