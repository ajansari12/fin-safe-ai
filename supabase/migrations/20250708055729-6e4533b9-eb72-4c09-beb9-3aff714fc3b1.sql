-- Initialize component progress for existing frameworks
DO $$
DECLARE
    framework_record RECORD;
    component_record RECORD;
BEGIN
    -- Initialize progress for all existing frameworks that have components but no progress records
    FOR framework_record IN 
        SELECT DISTINCT gf.id as framework_id, gf.organization_id
        FROM public.generated_frameworks gf
        INNER JOIN public.framework_components fc ON fc.framework_id = gf.id
        WHERE NOT EXISTS (
            SELECT 1 FROM public.framework_component_progress fcp 
            WHERE fcp.component_id = fc.id
        )
    LOOP
        -- Insert progress records for all components of this framework
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
        
        RAISE NOTICE 'Initialized progress for framework %', framework_record.framework_id;
    END LOOP;
    
    -- Update overall completion percentage for all frameworks
    UPDATE public.generated_frameworks
    SET overall_completion_percentage = (
        SELECT COALESCE(AVG(fcp.completion_percentage), 0)::INTEGER
        FROM public.framework_components fc
        LEFT JOIN public.framework_component_progress fcp ON fc.id = fcp.component_id
        WHERE fc.framework_id = generated_frameworks.id
    )
    WHERE EXISTS (
        SELECT 1 FROM public.framework_components fc 
        WHERE fc.framework_id = generated_frameworks.id
    );
    
    RAISE NOTICE 'Migration completed successfully';
END $$;