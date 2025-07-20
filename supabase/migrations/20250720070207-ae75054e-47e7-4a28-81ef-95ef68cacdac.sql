-- Create comprehensive risk appetite management tables

-- Update risk appetite statements table to match the expected schema
DROP TABLE IF EXISTS public.risk_appetite_statements CASCADE;

CREATE TABLE public.risk_appetite_statements (
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

-- Create risk categories table
CREATE TABLE public.risk_categories (
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

-- Create quantitative limits table
CREATE TABLE public.quantitative_limits (
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

-- Create qualitative statements table
CREATE TABLE public.qualitative_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.risk_appetite_statements(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('culture', 'conduct', 'compliance', 'reputation')),
  statement_text TEXT NOT NULL,
  acceptance_criteria TEXT[] NOT NULL DEFAULT '{}',
  rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.risk_appetite_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantitative_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualitative_statements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for risk appetite statements
CREATE POLICY "Users can manage their org's risk appetite statements"
ON public.risk_appetite_statements
FOR ALL
USING (check_user_org_access(org_id));

-- Create RLS policies for risk categories
CREATE POLICY "Users can manage risk categories for their org statements"
ON public.risk_categories
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.risk_appetite_statements ras
  WHERE ras.id = risk_categories.statement_id 
  AND check_user_org_access(ras.org_id)
));

-- Create RLS policies for quantitative limits
CREATE POLICY "Users can manage quantitative limits for their org statements"
ON public.quantitative_limits
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.risk_appetite_statements ras
  WHERE ras.id = quantitative_limits.statement_id 
  AND check_user_org_access(ras.org_id)
));

-- Create RLS policies for qualitative statements
CREATE POLICY "Users can manage qualitative statements for their org statements"
ON public.qualitative_statements
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.risk_appetite_statements ras
  WHERE ras.id = qualitative_statements.statement_id 
  AND check_user_org_access(ras.org_id)
));

-- Create updated_at triggers
CREATE TRIGGER update_risk_appetite_statements_updated_at
  BEFORE UPDATE ON public.risk_appetite_statements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_categories_updated_at
  BEFORE UPDATE ON public.risk_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quantitative_limits_updated_at
  BEFORE UPDATE ON public.quantitative_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_qualitative_statements_updated_at
  BEFORE UPDATE ON public.qualitative_statements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_risk_appetite_statements_org_id ON public.risk_appetite_statements(org_id);
CREATE INDEX idx_risk_appetite_statements_status ON public.risk_appetite_statements(approval_status);
CREATE INDEX idx_risk_categories_statement_id ON public.risk_categories(statement_id);
CREATE INDEX idx_quantitative_limits_statement_id ON public.quantitative_limits(statement_id);
CREATE INDEX idx_qualitative_statements_statement_id ON public.qualitative_statements(statement_id);