
-- Create MFA settings table
CREATE TABLE public.user_mfa_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL,
  mfa_enabled boolean NOT NULL DEFAULT false,
  totp_enabled boolean NOT NULL DEFAULT false,
  sms_enabled boolean NOT NULL DEFAULT false,
  email_enabled boolean NOT NULL DEFAULT false,
  totp_secret text,
  phone_number text,
  backup_codes_generated_at timestamp with time zone,
  last_mfa_verification timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create MFA backup codes table
CREATE TABLE public.mfa_backup_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create MFA verification attempts table
CREATE TABLE public.mfa_verification_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_type text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create enhanced user sessions table
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  device_fingerprint text,
  ip_address inet,
  user_agent text,
  location_data jsonb,
  is_active boolean NOT NULL DEFAULT true,
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create password history table
CREATE TABLE public.password_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create comprehensive security logs table
CREATE TABLE public.security_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  session_id uuid,
  event_type text NOT NULL,
  event_category text NOT NULL,
  resource_type text,
  resource_id text,
  action_performed text NOT NULL,
  event_details jsonb DEFAULT '{}',
  risk_score integer DEFAULT 0,
  ip_address inet,
  user_agent text,
  location_data jsonb,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  correlation_id uuid
);

-- Create data encryption keys table
CREATE TABLE public.encryption_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  key_name text NOT NULL,
  key_version integer NOT NULL DEFAULT 1,
  encrypted_key text NOT NULL,
  key_purpose text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  rotated_at timestamp with time zone,
  UNIQUE(org_id, key_name, key_version)
);

-- Create encrypted data fields table
CREATE TABLE public.encrypted_data_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  table_name text NOT NULL,
  field_name text NOT NULL,
  record_id uuid NOT NULL,
  encrypted_value text NOT NULL,
  encryption_key_id uuid NOT NULL REFERENCES encryption_keys(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(org_id, table_name, field_name, record_id)
);

-- Create session policies table
CREATE TABLE public.session_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  policy_name text NOT NULL,
  idle_timeout_minutes integer NOT NULL DEFAULT 30,
  absolute_timeout_minutes integer NOT NULL DEFAULT 480,
  max_concurrent_sessions integer NOT NULL DEFAULT 3,
  require_mfa_for_sensitive_actions boolean NOT NULL DEFAULT true,
  ip_restriction_enabled boolean NOT NULL DEFAULT false,
  allowed_ip_ranges jsonb DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create password policies table
CREATE TABLE public.password_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  policy_name text NOT NULL,
  min_length integer NOT NULL DEFAULT 12,
  require_uppercase boolean NOT NULL DEFAULT true,
  require_lowercase boolean NOT NULL DEFAULT true,
  require_numbers boolean NOT NULL DEFAULT true,
  require_symbols boolean NOT NULL DEFAULT true,
  prevent_password_reuse integer NOT NULL DEFAULT 12,
  password_expiry_days integer NOT NULL DEFAULT 90,
  warning_days_before_expiry integer NOT NULL DEFAULT 7,
  max_failed_attempts integer NOT NULL DEFAULT 5,
  lockout_duration_minutes integer NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_user_mfa_settings_user_id ON public.user_mfa_settings(user_id);
CREATE INDEX idx_mfa_backup_codes_user_id ON public.mfa_backup_codes(user_id);
CREATE INDEX idx_mfa_verification_attempts_user_id ON public.mfa_verification_attempts(user_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(user_id, is_active);
CREATE INDEX idx_password_history_user_id ON public.password_history(user_id);
CREATE INDEX idx_security_audit_logs_org_id ON public.security_audit_logs(org_id);
CREATE INDEX idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_timestamp ON public.security_audit_logs(timestamp);
CREATE INDEX idx_encryption_keys_org_id ON public.encryption_keys(org_id);
CREATE INDEX idx_encrypted_data_fields_record ON public.encrypted_data_fields(org_id, table_name, record_id);

-- Enable RLS on all tables
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_data_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific data
CREATE POLICY "Users can manage their own MFA settings" ON public.user_mfa_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own backup codes" ON public.mfa_backup_codes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own verification attempts" ON public.mfa_verification_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own password history" ON public.password_history
  FOR SELECT USING (auth.uid() = user_id);

-- Create org-scoped policies
CREATE POLICY "Org members can view security logs" ON public.security_audit_logs
  FOR SELECT USING (check_user_org_access(org_id));

CREATE POLICY "Org admins can manage encryption keys" ON public.encryption_keys
  FOR ALL USING (check_user_org_access(org_id) AND is_admin_user());

CREATE POLICY "Org members can view encrypted data" ON public.encrypted_data_fields
  FOR SELECT USING (check_user_org_access(org_id));

CREATE POLICY "Org admins can manage session policies" ON public.session_policies
  FOR ALL USING (check_user_org_access(org_id) AND is_admin_user());

CREATE POLICY "Org admins can manage password policies" ON public.password_policies
  FOR ALL USING (check_user_org_access(org_id) AND is_admin_user());

-- Create functions for session management
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$;

-- Create function for password strength validation
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text, org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_record RECORD;
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Get active password policy for org
  SELECT * INTO policy_record
  FROM public.password_policies
  WHERE password_policies.org_id = validate_password_strength.org_id
  AND is_active = true
  LIMIT 1;

  IF policy_record IS NULL THEN
    RETURN result;
  END IF;

  -- Check minimum length
  IF length(password) < policy_record.min_length THEN
    errors := array_append(errors, 'Password must be at least ' || policy_record.min_length || ' characters long');
  END IF;

  -- Check uppercase requirement
  IF policy_record.require_uppercase AND password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;

  -- Check lowercase requirement
  IF policy_record.require_lowercase AND password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;

  -- Check numbers requirement
  IF policy_record.require_numbers AND password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;

  -- Check symbols requirement
  IF policy_record.require_symbols AND password !~ '[^A-Za-z0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;

  -- Build result
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object('valid', false, 'errors', to_jsonb(errors));
  END IF;

  RETURN result;
END;
$$;

-- Create function for session timeout checking
CREATE OR REPLACE FUNCTION public.check_session_timeout(session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  policy_record RECORD;
  idle_timeout_exceeded boolean := false;
  absolute_timeout_exceeded boolean := false;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.user_sessions
  WHERE user_sessions.session_token = check_session_timeout.session_token
  AND is_active = true;

  IF session_record IS NULL THEN
    RETURN false;
  END IF;

  -- Get session policy
  SELECT * INTO policy_record
  FROM public.session_policies
  WHERE org_id = session_record.org_id
  AND is_active = true
  LIMIT 1;

  IF policy_record IS NULL THEN
    RETURN true; -- No policy, session is valid
  END IF;

  -- Check idle timeout
  IF session_record.last_activity_at < (now() - interval '1 minute' * policy_record.idle_timeout_minutes) THEN
    idle_timeout_exceeded := true;
  END IF;

  -- Check absolute timeout
  IF session_record.created_at < (now() - interval '1 minute' * policy_record.absolute_timeout_minutes) THEN
    absolute_timeout_exceeded := true;
  END IF;

  -- Deactivate session if timeout exceeded
  IF idle_timeout_exceeded OR absolute_timeout_exceeded THEN
    UPDATE public.user_sessions
    SET is_active = false
    WHERE id = session_record.id;
    RETURN false;
  END IF;

  RETURN true;
END;
$$;
