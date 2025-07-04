-- Create enhanced function to send SLA breach notifications
CREATE OR REPLACE FUNCTION send_sla_breach_notification()
RETURNS TRIGGER AS $$
DECLARE
  org_users RECORD;
  notification_data JSONB;
BEGIN
  -- Only send notifications for SLA breaches and critical incidents
  IF NEW.escalation_level > OLD.escalation_level OR 
     (NEW.severity IN ('critical', 'high') AND OLD.first_response_at IS NULL AND NEW.first_response_at IS NULL) THEN
    
    -- Prepare notification data
    notification_data := jsonb_build_object(
      'incident_title', NEW.title,
      'incident_id', NEW.id,
      'severity', NEW.severity,
      'breach_type', CASE 
        WHEN NEW.escalation_level > OLD.escalation_level THEN 'escalation'
        ELSE 'response_time'
      END,
      'time_elapsed', EXTRACT(EPOCH FROM (now() - NEW.reported_at)) / 3600 || ' hours',
      'sla_limit', CASE NEW.severity
        WHEN 'critical' THEN '1 hour'
        WHEN 'high' THEN '4 hours'
        WHEN 'medium' THEN '24 hours'
        ELSE '72 hours'
      END,
      'escalation_level', NEW.escalation_level,
      'action_required', 'Immediate attention required for this ' || NEW.severity || ' severity incident',
      'incident_url', 'https://your-domain.com/incidents/' || NEW.id
    );

    -- Get organization admin users
    FOR org_users IN
      SELECT p.id, p.full_name, u.email
      FROM profiles p
      JOIN auth.users u ON u.id = p.id
      WHERE p.organization_id = NEW.org_id 
      AND p.role IN ('admin', 'manager')
      AND u.email IS NOT NULL
    LOOP
      -- Call the edge function to send email
      PERFORM net.http_post(
        url := 'https://ooocjyscnvbahsyryzhp.supabase.co/functions/v1/send-notification-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}',
        body := jsonb_build_object(
          'type', 'sla_breach',
          'recipient_email', org_users.email,
          'recipient_name', org_users.full_name,
          'data', notification_data,
          'org_id', NEW.org_id
        )::text
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for SLA breach notifications
DROP TRIGGER IF EXISTS trigger_sla_breach_notification ON incident_logs;
CREATE TRIGGER trigger_sla_breach_notification
  AFTER UPDATE ON incident_logs
  FOR EACH ROW
  EXECUTE FUNCTION send_sla_breach_notification();

-- Create function to send policy review notifications
CREATE OR REPLACE FUNCTION send_policy_review_notification()
RETURNS TRIGGER AS $$
DECLARE
  org_users RECORD;
  notification_data JSONB;
  framework_name TEXT;
BEGIN
  -- Only send notifications when next_review_date is approaching (within 7 days)
  IF NEW.next_review_date <= CURRENT_DATE + INTERVAL '7 days' AND
     (OLD.reminder_sent IS FALSE OR OLD.reminder_sent IS NULL) THEN
    
    -- Get framework name
    SELECT gf.framework_name INTO framework_name
    FROM governance_policies gp
    JOIN governance_frameworks gf ON gf.id = gp.framework_id
    WHERE gp.id = NEW.policy_id;
    
    -- Prepare notification data
    notification_data := jsonb_build_object(
      'policy_name', (SELECT policy_name FROM governance_policies WHERE id = NEW.policy_id),
      'framework_name', COALESCE(framework_name, 'N/A'),
      'version', (SELECT version FROM governance_policies WHERE id = NEW.policy_id),
      'last_review_date', NEW.last_review_date,
      'review_due_date', NEW.next_review_date,
      'priority', CASE 
        WHEN NEW.next_review_date <= CURRENT_DATE THEN 'High'
        WHEN NEW.next_review_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'Medium'
        ELSE 'Low'
      END,
      'policy_url', 'https://your-domain.com/governance/policies/' || NEW.policy_id
    );

    -- Get organization users with policy management roles
    FOR org_users IN
      SELECT p.id, p.full_name, u.email
      FROM profiles p
      JOIN auth.users u ON u.id = p.id
      JOIN governance_policies gp ON gp.framework_id IN (
        SELECT id FROM governance_frameworks WHERE org_id = p.organization_id
      )
      WHERE gp.id = NEW.policy_id
      AND p.role IN ('admin', 'manager', 'analyst')
      AND u.email IS NOT NULL
    LOOP
      -- Call the edge function to send email
      PERFORM net.http_post(
        url := 'https://ooocjyscnvbahsyryzhp.supabase.co/functions/v1/send-notification-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}',
        body := jsonb_build_object(
          'type', 'policy_review',
          'recipient_email', org_users.email,
          'recipient_name', org_users.full_name,
          'data', notification_data,
          'org_id', (SELECT org_id FROM governance_frameworks gf 
                     JOIN governance_policies gp ON gp.framework_id = gf.id 
                     WHERE gp.id = NEW.policy_id)
        )::text
      );
    END LOOP;

    -- Mark reminder as sent
    UPDATE governance_review_schedule 
    SET reminder_sent = true 
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for policy review notifications
DROP TRIGGER IF EXISTS trigger_policy_review_notification ON governance_review_schedule;
CREATE TRIGGER trigger_policy_review_notification
  AFTER UPDATE ON governance_review_schedule
  FOR EACH ROW
  EXECUTE FUNCTION send_policy_review_notification();

-- Create function to generate and send weekly executive summaries
CREATE OR REPLACE FUNCTION send_weekly_executive_summary()
RETURNS void AS $$
DECLARE
  org_record RECORD;
  exec_users RECORD;
  notification_data JSONB;
  week_start DATE;
  week_end DATE;
  incidents_count INTEGER;
  new_incidents_count INTEGER;
  kri_breaches_count INTEGER;
  control_tests_count INTEGER;
  vendor_reviews_count INTEGER;
  avg_response_time TEXT;
  control_effectiveness NUMERIC;
BEGIN
  week_start := CURRENT_DATE - INTERVAL '7 days';
  week_end := CURRENT_DATE;

  -- Loop through each organization
  FOR org_record IN
    SELECT id, name FROM organizations
  LOOP
    -- Calculate metrics for this organization
    SELECT COUNT(*) INTO incidents_count
    FROM incident_logs 
    WHERE org_id = org_record.id;
    
    SELECT COUNT(*) INTO new_incidents_count
    FROM incident_logs 
    WHERE org_id = org_record.id 
    AND created_at >= week_start;
    
    SELECT COUNT(*) INTO kri_breaches_count
    FROM appetite_breach_logs 
    WHERE org_id = org_record.id 
    AND created_at >= week_start;
    
    SELECT COUNT(*) INTO control_tests_count
    FROM control_tests 
    WHERE org_id = org_record.id 
    AND test_date >= week_start;
    
    SELECT COUNT(*) INTO vendor_reviews_count
    FROM third_party_reviews 
    WHERE next_review_date <= CURRENT_DATE + INTERVAL '30 days';
    
    -- Calculate average response time
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (first_response_at - reported_at)) / 3600), 0) || ' hours'
    INTO avg_response_time
    FROM incident_logs 
    WHERE org_id = org_record.id 
    AND first_response_at IS NOT NULL 
    AND created_at >= week_start;
    
    -- Calculate control effectiveness
    SELECT COALESCE(AVG(effectiveness_rating), 0)
    INTO control_effectiveness
    FROM control_tests ct
    JOIN controls c ON c.id = ct.control_id
    WHERE c.org_id = org_record.id 
    AND ct.test_date >= week_start;

    -- Prepare notification data
    notification_data := jsonb_build_object(
      'week_of', week_start::text,
      'total_incidents', incidents_count,
      'new_incidents', new_incidents_count,
      'kri_breaches', kri_breaches_count,
      'control_tests', control_tests_count,
      'vendor_reviews', vendor_reviews_count,
      'avg_response_time', COALESCE(avg_response_time, 'N/A'),
      'control_effectiveness', ROUND(control_effectiveness, 1),
      'policy_compliance', 95, -- Placeholder - calculate from actual data
      'risk_variance', 12, -- Placeholder - calculate from actual KRI data
      'recommendations', jsonb_build_array(
        'Review high-priority vendor relationships',
        'Complete outstanding control tests',
        'Address any KRI threshold breaches'
      ),
      'dashboard_url', 'https://your-domain.com/dashboard'
    );

    -- Send to executive users in this organization
    FOR exec_users IN
      SELECT p.id, p.full_name, u.email
      FROM profiles p
      JOIN auth.users u ON u.id = p.id
      WHERE p.organization_id = org_record.id 
      AND p.role IN ('admin', 'executive')
      AND u.email IS NOT NULL
    LOOP
      -- Call the edge function to send email
      PERFORM net.http_post(
        url := 'https://ooocjyscnvbahsyryzhp.supabase.co/functions/v1/send-notification-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}',
        body := jsonb_build_object(
          'type', 'executive_summary',
          'recipient_email', exec_users.email,
          'recipient_name', exec_users.full_name,
          'data', notification_data,
          'org_id', org_record.id
        )::text
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their org's notifications" 
ON notifications FOR SELECT 
USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their org's notifications" 
ON notifications FOR UPDATE 
USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (true);