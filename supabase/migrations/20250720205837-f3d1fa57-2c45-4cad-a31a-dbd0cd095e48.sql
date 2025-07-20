
-- Create integrations table
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('core_banking', 'trading', 'hr', 'vendor_mgmt', 'regulatory', 'third_party')),
  provider TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage integrations for their org" 
  ON public.integrations 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Create api_keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  key_name TEXT NOT NULL,
  key_type TEXT NOT NULL,
  key_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage API keys for their org" 
  ON public.api_keys 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Create integration_logs table
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  integration_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  error_message TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for integration_logs
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view integration logs for their org" 
  ON public.integration_logs 
  FOR SELECT 
  USING (check_user_org_access(org_id));

CREATE POLICY "System can insert integration logs" 
  ON public.integration_logs 
  FOR INSERT 
  WITH CHECK (check_user_org_access(org_id));

-- Add foreign key relationships
ALTER TABLE public.integration_logs 
ADD CONSTRAINT fk_integration_logs_integration 
FOREIGN KEY (integration_id) REFERENCES public.integrations(id) ON DELETE CASCADE;

-- Add triggers for updated_at
CREATE TRIGGER update_integrations_timestamp
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_timestamp();

-- Add indexes for performance
CREATE INDEX idx_integrations_org_id ON public.integrations(org_id);
CREATE INDEX idx_integrations_type ON public.integrations(integration_type);
CREATE INDEX idx_api_keys_org_id ON public.api_keys(org_id);
CREATE INDEX idx_integration_logs_org_id ON public.integration_logs(org_id);
CREATE INDEX idx_integration_logs_integration_id ON public.integration_logs(integration_id);
CREATE INDEX idx_integration_logs_created_at ON public.integration_logs(created_at);
