-- Debug by adding a constraint to ensure user_id is never null during insert
-- First let's check what policies we have and ensure they work correctly

-- Check if there are any triggers or other constraints that might be interfering
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'onboarding_sessions' 
  AND tc.table_schema = 'public';

-- Also check if RLS is actually enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'onboarding_sessions' AND schemaname = 'public';