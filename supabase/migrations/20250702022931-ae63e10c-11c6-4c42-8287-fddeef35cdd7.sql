-- Enable realtime for critical tables
ALTER TABLE public.incident_logs REPLICA IDENTITY FULL;
ALTER TABLE public.kri_logs REPLICA IDENTITY FULL;
ALTER TABLE public.appetite_breach_logs REPLICA IDENTITY FULL;
ALTER TABLE public.controls REPLICA IDENTITY FULL;
ALTER TABLE public.third_party_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.dependencies REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kri_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appetite_breach_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.controls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.third_party_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dependencies;