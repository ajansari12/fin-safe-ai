-- Seed performance_metrics table with realistic data (fixed constraints)
INSERT INTO performance_metrics (org_id, service_name, region, metric_timestamp, response_time_ms, throughput_rps, error_rate, cpu_usage, memory_usage, disk_usage, network_latency_ms, database_connections, queue_depth, cache_hit_rate, user_experience_metrics, system_metrics, custom_metrics) VALUES
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'risk-engine', 'us-east-1', NOW() - INTERVAL '5 minutes', 145.5, 28.3, 0.02, 34.7, 67.2, 23.8, 12.4, 15, 3, 0.892, '{"page_load_time": 1.8, "user_satisfaction": 4.2}', '{"uptime": 99.8, "availability": 99.9}', '{"risk_calculations_per_hour": 1847}'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'analytics-service', 'us-east-1', NOW() - INTERVAL '10 minutes', 203.2, 15.7, 0.01, 42.1, 71.5, 31.2, 8.9, 12, 1, 0.924, '{"dashboard_render_time": 2.1, "query_response_time": 0.8}', '{"cpu_efficiency": 94.2, "memory_optimization": 87.3}', '{"insights_generated_per_day": 156}'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'incident-manager', 'us-east-1', NOW() - INTERVAL '15 minutes', 98.7, 42.1, 0.003, 28.9, 54.3, 19.6, 15.2, 8, 0, 0.948, '{"incident_response_time": 3.2, "resolution_efficiency": 4.6}', '{"sla_compliance": 97.8, "automation_rate": 73.4}', '{"incidents_processed_per_hour": 23}'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'governance-engine', 'us-east-1', NOW() - INTERVAL '20 minutes', 189.4, 11.2, 0.008, 38.7, 63.9, 27.4, 11.8, 10, 2, 0.886, '{"policy_compliance_check": 1.4, "audit_trail_generation": 2.7}', '{"data_integrity": 99.2, "backup_success_rate": 100}', '{"policies_evaluated_per_day": 892}'),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'third-party-monitor', 'us-east-1', NOW() - INTERVAL '25 minutes', 167.8, 19.6, 0.015, 31.4, 59.7, 22.1, 14.6, 7, 1, 0.913, '{"vendor_assessment_time": 4.8, "risk_score_accuracy": 4.1}', '{"monitoring_coverage": 96.7, "alert_precision": 89.4}', '{"vendors_monitored": 147, "risk_assessments_per_week": 34}');

-- Create forecasting_inputs table and seed it
CREATE TABLE IF NOT EXISTS forecasting_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  time_period TEXT NOT NULL,
  model_type TEXT NOT NULL DEFAULT 'time_series',
  accuracy_score NUMERIC,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on forecasting_inputs
ALTER TABLE forecasting_inputs ENABLE ROW LEVEL SECURITY;

-- Create policy for forecasting_inputs
CREATE POLICY "Users can manage their org's forecasting inputs"
  ON forecasting_inputs
  FOR ALL
  USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Seed forecasting_inputs table
INSERT INTO forecasting_inputs (org_id, metric_name, input_data, time_period, model_type, accuracy_score) VALUES
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'incident_volume', '{"historical_data": [8, 12, 15, 9, 14, 11], "seasonal_factors": [1.0, 1.2, 0.9, 1.1, 1.0, 0.8], "trend_coefficient": 0.05, "external_factors": ["market_volatility", "regulatory_changes"]}', 'monthly', 'arima_seasonal', 0.84),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'kri_breaches', '{"threshold_data": [2, 5, 1, 3, 4, 2], "control_effectiveness": [0.85, 0.78, 0.92, 0.81, 0.76, 0.89], "risk_appetite_buffer": 0.15}', 'weekly', 'monte_carlo', 0.79),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'vendor_risk_score', '{"vendor_scores": [3.2, 3.8, 2.9, 4.1, 3.5, 3.1], "market_conditions": [0.7, 0.8, 0.6, 0.9, 0.75, 0.65], "assessment_frequency": "quarterly"}', 'quarterly', 'regression_ensemble', 0.87),
('ce1b0f79-5c5a-4e2d-8d15-18dbbb61d845', 'control_effectiveness', '{"test_results": [92, 87, 95, 89, 91, 88], "remediation_impact": [0.8, 0.6, 0.9, 0.7, 0.85, 0.75], "maturity_trend": "improving"}', 'monthly', 'bayesian_network', 0.82);