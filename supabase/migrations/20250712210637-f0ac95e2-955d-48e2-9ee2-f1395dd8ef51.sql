-- Create missing KRI appetite variance table
CREATE TABLE IF NOT EXISTS public.kri_appetite_variance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kri_id UUID NOT NULL,
  measurement_date DATE NOT NULL,
  actual_value NUMERIC NOT NULL,
  appetite_threshold NUMERIC,
  variance_percentage NUMERIC,
  variance_status TEXT NOT NULL DEFAULT 'within_appetite' CHECK (variance_status IN ('within_appetite', 'warning', 'breach')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missing appetite escalation rules table
CREATE TABLE IF NOT EXISTS public.appetite_escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  trigger_condition TEXT NOT NULL,
  escalation_level INTEGER NOT NULL,
  threshold_value NUMERIC NOT NULL,
  auto_escalate BOOLEAN DEFAULT true,
  escalation_delay_hours INTEGER DEFAULT 0,
  notification_recipients JSONB DEFAULT '[]'::jsonb,
  rule_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missing appetite board reports table
CREATE TABLE IF NOT EXISTS public.appetite_board_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published')),
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  executive_summary TEXT,
  key_findings TEXT,
  recommendations TEXT,
  trend_analysis TEXT,
  risk_posture_score NUMERIC,
  generated_by UUID,
  generated_by_name TEXT,
  approved_by UUID,
  approved_by_name TEXT,
  approval_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add control_type column to controls table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'controls' AND column_name = 'control_type') THEN
    ALTER TABLE public.controls ADD COLUMN control_type TEXT;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.kri_appetite_variance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appetite_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appetite_board_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for kri_appetite_variance
CREATE POLICY "Users can view KRI appetite variance for their org" ON public.kri_appetite_variance
  FOR SELECT USING (
    kri_id IN (
      SELECT id FROM public.kri_definitions 
      WHERE org_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert KRI appetite variance for their org" ON public.kri_appetite_variance
  FOR INSERT WITH CHECK (
    kri_id IN (
      SELECT id FROM public.kri_definitions 
      WHERE org_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update KRI appetite variance for their org" ON public.kri_appetite_variance
  FOR UPDATE USING (
    kri_id IN (
      SELECT id FROM public.kri_definitions 
      WHERE org_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Create RLS policies for appetite_escalation_rules
CREATE POLICY "Users can manage escalation rules for their org" ON public.appetite_escalation_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = appetite_escalation_rules.org_id
    )
  );

-- Create RLS policies for appetite_board_reports
CREATE POLICY "Users can manage board reports for their org" ON public.appetite_board_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = appetite_board_reports.org_id
    )
  );

-- Create function to calculate KRI appetite variance
CREATE OR REPLACE FUNCTION public.calculate_kri_appetite_variance_enhanced(
  p_kri_id UUID,
  p_actual_value NUMERIC,
  p_measurement_date DATE
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appetite_threshold NUMERIC;
  v_variance_percentage NUMERIC;
  v_variance_status TEXT;
BEGIN
  -- Get appetite threshold from KRI definition or linked appetite statement
  SELECT COALESCE(target_value, 0) INTO v_appetite_threshold
  FROM public.kri_definitions
  WHERE id = p_kri_id;
  
  -- Calculate variance percentage
  IF v_appetite_threshold > 0 THEN
    v_variance_percentage := ((p_actual_value - v_appetite_threshold) / v_appetite_threshold) * 100;
  ELSE
    v_variance_percentage := 0;
  END IF;
  
  -- Determine variance status
  IF ABS(v_variance_percentage) <= 5 THEN
    v_variance_status := 'within_appetite';
  ELSIF ABS(v_variance_percentage) <= 15 THEN
    v_variance_status := 'warning';
  ELSE
    v_variance_status := 'breach';
  END IF;
  
  -- Insert or update variance record
  INSERT INTO public.kri_appetite_variance (
    kri_id, measurement_date, actual_value, appetite_threshold, 
    variance_percentage, variance_status
  ) VALUES (
    p_kri_id, p_measurement_date, p_actual_value, v_appetite_threshold,
    v_variance_percentage, v_variance_status
  )
  ON CONFLICT (kri_id, measurement_date) 
  DO UPDATE SET
    actual_value = EXCLUDED.actual_value,
    appetite_threshold = EXCLUDED.appetite_threshold,
    variance_percentage = EXCLUDED.variance_percentage,
    variance_status = EXCLUDED.variance_status,
    updated_at = now();
END;
$$;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_kri_appetite_variance_updated_at
  BEFORE UPDATE ON public.kri_appetite_variance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appetite_escalation_rules_updated_at
  BEFORE UPDATE ON public.appetite_escalation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appetite_board_reports_updated_at
  BEFORE UPDATE ON public.appetite_board_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();