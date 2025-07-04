-- Add some sample operational data with correct status values
INSERT INTO incident_logs (org_id, title, description, severity, category, status, reported_at, max_response_time_hours, max_resolution_time_hours)
VALUES 
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'System Performance Degradation', 'Risk calculation engine experiencing delays', 'medium', 'system', 'resolved', NOW() - INTERVAL '5 days', 4, 24),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Data Synchronization Failure', 'Third-party vendor data sync failed', 'high', 'data', 'investigating', NOW() - INTERVAL '2 days', 2, 8),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'Compliance Alert Triggered', 'KRI threshold breach detected', 'critical', 'compliance', 'open', NOW() - INTERVAL '6 hours', 1, 4);