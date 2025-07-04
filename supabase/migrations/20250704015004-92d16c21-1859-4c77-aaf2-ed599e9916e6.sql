-- Fix missing RLS on questionnaire_templates and risk_framework_templates tables
ALTER TABLE public.questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_framework_templates ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for questionnaire_templates
CREATE POLICY "Users can view questionnaire templates for their org" 
ON public.questionnaire_templates FOR SELECT 
USING (
  org_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage questionnaire templates for their org" 
ON public.questionnaire_templates FOR ALL 
USING (
  org_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- Add RLS policies for risk_framework_templates
CREATE POLICY "Users can view risk framework templates for their org" 
ON public.risk_framework_templates FOR SELECT 
USING (
  org_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage risk framework templates for their org" 
ON public.risk_framework_templates FOR ALL 
USING (
  org_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);