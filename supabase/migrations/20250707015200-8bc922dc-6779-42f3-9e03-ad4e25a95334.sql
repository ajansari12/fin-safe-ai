-- Create user_invitations table for organization member invites
CREATE TABLE public.user_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'analyst', 'reviewer')),
    invitation_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    invited_by UUID NOT NULL,
    invited_by_name TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(org_id, email, status) -- Prevent duplicate pending invites for same email
);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for user_invitations
CREATE POLICY "Admins can manage invitations for their org"
ON public.user_invitations
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.user_roles ur ON ur.user_id = p.id
        WHERE p.id = auth.uid() 
        AND p.organization_id = user_invitations.org_id 
        AND ur.role = 'admin'
    )
);

CREATE POLICY "Users can view invitations for their org"
ON public.user_invitations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND organization_id = user_invitations.org_id
    )
);

-- Function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(
    p_invitation_token TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation_record RECORD;
    v_result JSONB;
BEGIN
    -- Get invitation details
    SELECT * INTO v_invitation_record
    FROM public.user_invitations
    WHERE invitation_token = p_invitation_token
    AND status = 'pending'
    AND expires_at > now();
    
    IF v_invitation_record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;
    
    -- Update user profile with organization
    UPDATE public.profiles
    SET organization_id = v_invitation_record.org_id,
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Create user role
    INSERT INTO public.user_roles (user_id, organization_id, role, role_type)
    VALUES (p_user_id, v_invitation_record.org_id, v_invitation_record.role, v_invitation_record.role::app_role);
    
    -- Update invitation status
    UPDATE public.user_invitations
    SET status = 'accepted',
        accepted_at = now(),
        updated_at = now()
    WHERE id = v_invitation_record.id;
    
    -- Log the acceptance
    INSERT INTO public.admin_logs (
        org_id,
        admin_user_id,
        admin_user_name,
        action_type,
        resource_type,
        resource_id,
        resource_name,
        action_details
    ) VALUES (
        v_invitation_record.org_id,
        p_user_id,
        (SELECT full_name FROM public.profiles WHERE id = p_user_id),
        'ACCEPT_INVITATION',
        'user_invitation',
        v_invitation_record.id::TEXT,
        v_invitation_record.email,
        jsonb_build_object(
            'role', v_invitation_record.role,
            'invited_by', v_invitation_record.invited_by_name,
            'timestamp', now()
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Invitation accepted successfully',
        'role', v_invitation_record.role,
        'organization_id', v_invitation_record.org_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_user_invitations_updated_at
    BEFORE UPDATE ON public.user_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();