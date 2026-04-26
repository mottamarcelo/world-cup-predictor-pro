-- Ensure profile is auto-created for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure owner is auto-added as league member
DROP TRIGGER IF EXISTS on_league_created ON public.leagues;
CREATE TRIGGER on_league_created
AFTER INSERT ON public.leagues
FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();

-- Keep updated_at fresh on profiles
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill profiles for any existing users that don't have one
INSERT INTO public.profiles (user_id, name, email)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
       u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;