DROP POLICY IF EXISTS "Users insert predictions before kickoff" ON public.predictions;
DROP POLICY IF EXISTS "Users update predictions before kickoff" ON public.predictions;

CREATE POLICY "Users insert predictions before kickoff"
  ON public.predictions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND m.match_date > now() + interval '5 minutes'
    )
  );

CREATE POLICY "Users update predictions before kickoff"
  ON public.predictions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND m.match_date > now() + interval '5 minutes'
    )
  );