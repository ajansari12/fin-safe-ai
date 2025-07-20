-- Phase 2: Enhanced KRI Management and Phase 3: Risk Appetite Database Schema

-- Risk Appetite Statement Tables
CREATE TABLE public.risk_appetite_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  statement_name TEXT NOT NULL,
  risk_category TEXT NOT NULL,
  appetite_level TEXT NOT NULL CHECK (appetite_level IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
  quantitative_limit NUMERIC,
  quantitative_unit TEXT,
  qualitative_statement TEXT,
  tolerance_level TEXT NOT NULL CHECK (tolerance_level IN ('low', 'medium', 'high')),
  review_frequency TEXT NOT NULL DEFAULT 'quarterly',
  owner_role TEXT,
  business_justification TEXT,
  measurement_methodology TEXT,
  reporting_frequency TEXT NOT NULL DEFAULT 'monthly',
  escalation_triggers JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  next_review_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk Categories Configuration
CREATE TABLE public.risk_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  category_name TEXT NOT NULL,
  category_code TEXT NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES public.risk_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, category_code)
);

-- Risk Thresholds (Enhanced)
CREATE TABLE public.risk_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  statement_id UUID REFERENCES public.risk_appetite_statements(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.risk_categories(id),
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('quantitative', 'qualitative')),
  threshold_value NUMERIC,
  threshold_unit TEXT,
  warning_level NUMERIC,
  critical_level NUMERIC,
  tolerance_level TEXT NOT NULL CHECK (tolerance_level IN ('low', 'medium', 'high')),
  measurement_frequency TEXT NOT NULL DEFAULT 'monthly',
  data_source TEXT,
  calculation_method TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced KRI Definitions (if not exists, create additional columns)
DO $$ 
BEGIN
  -- Add traffic light status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kri_definitions' AND column_name = 'traffic_light_status') THEN
    ALTER TABLE public.kri_definitions ADD COLUMN traffic_light_status TEXT DEFAULT 'green' CHECK (traffic_light_status IN ('green', 'amber', 'red'));
  END IF;
  
  -- Add alert configuration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kri_definitions' AND column_name = 'alert_config') THEN
    ALTER TABLE public.kri_definitions ADD COLUMN alert_config JSONB DEFAULT '{"email_alerts": true, "dashboard_alerts": true, "escalation_levels": []}'::jsonb;
  END IF;
  
  -- Add data quality metrics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kri_definitions' AND column_name = 'data_quality_score') THEN
    ALTER TABLE public.kri_definitions ADD COLUMN data_quality_score NUMERIC DEFAULT 100;
  END IF;
  
  -- Add automation status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kri_definitions' AND column_name = 'is_automated') THEN
    ALTER TABLE public.kri_definitions ADD COLUMN is_automated BOOLEAN DEFAULT false;
  END IF;
END $$;

-- KRI Breach Notifications
CREATE TABLE public.kri_breach_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kri_id UUID REFERENCES public.kri_definitions(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  breach_type TEXT NOT NULL CHECK (breach_type IN ('warning', 'critical', 'tolerance')),
  breach_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  breach_percentage NUMERIC,
  breach_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  escalation_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- KRI Performance Metrics
CREATE TABLE public.kri_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kri_id UUID REFERENCES public.kri_definitions(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  measurement_date DATE NOT NULL,
  actual_value NUMERIC NOT NULL,
  target_value NUMERIC,
  variance_percentage NUMERIC,
  trend_direction TEXT CHECK (trend_direction IN ('increasing', 'decreasing', 'stable')),
  data_quality_score NUMERIC DEFAULT 100,
  calculation_method TEXT,
  data_source TEXT,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
  validated_by UUID,
  validated_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(kri_id, measurement_date)
);

-- Enable RLS on all new tables
ALTER TABLE public.risk_appetite_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kri_breach_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kri_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Risk Appetite Statements
CREATE POLICY "Users can manage their org's risk appetite statements" 
ON public.risk_appetite_statements 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND organization_id = risk_appetite_statements.org_id
));

-- RLS Policies for Risk Categories
CREATE POLICY "Users can manage their org's risk categories" 
ON public.risk_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND organization_id = risk_categories.org_id
));

-- RLS Policies for Risk Thresholds
CREATE POLICY "Users can manage risk thresholds via statements" 
ON public.risk_thresholds 
FOR ALL 
USING (statement_id IN (
  SELECT id FROM public.risk_appetite_statements 
  WHERE org_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
));

-- RLS Policies for KRI Breach Notifications
CREATE POLICY "Users can manage their org's KRI breach notifications" 
ON public.kri_breach_notifications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND organization_id = kri_breach_notifications.org_id
));

-- RLS Policies for KRI Performance Metrics
CREATE POLICY "Users can manage their org's KRI performance metrics" 
ON public.kri_performance_metrics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND organization_id = kri_performance_metrics.org_id
));

-- Create function to update traffic light status based on latest KRI values
CREATE OR REPLACE FUNCTION public.update_kri_traffic_light_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  latest_value NUMERIC;
  warning_threshold NUMERIC;
  critical_threshold NUMERIC;
  new_status TEXT;
