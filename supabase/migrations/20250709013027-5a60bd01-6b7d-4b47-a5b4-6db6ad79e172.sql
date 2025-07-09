-- Phase 1: Complete Database Fix - Corrective Migration (Fixed)
DO $$
DECLARE
    framework_record RECORD;
    missing_count INTEGER := 0;
    updated_count INTEGER := 0;
BEGIN
    -- Fix 1: Ensure ALL frameworks with components have progress records
    FOR framework_record IN 
        SELECT DISTINCT gf.id as framework_id, gf.framework_name
        FROM public.generated_frameworks gf
        INNER JOIN public.framework_components fc ON fc.framework_id = gf.id
        WHERE NOT EXISTS (
            SELECT 1 FROM public.framework_component_progress fcp 
            WHERE fcp.component_id = fc.id
        )
    LOOP
        -- Insert missing progress records
        INSERT INTO public.framework_component_progress (
            component_id,
            completion_percentage,
            status,
            last_activity_at
        )
        SELECT 
            fc.id,
            0,
            'not_started',
            now()
        FROM public.framework_components fc
        WHERE fc.framework_id = framework_record.framework_id
        AND NOT EXISTS (
            SELECT 1 FROM public.framework_component_progress fcp 
            WHERE fcp.component_id = fc.id
        );
        
        GET DIAGNOSTICS missing_count = ROW_COUNT;
        RAISE NOTICE 'Added % progress records for framework: %', missing_count, framework_record.framework_name;
    END LOOP;
    
    -- Fix 2: Force update ALL framework completion percentages
    UPDATE public.generated_frameworks
    SET 
        overall_completion_percentage = (
            SELECT COALESCE(AVG(fcp.completion_percentage), 0)::INTEGER
            FROM public.framework_components fc
            LEFT JOIN public.framework_component_progress fcp ON fc.id = fcp.component_id
            WHERE fc.framework_id = generated_frameworks.id
        ),
        last_activity_at = now()
    WHERE EXISTS (
        SELECT 1 FROM public.framework_components fc 
        WHERE fc.framework_id = generated_frameworks.id
    );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated completion percentages for % frameworks', updated_count;
    
    RAISE NOTICE 'Corrective migration completed successfully';
END $$;