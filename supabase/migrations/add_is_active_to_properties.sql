-- Add is_active column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Create index for filtering active properties
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties(is_active);

-- Comment
COMMENT ON COLUMN public.properties.is_active IS 'Whether the property is active (true) or inactive (false)';
