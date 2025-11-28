-- Add phone_number and whatsapp_status columns to names table
ALTER TABLE public.names
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'pending';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_names_phone ON public.names(phone_number);
CREATE INDEX IF NOT EXISTS idx_names_status ON public.names(whatsapp_status);
