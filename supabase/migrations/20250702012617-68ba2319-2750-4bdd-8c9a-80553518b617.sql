
-- Template and Best Practice Library Database Schema Extensions

-- Industry Template Libraries
CREATE TABLE public.industry_template_libraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_description TEXT,
  industry_sector TEXT NOT NULL,
  sub_sector TEXT,
  template_type TEXT NOT NULL DEFAULT 'governance',
  complexity_level TEXT NOT NULL DEFAULT 'medium',
  regulatory_basis TEXT[],
  template_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  customization_rules JSONB DEFAULT '{}'::JSONB,
  success_metrics JSONB DEFAULT '[]'::JSONB,
  implementation_steps JSONB DEFAULT '[]'::JSONB,
  is_featured BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  effectiveness_score NUMERIC(3,2) DEFAULT 0.0,
  last_updated_date DATE DEFAULT CURRENT_DATE,
  created_by UUID,
  created_by_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Template Categories
CREATE TABLE public.template_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL,
  category_description TEXT,
  parent_category_id UUID REFERENCES public.template_categories(id),
  industry_focus TEXT[],
  regulatory_frameworks TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Regulatory Template Mappings
CREATE TABLE public.regulatory_template_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.industry_template_libraries(id),
  regulation_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  regulatory_section TEXT,
  compliance_level TEXT NOT NULL DEFAULT 'required',
  mapping_confidence NUMERIC(3,2) DEFAULT 1.0,
  implementation_guidance TEXT,
  validation_criteria JSONB DEFAULT '{}'::JSONB,
  last_reviewed_date DATE DEFAULT CURRENT_DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Template Customization Rules
CREATE TABLE public.template_customization_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.industry_template_libraries(id),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'conditional',
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::JSONB,
  customization_actions JSONB NOT NULL DEFAULT '[]'::JSONB,
  parameter_adjustments JSONB DEFAULT '{}'::JSONB,
  priority INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Best Practice Guides
CREATE TABLE public.best_practice_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.industry_template_libraries(id),
  guide_title TEXT NOT NULL,
  guide_type TEXT NOT NULL DEFAULT 'implementation',
  content_sections JSONB NOT NULL DEFAULT '[]'::JSONB,
  step_by_step_instructions JSONB DEFAULT '[]'::JSONB,
  common_challenges JSONB DEFAULT '[]'::JSONB,
  troubleshooting_tips JSONB DEFAULT '[]'::JSONB,
  success_factors JSONB DEFAULT '[]'::JSONB,
  case_studies JSONB DEFAULT '[]'::JSONB,
  target_audience TEXT[],
  estimated_completion_time INTEGER, -- in hours
  difficulty_level TEXT DEFAULT 'intermediate',
  prerequisites TEXT[],
  tools_required TEXT[],
  created_by UUID,
  created_by_name TEXT,
  review_status TEXT DEFAULT 'draft',
  reviewed_by UUID,
  reviewed_by_name TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Template Effectiveness Tracking
CREATE TABLE public.template_effectiveness_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.industry_template_libraries(id),
  org_id UUID NOT NULL,
  implementation_start_date DATE NOT NULL,
  implementation_completion_date DATE,
  actual_vs_planned_timeline INTEGER, -- days difference
  implementation_success_rate NUMERIC(3,2),
  user_satisfaction_score INTEGER CHECK (user_satisfaction_score >= 1 AND user_satisfaction_score <= 5),
  compliance_improvement_score NUMERIC(3,2),
  operational_efficiency_gain NUMERIC(3,2),
  cost_benefit_ratio NUMERIC(5,2),
  issues_encountered JSONB DEFAULT '[]'::JSONB,
  lessons_learned JSONB DEFAULT '[]'::JSONB,
  recommendations_for_improvement JSONB DEFAULT '[]'::JSONB,
  would_recommend BOOLEAN,
  implementation_notes TEXT,
  reported_by UUID,
  reported_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Knowledge Base Articles
CREATE TABLE public.knowledge_base_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_title TEXT NOT NULL,
  article_type TEXT NOT NULL DEFAULT 'guidance',
  content_body TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[],
  related_templates UUID[],
  related_regulations TEXT[],
  industry_relevance TEXT[],
  target_roles TEXT[],
  content_format TEXT DEFAULT 'markdown',
  external_references JSONB DEFAULT '[]'::JSONB,
  attachments JSONB DEFAULT '[]'::JSONB,
  view_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  last_reviewed_date DATE,
  content_freshness_score NUMERIC(3,2) DEFAULT 1.0,
  search_vector tsvector,
  created_by UUID,
  created_by_name TEXT,
  reviewed_by UUID,
  reviewed_by_name TEXT,
  publication_status TEXT DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Template Usage Analytics
