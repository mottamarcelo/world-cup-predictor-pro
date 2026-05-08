DROP POLICY IF EXISTS "Authenticated see all predictions" ON public.predictions;

CREATE POLICY "See others predictions after lock"
ON public.predictions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = predictions.match_id
      AND m.match_date <= now() + interval '5 minutes'
  )
);