-- ==============================================================================
-- StoryHour Supabase Auth Trigger Migration
-- Ensures automated database profile provisioning upon user registration (B-08)
-- Execute in Supabase SQL Editor:
-- ==============================================================================

-- 1. Create function to automatically sync newly registered users into public.user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_full_name text;
BEGIN
    user_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );

    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        subscription_tier,
        is_active,
        is_deleted,
        created_at,
        updated_at
    )
    VALUES (
        new.id::text,
        LOWER(TRIM(new.email)),
        user_full_name,
        'free',
        true,
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.user_profiles.full_name, EXCLUDED.full_name),
        updated_at = NOW()
    WHERE public.user_profiles.is_deleted = false;

    RETURN new;
END;
$$;

-- 2. Create the trigger on Supabase Auth auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. Also trigger update if user email is updated in auth.users
CREATE OR REPLACE FUNCTION public.handle_update_user_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF new.email IS DISTINCT FROM old.email THEN
        UPDATE public.user_profiles
        SET
            email = LOWER(TRIM(new.email)),
            updated_at = NOW()
        WHERE user_id = new.id::text;
    END IF;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_update_user_email();
