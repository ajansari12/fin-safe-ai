-- Create error_logs table for comprehensive error tracking
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  route TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'critical')),
  module_name TEXT,
  component_name TEXT,
  error_boundary_id TEXT,
  session_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for error_logs
CREATE POLICY "Users can view their org's error logs"
  ON public.error_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = error_logs.org_id
    )
  );

CREATE POLICY "Users can insert error logs for their org"
  ON public.error_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = error_logs.org_id
    )
  );

-- Create index for performance
CREATE INDEX idx_error_logs_org_timestamp ON public.error_logs (org_id, timestamp DESC);
CREATE INDEX idx_error_logs_route ON public.error_logs (route);
CREATE INDEX idx_error_logs_user_timestamp ON public.error_logs (user_id, timestamp DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_error_logs_updated_at
  BEFORE UPDATE ON public.error_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();