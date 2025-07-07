-- Create Edge Function for updating user roles
CREATE OR REPLACE FUNCTION public.update_user_role_safe(
    p_user_id UUID,
    p_new_role TEXT,
    p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_user_id UUID;
    v_current_user_org UUID;
    v_is_admin BOOLEAN := FALSE;
    v_result JSONB;
BEGIN
    -- Get current user info
    v_current_user_id := auth.uid();
    
    -- Check if current user exists and get their org
    SELECT organization_id INTO v_current_user_org
    FROM public.profiles
    WHERE id = v_current_user_id;
    
    -- Verify current user is admin in the same organization
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = v_current_user_id
        AND ur.organization_id = p_organization_id
        AND ur.role_type = 'admin'
    ) INTO v_is_admin;
    
    -- Security checks
    IF v_current_user_org IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    IF v_current_user_org != p_organization_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Organization access denied');
    END IF;
    
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object('success', false, 'error', 'Admin privileges required');
    END IF;
    
    -- Validate role
    IF p_new_role NOT IN ('admin', 'analyst', 'reviewer') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid role specified');
    END IF;
    
    -- Update or insert user role
    INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
    VALUES (p_user_id, p_organization_id, p_new_role, p_new_role::app_role)
    ON CONFLICT (user_id, organization_id) 
    DO UPDATE SET 
        role = p_new_role,
        role_type = p_new_role::app_role,
        created_at = COALESCE(user_roles.created_at, now());
    
    -- Log the action
    INSERT INTO public.admin_logs (
        org_id,
        admin_user_id,
        admin_user_name,
        action_type,
        resource_type,
        resource_id,
        resource_name,
        action_details
    )
    SELECT 
        p_organization_id,
        v_current_user_id,
        COALESCE(p.full_name, 'Unknown Admin'),
        'UPDATE_USER_ROLE',
        'user_role',
        p_user_id::TEXT,
        COALESCE(target_p.full_name, 'Unknown User'),
        jsonb_build_object(
            'new_role', p_new_role,
            'target_user_id', p_user_id,
            'timestamp', now()
        )
    FROM public.profiles p
    LEFT JOIN public.profiles target_p ON target_p.id = p_user_id
    WHERE p.id = v_current_user_id;
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Role updated successfully',
        'user_id', p_user_id,
        'new_role', p_new_role
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Database error: ' || SQLERRM
        );
END;
$$;