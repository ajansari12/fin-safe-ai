-- Create a test user account in auth.users and corresponding profile
-- This simulates what happens when a user registers

-- First check if test user already exists
DO $$
DECLARE
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = test_user_id) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Insert test user into auth.users (this would normally be done by Supabase Auth)
        INSERT INTO auth.users (
            id,
            email,
            email_confirmed_at,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            'test@resilientfi.com',
            NOW(),
            '{"full_name": "Test User"}'::jsonb,
            NOW(),
            NOW()
        );
        
        -- The trigger will automatically create the profile
        RAISE NOTICE 'Test user created with ID: %', test_user_id;
    ELSE
        RAISE NOTICE 'Test user already exists';
    END IF;
END $$;