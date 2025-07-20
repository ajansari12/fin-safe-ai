
-- Create comprehensive Risk Appetite Statement table
CREATE TABLE IF NOT EXISTS public.risk_appetite_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  statement_name TEXT NOT NULL,
  description TEXT,
  effective_date DATE NOT NULL,
  review_date DATE NOT NULL,
  next_review_date DATE NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'expired')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Risk Categories table
CREATE TABLE IF NOT EXISTS public.risk_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.risk_appetite_statements(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('operational', 'financial', 'compliance', 'strategic')),
  appetite_level TEXT NOT NULL CHECK (appetite_level IN ('averse', 'minimal', 'cautious', 'open', 'seeking')),
  description TEXT NOT NULL,
  rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Quantitative Limits table
CREATE TABLE IF NOT EXISTS public.quantitative_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.risk_appetite_statements(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.risk_categories(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  limit_value NUMERIC NOT NULL,
  limit_unit TEXT NOT NULL,
  warning_threshold NUMERIC NOT NULL,
  critical_threshold NUMERIC NOT NULL,
  measurement_frequency TEXT NOT NULL CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  data_source TEXT NOT NULL,
  calculation_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Qualitative Statements table
CREATE TABLE IF NOT EXISTS public.qualitative_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.risk_appetite_statements(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('culture', 'conduct', 'compliance', 'reputation')),
  statement_text TEXT NOT NULL,
  acceptance_criteria TEXT[] NOT NULL DEFAULT '{}',
  rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced KRI table (update existing)
ALTER TABLE public.kri_definitions 
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS owner TEXT,
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
ADD COLUMN IF NOT EXISTS data_source TEXT,
ADD COLUMN IF NOT EXISTS calculation_method TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS target_value NUMERIC,
ADD COLUMN IF NOT EXISTS current_value NUMERIC,
ADD COLUMN IF NOT EXISTS trend TEXT DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'deteriorating')),
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS related_controls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS escalation_procedure TEXT;

-- Create KRI Data Points table
CREATE TABLE IF NOT EXISTS public.kri_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kri_id UUID NOT NULL REFERENCES public.kri_definitions(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  record_date DATE NOT NULL,
  data_quality TEXT NOT NULL DEFAULT 'high' CHECK (data_quality IN ('high', 'medium', 'low')),
  source TEXT NOT NULL,
  comments TEXT,
  validated_by UUID,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create KRI Breach table
CREATE TABLE IF NOT EXISTS public.kri_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kri_id UUID NOT NULL REFERENCES public.kri_definitions(id) ON DELETE CASCADE,
  breach_date DATE NOT NULL,
  breach_level TEXT NOT NULL CHECK (breach_level IN ('warning', 'critical')),
  breach_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  root_cause TEXT,
  impact_assessment TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  assigned_to UUID,
  resolved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Generated Insights table
CREATE TABLE IF NOT EXISTS public.generated_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('predictive', 'diagnostic', 'prescriptive', 'descriptive')),
  category TEXT NOT NULL CHECK (category IN ('operational', 'compliance', 'strategic', 'financial')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  data_sources TEXT[] NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL
);

-- Create Insight Recommendations table
CREATE TABLE IF NOT EXISTS public.insight_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES public.generated_insights(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  estimated_impact TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  assigned_to UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Detail View Logs table for analytics
CREATE TABLE IF NOT EXISTS public.detail_view_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('compliance', 'kri', 'control', 'incident', 'risk')),
  entity_id UUID NOT NULL,
  view_type TEXT NOT NULL CHECK (view_type IN ('modal', 'page')),
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER
);

-- Add RLS policies for Risk Appetite tables
ALTER TABLE public.risk_appetite_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantitative_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualitative_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kri_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kri_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_view_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Risk Appetite Statements
CREATE POLICY "Users can manage their org's risk appetite statements" ON public.risk_appetite_statements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = risk_appetite_statements.org_id
    )
  );

