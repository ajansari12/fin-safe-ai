-- Fix user role assignments for existing users
-- This addresses the core issue where users don't have roles assigned

DO $$
DECLARE
    org_id UUID;
    user_record RECORD;
BEGIN
    -- Get the RBAC Test Organization ID
    SELECT id INTO org_id 
    FROM public.organizations 
    WHERE name = 'RBAC Test Organization' 
    LIMIT 1;
    
    -- If the test organization exists, ensure test users have proper roles
    IF org_id IS NOT NULL THEN
        -- Ensure admin role exists for existing users
        FOR user_record IN 
            SELECT p.id, p.full_name, p.role as profile_role
            FROM public.profiles p
            WHERE p.organization_id = org_id
        LOOP
            -- Insert user role if it doesn't exist
            INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
            VALUES (user_record.id, org_id, COALESCE(user_record.profile_role, 'admin'), COALESCE(user_record.profile_role::app_role, 'admin'::app_role))
            ON CONFLICT (user_id, organization_id) DO UPDATE SET
                role = COALESCE(user_record.profile_role, 'admin'),
                role_type = COALESCE(user_record.profile_role::app_role, 'admin'::app_role);
        END LOOP;
    END IF;
    
    -- For all other organizations, ensure users have default roles
    FOR user_record IN 
        SELECT p.id, p.organization_id, p.role as profile_role
        FROM public.profiles p
        WHERE p.organization_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = p.id AND ur.organization_id = p.organization_id
        )
    LOOP
        -- Give default admin role to users without explicit roles
        INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
        VALUES (
            user_record.id, 
            user_record.organization_id, 
            COALESCE(user_record.profile_role, 'admin'),
            COALESCE(user_record.profile_role::app_role, 'admin'::app_role)
        );
    END LOOP;
END $$;