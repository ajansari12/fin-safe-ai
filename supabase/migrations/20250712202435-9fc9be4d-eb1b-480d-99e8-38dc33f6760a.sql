-- Add alias columns for backward compatibility with frontend code

-- KRI definitions: Add kri_name as alias for name
ALTER TABLE public.kri_definitions 
ADD COLUMN kri_name TEXT GENERATED ALWAYS AS (name) STORED;

-- Controls: Add control_name as alias for title  
ALTER TABLE public.controls
ADD COLUMN control_name TEXT GENERATED ALWAYS AS (title) STORED;

-- Business functions: Add function_name as alias for name
ALTER TABLE public.business_functions
ADD COLUMN function_name TEXT GENERATED ALWAYS AS (name) STORED;

-- Incident logs: Add incident_title as alias for title
ALTER TABLE public.incident_logs
ADD COLUMN incident_title TEXT GENERATED ALWAYS AS (title) STORED;

-- Compliance policies: Add policy_name as alias for title (if title column exists)
-- Note: This table already has policy_name as the main column

-- Add comments for clarity
COMMENT ON COLUMN public.kri_definitions.kri_name IS 'Alias for name column for backward compatibility';
COMMENT ON COLUMN public.controls.control_name IS 'Alias for title column for backward compatibility';  
COMMENT ON COLUMN public.business_functions.function_name IS 'Alias for name column for backward compatibility';
COMMENT ON COLUMN public.incident_logs.incident_title IS 'Alias for title column for backward compatibility';