-- RLS Policies for Risk Categories
CREATE POLICY "Users can manage risk categories for their org statements" ON public.risk_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.risk_appetite_statements ras
      JOIN public.profiles p ON p.organization_id = ras.org_id
      WHERE ras.id = risk_categories.statement_id AND p.id = auth.uid()
    )
  );

-- RLS Policies for Quantitative Limits
CREATE POLICY "Users can manage quantitative limits for their org statements" ON public.quantitative_limits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.risk_appetite_statements ras
      JOIN public.profiles p ON p.organization_id = ras.org_id
      WHERE ras.id = quantitative_limits.statement_id AND p.id = auth.uid()
    )
  );

-- RLS Policies for Qualitative Statements
CREATE POLICY "Users can manage qualitative statements for their org statements" ON public.qualitative_statements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.risk_appetite_statements ras
      JOIN public.profiles p ON p.organization_id = ras.org_id
      WHERE ras.id = qualitative_statements.statement_id AND p.id = auth.uid()
    )
  );

-- RLS Policies for KRI Data Points
CREATE POLICY "Users can manage KRI data points for their org" ON public.kri_data_points
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kri_definitions kd
      JOIN public.profiles p ON p.organization_id = kd.org_id
      WHERE kd.id = kri_data_points.kri_id AND p.id = auth.uid()
    )
  );

-- RLS Policies for KRI Breaches
CREATE POLICY "Users can manage KRI breaches for their org" ON public.kri_breaches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kri_definitions kd
      JOIN public.profiles p ON p.organization_id = kd.org_id
      WHERE kd.id = kri_breaches.kri_id AND p.id = auth.uid()
    )
  );

-- RLS Policies for Generated Insights
CREATE POLICY "Users can manage their org's generated insights" ON public.generated_insights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND organization_id = generated_insights.org_id
    )
  );

-- RLS Policies for Insight Recommendations
CREATE POLICY "Users can manage recommendations for their org insights" ON public.insight_recommendations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.generated_insights gi
      JOIN public.profiles p ON p.organization_id = gi.org_id
      WHERE gi.id = insight_recommendations.insight_id AND p.id = auth.uid()
    )
  );

-- RLS Policies for Detail View Logs
CREATE POLICY "Users can create their own detail view logs" ON public.detail_view_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own detail view logs" ON public.detail_view_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_risk_appetite_statements_org_id ON public.risk_appetite_statements(org_id);
CREATE INDEX IF NOT EXISTS idx_risk_categories_statement_id ON public.risk_categories(statement_id);
CREATE INDEX IF NOT EXISTS idx_quantitative_limits_statement_id ON public.quantitative_limits(statement_id);
CREATE INDEX IF NOT EXISTS idx_qualitative_statements_statement_id ON public.qualitative_statements(statement_id);
CREATE INDEX IF NOT EXISTS idx_kri_data_points_kri_id ON public.kri_data_points(kri_id);
CREATE INDEX IF NOT EXISTS idx_kri_data_points_record_date ON public.kri_data_points(record_date);
CREATE INDEX IF NOT EXISTS idx_kri_breaches_kri_id ON public.kri_breaches(kri_id);
CREATE INDEX IF NOT EXISTS idx_kri_breaches_breach_date ON public.kri_breaches(breach_date);
CREATE INDEX IF NOT EXISTS idx_generated_insights_org_id ON public.generated_insights(org_id);
CREATE INDEX IF NOT EXISTS idx_insight_recommendations_insight_id ON public.insight_recommendations(insight_id);
CREATE INDEX IF NOT EXISTS idx_detail_view_logs_user_id ON public.detail_view_logs(user_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_risk_appetite_statements_updated_at BEFORE UPDATE ON public.risk_appetite_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_categories_updated_at BEFORE UPDATE ON public.risk_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quantitative_limits_updated_at BEFORE UPDATE ON public.quantitative_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qualitative_statements_updated_at BEFORE UPDATE ON public.qualitative_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kri_breaches_updated_at BEFORE UPDATE ON public.kri_breaches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insight_recommendations_updated_at BEFORE UPDATE ON public.insight_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
