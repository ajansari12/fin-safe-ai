-- Create encryption keys table
CREATE TABLE public.encryption_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  key_name TEXT NOT NULL,
  key_version INTEGER NOT NULL DEFAULT 1,
  key_purpose TEXT NOT NULL,
  key_data TEXT NOT NULL, -- Encrypted key data
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(org_id, key_name, key_version)
);

-- Create encrypted data fields table
CREATE TABLE public.encrypted_data_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  encryption_key_id UUID NOT NULL REFERENCES public.encryption_keys(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, table_name, field_name, record_id)
);

-- Create rate limits table
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- user_id, ip_address, or api_key
  identifier_type TEXT NOT NULL, -- 'user', 'ip', 'api_key'
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  window_size_minutes INTEGER NOT NULL DEFAULT 60,
  max_requests INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Create CSRF tokens table
CREATE TABLE public.csrf_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id UUID,
  session_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MFA backup codes table (enhanced)
CREATE TABLE public.mfa_backup_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- Create data retention policies table
CREATE TABLE public.data_retention_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_cleanup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, table_name)
);

-- Enable RLS on all new tables
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_data_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csrf_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for encryption_keys
CREATE POLICY "Users can view encryption keys for their org" 
ON public.encryption_keys FOR SELECT 
USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage encryption keys for their org" 
ON public.encryption_keys FOR ALL 
USING (is_admin_secure() AND org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for encrypted_data_fields
CREATE POLICY "Users can view encrypted data for their org" 
ON public.encrypted_data_fields FOR SELECT 
USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage encrypted data for their org" 
ON public.encrypted_data_fields FOR ALL 
USING (org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for rate_limits
CREATE POLICY "System can manage rate limits" 
ON public.rate_limits FOR ALL 
USING (true);

-- RLS Policies for csrf_tokens
CREATE POLICY "Users can access their own CSRF tokens" 
ON public.csrf_tokens FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for mfa_backup_codes
CREATE POLICY "Users can access their own MFA backup codes" 
ON public.mfa_backup_codes FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for data_retention_policies
CREATE POLICY "Admins can manage retention policies for their org" 
ON public.data_retention_policies FOR ALL 
USING (is_admin_secure() AND org_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Create function to cleanup expired data
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  policy_record RECORD;
  sql_query TEXT;
BEGIN
  -- Cleanup based on retention policies
  FOR policy_record IN 
    SELECT table_name, retention_days, org_id, id
    FROM public.data_retention_policies 
    WHERE is_active = true
  LOOP
    -- Build dynamic SQL for cleanup
    sql_query := format(
      'DELETE FROM public.%I WHERE org_id = %L AND created_at < now() - interval ''%s days''',
      policy_record.table_name,
      policy_record.org_id,
      policy_record.retention_days
    );
    
    -- Execute cleanup
    EXECUTE sql_query;
    
    -- Update last cleanup time
    UPDATE public.data_retention_policies 
    SET last_cleanup_at = now() 
    WHERE id = policy_record.id;
  END LOOP;
  
  -- Cleanup expired CSRF tokens
  DELETE FROM public.csrf_tokens WHERE expires_at < now();
  
  -- Cleanup expired MFA backup codes
  DELETE FROM public.mfa_backup_codes WHERE expires_at < now();
  
  -- Cleanup old rate limit records (older than 24 hours)
  DELETE FROM public.rate_limits WHERE created_at < now() - INTERVAL '24 hours';
END;
$function$;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_encryption_keys_updated_at
  BEFORE UPDATE ON public.encryption_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_encrypted_data_fields_updated_at
  BEFORE UPDATE ON public.encrypted_data_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_retention_policies_updated_at
  BEFORE UPDATE ON public.data_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();