
-- Create admin_logs table for administrative actions (if not exists)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  admin_user_id UUID NOT NULL,
  admin_user_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  resource_name TEXT,
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for enhanced RBAC (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  role_name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_name TEXT,
  user_email TEXT
);

-- Add RLS policies for security_logs (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'security_logs' 
        AND policyname = 'Users can view security logs from their organization'
    ) THEN
        ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view security logs from their organization" 
          ON public.security_logs 
          FOR SELECT 
          USING (
            org_id IN (
              SELECT organization_id 
              FROM public.profiles 
              WHERE id = auth.uid()
            )
          );
    END IF;
END $$;

-- Add RLS policies for admin_logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_logs' 
        AND policyname = 'Admins can view admin logs from their organization'
    ) THEN
        ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Admins can view admin logs from their organization" 
          ON public.admin_logs 
          FOR SELECT 
          USING (
            org_id IN (
              SELECT organization_id 
              FROM public.profiles 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
END $$;

-- Add RLS policies for user_roles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND policyname = 'Users can view roles from their organization'
    ) THEN
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view roles from their organization" 
          ON public.user_roles 
          FOR SELECT 
          USING (
            user_id IN (
              SELECT id 
              FROM public.profiles 
              WHERE organization_id = (
                SELECT organization_id 
                FROM public.profiles 
                WHERE id = auth.uid()
              )
            )
          );
    END IF;
END $$;

-- Add RLS policies for auth_settings (already exists, so just add policies if missing)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auth_settings' 
        AND policyname = 'Users can view auth settings from their organization'
    ) THEN
        CREATE POLICY "Users can view auth settings from their organization" 
          ON public.auth_settings 
          FOR SELECT 
          USING (
            org_id IN (
              SELECT organization_id 
              FROM public.profiles 
              WHERE id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auth_settings' 
        AND policyname = 'Admins can update auth settings from their organization'
    ) THEN
        CREATE POLICY "Admins can update auth settings from their organization" 
          ON public.auth_settings 
          FOR UPDATE 
          USING (
            org_id IN (
              SELECT organization_id 
              FROM public.profiles 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
END $$;
