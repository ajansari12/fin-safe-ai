-- Add missing columns to align with requirements while keeping enhanced features

-- Add name and description columns to custom_dashboards
ALTER TABLE public.custom_dashboards 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add simple position column to dashboard_widgets (in addition to existing position_config)
ALTER TABLE public.dashboard_widgets 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Update existing records to have default values
UPDATE public.custom_dashboards 
SET name = 'Custom Dashboard ' || substr(id::text, 1, 8)
WHERE name IS NULL;

UPDATE public.custom_dashboards 
SET description = 'Auto-generated dashboard'
WHERE description IS NULL;