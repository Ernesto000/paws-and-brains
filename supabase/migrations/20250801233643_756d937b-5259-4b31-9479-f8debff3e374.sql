-- Fix function search path security issues

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT role FROM public.user_roles 
    WHERE user_id = COALESCE(user_uuid, auth.uid()) 
    ORDER BY assigned_at DESC 
    LIMIT 1;
$$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(required_role app_role, user_uuid UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = COALESCE(user_uuid, auth.uid()) AND role = required_role
    );
$$;

-- Fix handle_new_user_role function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'unverified');
    
    -- Log the new user registration
    INSERT INTO public.audit_logs (user_id, action, details)
    VALUES (NEW.id, 'user_registered', jsonb_build_object('email', NEW.email));
    
    RETURN NEW;
END;
$$;

-- Fix log_user_action function
CREATE OR REPLACE FUNCTION public.log_user_action(
    action_name TEXT,
    resource_type_param TEXT DEFAULT NULL,
    resource_id_param TEXT DEFAULT NULL,
    details_param JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, 
        action, 
        resource_type, 
        resource_id, 
        details
    )
    VALUES (
        auth.uid(),
        action_name,
        resource_type_param,
        resource_id_param,
        details_param
    );
END;
$$;