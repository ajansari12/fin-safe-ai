-- Phase 1: Fix Progress Tracking Issues

-- First, let's test updating a component progress and see if trigger fires
UPDATE framework_component_progress 
SET completion_percentage = 50,
    status = 'in_progress',
    last_activity_at = now()
WHERE component_id = 'b2bd047e-831b-420e-9b5b-8886b44a44d5';

-- Manually trigger the framework progress update function to test
UPDATE generated_frameworks
SET 
  overall_completion_percentage = (
    SELECT COALESCE(AVG(fcp.completion_percentage), 0)::INTEGER
    FROM framework_components fc
    LEFT JOIN framework_component_progress fcp ON fc.id = fcp.component_id
    WHERE fc.framework_id = '7be633d9-9c77-4faa-aba5-b8836be59499'
  ),
  last_activity_at = now(),
  is_stagnant = false,
  stagnant_since = NULL
WHERE id = '7be633d9-9c77-4faa-aba5-b8836be59499';

-- Phase 2: Data Cleanup - Archive duplicate frameworks
UPDATE generated_frameworks 
SET implementation_status = 'archived',
    updated_at = now()
WHERE framework_name = 'retail-banking Impact Tolerance Framework' 
AND id != '7be633d9-9c77-4faa-aba5-b8836be59499';

-- Archive frameworks with no components (old entries)
UPDATE generated_frameworks 
SET implementation_status = 'archived',
    updated_at = now()
WHERE id IN (
  SELECT gf.id 
  FROM generated_frameworks gf
  LEFT JOIN framework_components fc ON fc.framework_id = gf.id
  WHERE fc.id IS NULL
  AND gf.implementation_status != 'archived'
);

-- Phase 3: Fix the trigger function - recreate it to ensure it works properly
CREATE OR REPLACE FUNCTION public.update_framework_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_framework_id UUID;
  v_avg_progress INTEGER;
BEGIN
  -- Get the framework ID from the component
  SELECT framework_id INTO v_framework_id
  FROM framework_components 
  WHERE id = COALESCE(NEW.component_id, OLD.component_id);
  
  -- Calculate average progress for this framework
  SELECT COALESCE(AVG(fcp.completion_percentage), 0)::INTEGER INTO v_avg_progress
  FROM framework_components fc
  LEFT JOIN framework_component_progress fcp ON fc.id = fcp.component_id
  WHERE fc.framework_id = v_framework_id;
  
  -- Update the framework with calculated progress
  UPDATE generated_frameworks
  SET 
    overall_completion_percentage = v_avg_progress,
    last_activity_at = now(),
    is_stagnant = false,
    stagnant_since = NULL
  WHERE id = v_framework_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_framework_progress_trigger ON framework_component_progress;
CREATE TRIGGER update_framework_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON framework_component_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_framework_progress();

-- Test the trigger by updating another component
UPDATE framework_component_progress 
SET completion_percentage = 25,
    status = 'in_progress',
    last_activity_at = now()
WHERE component_id = '01af48c9-69cc-4dc2-aecd-e38b781b7591';

-- Phase 4: Force recalculate all framework progress
UPDATE generated_frameworks
SET 
  overall_completion_percentage = (
    SELECT COALESCE(AVG(fcp.completion_percentage), 0)::INTEGER
    FROM framework_components fc
    LEFT JOIN framework_component_progress fcp ON fc.id = fcp.component_id
    WHERE fc.framework_id = generated_frameworks.id
  ),
  last_activity_at = now()
WHERE EXISTS (
  SELECT 1 FROM framework_components fc 
  WHERE fc.framework_id = generated_frameworks.id
);