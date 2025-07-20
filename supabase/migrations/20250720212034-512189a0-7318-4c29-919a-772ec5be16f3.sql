
-- Create notification channels table
CREATE TABLE public.notification_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('email', 'sms', 'push', 'in_app', 'webhook', 'slack', 'teams')),
  description TEXT,
  configuration JSONB NOT NULL DEFAULT '{}',
  delivery_settings JSONB NOT NULL DEFAULT '{}',
  rate_limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
  last_used_at TIMESTAMP WITH TIME ZONE,
  success_rate NUMERIC DEFAULT 100.0,
  error_count INTEGER DEFAULT 0,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification rules table
CREATE TABLE public.notification_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  channels JSONB NOT NULL DEFAULT '[]', -- array of channel IDs
  recipients JSONB NOT NULL DEFAULT '[]',
  template_id UUID,
  escalation_policy_id UUID,
  frequency_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 50,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  formatting_options JSONB NOT NULL DEFAULT '{}',
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create escalation policies table
CREATE TABLE public.escalation_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  policy_name TEXT NOT NULL,
  description TEXT,
  escalation_levels JSONB NOT NULL DEFAULT '[]',
  conditions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  applicable_alert_types JSONB NOT NULL DEFAULT '[]',
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  assigned_to JSONB NOT NULL DEFAULT '[]',
  escalation_level INTEGER DEFAULT 0,
  escalated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolved_by_name TEXT,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification delivery logs table
CREATE TABLE public.notification_delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  alert_id UUID REFERENCES public.alerts(id),
  rule_id UUID REFERENCES public.notification_rules(id),
  channel_id UUID REFERENCES public.notification_channels(id),
  channel_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  template_used TEXT,
  message_content TEXT,
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  delivery_attempt INTEGER DEFAULT 1,
  error_message TEXT,
  external_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user notification preferences table
CREATE TABLE public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  channel_preferences JSONB NOT NULL DEFAULT '{}',
  alert_type_preferences JSONB NOT NULL DEFAULT '{}',
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  frequency_settings JSONB NOT NULL DEFAULT '{}',
  escalation_preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Add RLS policies
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notification channels policies
CREATE POLICY "Users can manage notification channels for their org" 
  ON public.notification_channels 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Notification rules policies
CREATE POLICY "Users can manage notification rules for their org" 
  ON public.notification_rules 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Notification templates policies
CREATE POLICY "Users can view notification templates for their org" 
  ON public.notification_templates 
  FOR SELECT 
  USING (check_user_org_access(org_id) OR is_system_template = true);

CREATE POLICY "Users can manage notification templates for their org" 
  ON public.notification_templates 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Escalation policies policies
CREATE POLICY "Users can manage escalation policies for their org" 
  ON public.escalation_policies 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Alerts policies
CREATE POLICY "Users can manage alerts for their org" 
  ON public.alerts 
  FOR ALL 
  USING (check_user_org_access(org_id));

-- Notification delivery logs policies
CREATE POLICY "Users can view delivery logs for their org" 
  ON public.notification_delivery_logs 
  FOR SELECT 
  USING (check_user_org_access(org_id));

CREATE POLICY "System can insert delivery logs" 
  ON public.notification_delivery_logs 
  FOR INSERT 
  WITH CHECK (check_user_org_access(org_id));

-- User notification preferences policies
CREATE POLICY "Users can manage their own notification preferences" 
  ON public.user_notification_preferences 
  FOR ALL 
  USING (user_id = auth.uid() AND check_user_org_access(org_id));

-- Add indexes for performance
CREATE INDEX idx_notification_channels_org_id ON public.notification_channels(org_id);
CREATE INDEX idx_notification_channels_type ON public.notification_channels(channel_type);
CREATE INDEX idx_notification_rules_org_id ON public.notification_rules(org_id);
CREATE INDEX idx_notification_rules_event_type ON public.notification_rules(event_type);
CREATE INDEX idx_notification_templates_org_id ON public.notification_templates(org_id);
CREATE INDEX idx_escalation_policies_org_id ON public.escalation_policies(org_id);
CREATE INDEX idx_alerts_org_id ON public.alerts(org_id);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_triggered_at ON public.alerts(triggered_at);
CREATE INDEX idx_notification_delivery_logs_org_id ON public.notification_delivery_logs(org_id);
CREATE INDEX idx_notification_delivery_logs_alert_id ON public.notification_delivery_logs(alert_id);
CREATE INDEX idx_user_notification_preferences_user_id ON public.user_notification_preferences(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_notification_channels_timestamp
  BEFORE UPDATE ON public.notification_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_rules_timestamp
  BEFORE UPDATE ON public.notification_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_timestamp
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escalation_policies_timestamp
  BEFORE UPDATE ON public.escalation_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_timestamp
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_timestamp
  BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert system notification templates
INSERT INTO public.notification_templates (
  org_id, template_name, template_type, channel_type, subject_template, body_template, 
  variables, is_system_template
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  'Risk Appetite Breach Alert',
  'risk_breach',
  'email',
  '🚨 Risk Appetite Breach - {{severity}} Severity',
  '<h2>Risk Appetite Breach Alert</h2>
   <p><strong>Severity:</strong> {{severity}}</p>
   <p><strong>Description:</strong> {{description}}</p>
   <p><strong>Actual Value:</strong> {{actual_value}}</p>
   <p><strong>Threshold:</strong> {{threshold_value}}</p>
   <p><strong>Variance:</strong> {{variance_percentage}}%</p>
   <p><strong>Time:</strong> {{triggered_at}}</p>
   <p>Please review and take appropriate action.</p>',
  '["severity", "description", "actual_value", "threshold_value", "variance_percentage", "triggered_at"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Incident Alert',
  'incident',
  'email',
  '⚠️ Incident Alert - {{title}}',
  '<h2>Incident Alert</h2>
   <p><strong>Title:</strong> {{title}}</p>
   <p><strong>Severity:</strong> {{severity}}</p>
   <p><strong>Description:</strong> {{description}}</p>
   <p><strong>Reported At:</strong> {{reported_at}}</p>
   <p><strong>Category:</strong> {{category}}</p>
   <p>Please review the incident and take necessary action.</p>',
  '["title", "severity", "description", "reported_at", "category"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Control Failure Alert',
  'control_failure',
  'email',
  '🔴 Control Failure Alert - {{control_name}}',
  '<h2>Control Failure Alert</h2>
   <p><strong>Control:</strong> {{control_name}}</p>
   <p><strong>Test Result:</strong> {{test_result}}</p>
   <p><strong>Failure Reason:</strong> {{failure_reason}}</p>
   <p><strong>Test Date:</strong> {{test_date}}</p>
   <p>Immediate attention required for control remediation.</p>',
  '["control_name", "test_result", "failure_reason", "test_date"]'::jsonb,
  true
);
