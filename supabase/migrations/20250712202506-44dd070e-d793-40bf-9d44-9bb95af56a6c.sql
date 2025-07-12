-- Add proper foreign key constraints that were missing

-- Add foreign key constraint for continuity_plans -> business_functions
-- First check if constraint already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_continuity_plans_business_function'
        AND table_name = 'continuity_plans'
    ) THEN
        ALTER TABLE public.continuity_plans
        ADD CONSTRAINT fk_continuity_plans_business_function
        FOREIGN KEY (business_function_id) REFERENCES public.business_functions(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for kri_definitions -> controls  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_kri_definitions_control'
        AND table_name = 'kri_definitions'
    ) THEN
        ALTER TABLE public.kri_definitions
        ADD CONSTRAINT fk_kri_definitions_control
        FOREIGN KEY (control_id) REFERENCES public.controls(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraint for control_tests -> controls
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_control_tests_control'
        AND table_name = 'control_tests'
    ) THEN
        ALTER TABLE public.control_tests
        ADD CONSTRAINT fk_control_tests_control
        FOREIGN KEY (control_id) REFERENCES public.controls(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for impact_tolerances -> business_functions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_impact_tolerances_business_function'
        AND table_name = 'impact_tolerances'
    ) THEN
        ALTER TABLE public.impact_tolerances
        ADD CONSTRAINT fk_impact_tolerances_business_function
        FOREIGN KEY (function_id) REFERENCES public.business_functions(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for dependencies -> business_functions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_dependencies_business_function'
        AND table_name = 'dependencies'
    ) THEN
        ALTER TABLE public.dependencies
        ADD CONSTRAINT fk_dependencies_business_function
        FOREIGN KEY (business_function_id) REFERENCES public.business_functions(id)
        ON DELETE CASCADE;
    END IF;
END $$;