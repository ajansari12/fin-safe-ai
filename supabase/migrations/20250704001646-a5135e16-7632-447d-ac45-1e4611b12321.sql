-- Add some sample operational data for the organization
INSERT INTO incident_logs (org_id, incident_title, description, severity, category, status, reported_at, assigned_to_name, max_response_time_hours, max_resolution_time_hours)
VALUES 
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'System Performance Degradation', 'Risk calculation engine experiencing delays', 'medium', 'system', 'resolved', NOW() - INTERVAL '5 days', 'Risk Team', 4, 24),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Data Synchronization Failure', 'Third-party vendor data sync failed', 'high', 'data', 'in_progress', NOW() - INTERVAL '2 days', 'Operations Team', 2, 8),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Compliance Alert Triggered', 'KRI threshold breach detected', 'critical', 'compliance', 'open', NOW() - INTERVAL '6 hours', 'Compliance Officer', 1, 4);

INSERT INTO kri_definitions (org_id, kri_name, description, measurement_frequency, target_value, warning_threshold, critical_threshold, measurement_unit)
VALUES
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Operational Risk Score', 'Composite operational risk indicator', 'weekly', 75, 85, 95, 'score'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'System Downtime', 'Percentage of system availability', 'daily', 99.9, 99.5, 99.0, 'percentage'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Vendor Response Time', 'Average vendor SLA response time', 'monthly', 4, 6, 8, 'hours');

INSERT INTO third_party_profiles (org_id, vendor_name, contact_person, contact_email, service_category, criticality, risk_rating, status)
VALUES
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'DataFlow Systems', 'John Smith', 'john@dataflow.com', 'data_processing', 'high', 'medium', 'active'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'SecureCloud Inc', 'Sarah Johnson', 'sarah@securecloud.com', 'cloud_services', 'critical', 'low', 'active'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'RiskAnalytics Pro', 'Mike Davis', 'mike@riskanalytics.com', 'analytics', 'medium', 'medium', 'active');

INSERT INTO controls (org_id, control_name, description, control_type, frequency, owner_name, effectiveness_score, risk_reduction_score, status)
VALUES
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Access Control Review', 'Monthly review of user access permissions', 'preventive', 'monthly', 'Security Team', 85, 80, 'active'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Data Backup Validation', 'Weekly validation of backup integrity', 'detective', 'weekly', 'IT Operations', 92, 85, 'active'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Vendor Risk Assessment', 'Quarterly vendor risk evaluation', 'preventive', 'quarterly', 'Risk Management', 78, 75, 'active');