CREATE TABLE public.template_usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.industry_template_libraries(id),
  org_id UUID NOT NULL,
  user_id UUID,
  usage_type TEXT NOT NULL DEFAULT 'view',
  session_duration INTEGER, -- in seconds
  customization_applied BOOLEAN DEFAULT false,
  customization_details JSONB DEFAULT '{}'::JSONB,
  success_outcome BOOLEAN,
  feedback_provided BOOLEAN DEFAULT false,
  usage_context TEXT,
  device_type TEXT,
  access_method TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Template Dependencies
CREATE TABLE public.template_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_template_id UUID NOT NULL REFERENCES public.industry_template_libraries(id),
  dependent_template_id UUID NOT NULL REFERENCES public.industry_template_libraries(id),
  dependency_type TEXT NOT NULL DEFAULT 'requires',
  dependency_strength TEXT NOT NULL DEFAULT 'medium',
  implementation_order INTEGER,
  integration_notes TEXT,
  validation_rules JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.industry_template_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_template_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_customization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.best_practice_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_effectiveness_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_dependencies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view published templates" ON public.industry_template_libraries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their org's templates" ON public.industry_template_libraries
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = industry_template_libraries.org_id));

CREATE POLICY "Public can view active categories" ON public.template_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view current regulatory mappings" ON public.regulatory_template_mappings
  FOR SELECT USING (is_current = true);

CREATE POLICY "Users can view published guides" ON public.best_practice_guides
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can manage their org's effectiveness tracking" ON public.template_effectiveness_tracking
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = template_effectiveness_tracking.org_id));

CREATE POLICY "Users can view published knowledge articles" ON public.knowledge_base_articles
  FOR SELECT USING (publication_status = 'published');

CREATE POLICY "Users can track their org's template usage" ON public.template_usage_analytics
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = template_usage_analytics.org_id));

CREATE POLICY "Public can view active dependencies" ON public.template_dependencies
  FOR SELECT USING (is_active = true);

-- Add update triggers
CREATE TRIGGER update_industry_template_libraries_timestamp 
  BEFORE UPDATE ON public.industry_template_libraries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_categories_timestamp 
  BEFORE UPDATE ON public.template_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulatory_template_mappings_timestamp 
  BEFORE UPDATE ON public.regulatory_template_mappings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_customization_rules_timestamp 
  BEFORE UPDATE ON public.template_customization_rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_best_practice_guides_timestamp 
  BEFORE UPDATE ON public.best_practice_guides 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_effectiveness_tracking_timestamp 
  BEFORE UPDATE ON public.template_effectiveness_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_articles_timestamp 
  BEFORE UPDATE ON public.knowledge_base_articles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_dependencies_timestamp 
  BEFORE UPDATE ON public.template_dependencies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create search index for knowledge base
CREATE INDEX idx_knowledge_base_search ON public.knowledge_base_articles USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_knowledge_base_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.article_title, '') || ' ' || 
    COALESCE(NEW.content_body, '') || ' ' || 
    COALESCE(NEW.summary, '') || ' ' ||
    COALESCE(array_to_string(NEW.keywords, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.knowledge_base_articles
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_base_search_vector();

-- Insert initial template categories
INSERT INTO public.template_categories (category_name, category_description, industry_focus, regulatory_frameworks) VALUES
('Banking Governance', 'Governance frameworks for banking institutions', ARRAY['banking'], ARRAY['OSFI', 'Basel III']),
('Insurance Risk Management', 'Risk management templates for insurance companies', ARRAY['insurance'], ARRAY['OSFI', 'IAIS']),
('Investment Management', 'Templates for investment and asset management', ARRAY['investment_management'], ARRAY['IIROC', 'CSA']),
('Operational Risk', 'Cross-industry operational risk frameworks', ARRAY['banking', 'insurance', 'investment_management'], ARRAY['Basel III', 'COSO']),
('Cybersecurity', 'Technology and cyber risk templates', ARRAY['all'], ARRAY['NIST', 'ISO 27001']),
('Compliance Management', 'Regulatory compliance frameworks', ARRAY['all'], ARRAY['various']);
