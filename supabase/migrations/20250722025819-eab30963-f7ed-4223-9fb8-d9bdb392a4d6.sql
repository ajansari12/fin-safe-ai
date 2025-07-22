
-- Create AI insights table for storing generated analytics
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('predictive_alert', 'anomaly', 'correlation', 'recommendation', 'trend')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  data_points JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  methodology TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictive models table
CREATE TABLE public.predictive_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('time_series', 'classification', 'regression', 'clustering', 'neural_network')),
  purpose TEXT NOT NULL,
  input_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  training_data_source TEXT NOT NULL,
  accuracy_score NUMERIC CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  confidence_interval NUMERIC CHECK (confidence_interval >= 0 AND confidence_interval <= 1),
  last_trained_at TIMESTAMP WITH TIME ZONE,
  next_training_at TIMESTAMP WITH TIME ZONE,
  model_parameters JSONB DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'training', 'testing', 'inactive', 'deprecated')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anomaly detection table
CREATE TABLE public.anomaly_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  detection_name TEXT NOT NULL,
  data_source TEXT NOT NULL,
  detection_method TEXT NOT NULL CHECK (detection_method IN ('statistical', 'pattern', 'behavioral', 'temporal', 'ml_based')),
  threshold_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sensitivity TEXT NOT NULL DEFAULT 'medium' CHECK (sensitivity IN ('low', 'medium', 'high')),
  detected_anomalies JSONB DEFAULT '[]'::jsonb,
  false_positive_rate NUMERIC DEFAULT 0,
  last_execution_at TIMESTAMP WITH TIME ZONE,
  next_execution_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for ai_insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's AI insights" 
  ON public.ai_insights 
  FOR SELECT 
  USING (org_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create AI insights for their org" 
  ON public.ai_insights 
  FOR INSERT 
  WITH CHECK (org_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their org's AI insights" 
  ON public.ai_insights 
  FOR UPDATE 
  USING (org_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ));

-- Add RLS policies for predictive_models
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org's predictive models" 
  ON public.predictive_models 
  FOR ALL 
  USING (org_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ));

-- Add RLS policies for anomaly_detections
ALTER TABLE public.anomaly_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org's anomaly detection" 
  ON public.anomaly_detections 
  FOR ALL 
  USING (org_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ));

-- Add indexes for performance
CREATE INDEX idx_ai_insights_org_type ON public.ai_insights(org_id, insight_type);
CREATE INDEX idx_ai_insights_generated_at ON public.ai_insights(generated_at DESC);
CREATE INDEX idx_predictive_models_org_status ON public.predictive_models(org_id, status);
CREATE INDEX idx_anomaly_detections_org_active ON public.anomaly_detections(org_id, is_active);

-- Add triggers for updated_at
CREATE TRIGGER update_ai_insights_updated_at 
  BEFORE UPDATE ON public.ai_insights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictive_models_updated_at 
  BEFORE UPDATE ON public.predictive_models 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anomaly_detections_updated_at 
  BEFORE UPDATE ON public.anomaly_detections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
