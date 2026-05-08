CREATE OR REPLACE FUNCTION public.league_member_counts()
RETURNS TABLE(league_id uuid, member_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT league_id, COUNT(*)::bigint FROM public.league_members GROUP BY league_id;
$$;

GRANT EXECUTE ON FUNCTION public.league_member_counts() TO authenticated;