BEGIN
  -- Get the latest KRI value and thresholds
  SELECT 
    kpm.actual_value,
    kd.warning_threshold::NUMERIC,
    kd.critical_threshold::NUMERIC
  INTO latest_value, warning_threshold, critical_threshold
  FROM public.kri_performance_metrics kpm
  JOIN public.kri_definitions kd ON kd.id = kpm.kri_id
  WHERE kpm.kri_id = NEW.kri_id
  ORDER BY kpm.measurement_date DESC
  LIMIT 1;
  
  -- Determine traffic light status
  IF latest_value >= critical_threshold THEN
    new_status := 'red';
  ELSIF latest_value >= warning_threshold THEN
    new_status := 'amber';
  ELSE
    new_status := 'green';
  END IF;
  
  -- Update KRI definition with new status
  UPDATE public.kri_definitions 
  SET traffic_light_status = new_status,
      updated_at = now()
  WHERE id = NEW.kri_id;
  
  -- Create breach notification if threshold exceeded
  IF new_status IN ('amber', 'red') THEN
    INSERT INTO public.kri_breach_notifications (
      kri_id, org_id, breach_type, breach_value, threshold_value, 
      breach_percentage, breach_detected_at
    )
    SELECT 
      NEW.kri_id,
      NEW.org_id,
      CASE WHEN new_status = 'red' THEN 'critical' ELSE 'warning' END,
      latest_value,
      CASE WHEN new_status = 'red' THEN critical_threshold ELSE warning_threshold END,
      ((latest_value - CASE WHEN new_status = 'red' THEN critical_threshold ELSE warning_threshold END) / 
       CASE WHEN new_status = 'red' THEN critical_threshold ELSE warning_threshold END) * 100,
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM public.kri_breach_notifications
      WHERE kri_id = NEW.kri_id 
      AND breach_detected_at::date = CURRENT_DATE
      AND breach_type = CASE WHEN new_status = 'red' THEN 'critical' ELSE 'warning' END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic traffic light updates
CREATE TRIGGER update_kri_traffic_light_trigger
  AFTER INSERT OR UPDATE ON public.kri_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kri_traffic_light_status();

-- Create function to calculate KRI trend direction
CREATE OR REPLACE FUNCTION public.calculate_kri_trend_direction()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  previous_value NUMERIC;
  current_value NUMERIC;
  trend TEXT;
BEGIN
  current_value := NEW.actual_value;
  
  -- Get previous value
  SELECT actual_value INTO previous_value
  FROM public.kri_performance_metrics
  WHERE kri_id = NEW.kri_id 
  AND measurement_date < NEW.measurement_date
  ORDER BY measurement_date DESC
  LIMIT 1;
  
  -- Calculate trend
  IF previous_value IS NULL THEN
    trend := 'stable';
  ELSIF current_value > previous_value * 1.05 THEN
    trend := 'increasing';
  ELSIF current_value < previous_value * 0.95 THEN
    trend := 'decreasing';
  ELSE
    trend := 'stable';
  END IF;
  
  NEW.trend_direction := trend;
  
  RETURN NEW;
END;
$$;

-- Create trigger for trend calculation
CREATE TRIGGER calculate_kri_trend_trigger
  BEFORE INSERT OR UPDATE ON public.kri_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_kri_trend_direction();

-- Add updated_at triggers for all new tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risk_appetite_statements_updated_at
  BEFORE UPDATE ON public.risk_appetite_statements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_categories_updated_at
  BEFORE UPDATE ON public.risk_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_thresholds_updated_at
  BEFORE UPDATE ON public.risk_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kri_breach_notifications_updated_at
  BEFORE UPDATE ON public.kri_breach_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kri_performance_metrics_updated_at
  BEFORE UPDATE ON public.kri_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default OSFI E-21 risk categories
INSERT INTO public.risk_categories (org_id, category_name, category_code, description, sort_order) 
SELECT 
  p.organization_id,
  category_name,
  category_code,
  description,
  sort_order
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Credit Risk', 'CR', 'Risk of loss due to borrower default or credit deterioration', 1),
    ('Market Risk', 'MR', 'Risk of loss due to adverse market movements', 2),
    ('Liquidity Risk', 'LR', 'Risk of inability to meet funding obligations', 3),
    ('Operational Risk', 'OR', 'Risk of loss from inadequate processes, systems, or external events', 4),
    ('Interest Rate Risk', 'IRR', 'Risk from changes in interest rates affecting earnings or capital', 5),
    ('Foreign Exchange Risk', 'FXR', 'Risk from adverse currency exchange rate movements', 6),
    ('Reputation Risk', 'RR', 'Risk of negative public opinion affecting business', 7),
    ('Strategic Risk', 'SR', 'Risk from poor strategic decisions or market changes', 8),
    ('Compliance Risk', 'COMP', 'Risk of regulatory penalties or sanctions', 9),
    ('Technology Risk', 'TR', 'Risk from technology failures or cyber threats', 10)
) AS categories(category_name, category_code, description, sort_order)
WHERE p.id = auth.uid()
ON CONFLICT (org_id, category_code) DO NOTHING;