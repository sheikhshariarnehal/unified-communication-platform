-- Migration 0002: Auto-confirm and Workspace Membership Triggers for Supabase Auth

-- 1. Function to auto-confirm new user signups
CREATE OR REPLACE FUNCTION public.auto_confirm_and_link_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_before_insert ON auth.users;
CREATE TRIGGER on_auth_user_before_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_and_link_user();

-- 2. Function to automatically assign new users to default workspace as owner
CREATE OR REPLACE FUNCTION public.handle_new_user_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_ws_id UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO public.workspaces (id, name, slug, business_type)
  VALUES (default_ws_id, 'Acme Global Corp', 'acme-global', 'B2B SaaS & Communication')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.workspace_members (workspace_id, user_id, role, status, invited_email)
  VALUES (default_ws_id, NEW.id, 'owner', 'active', NEW.email)
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET status = 'active';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_membership();
