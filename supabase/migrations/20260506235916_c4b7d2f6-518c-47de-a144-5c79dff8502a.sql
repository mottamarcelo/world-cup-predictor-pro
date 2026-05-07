DROP POLICY IF EXISTS "See others predictions after match ends" ON public.predictions;

CREATE POLICY "See others predictions after kickoff"
ON public.predictions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = predictions.match_id
      AND (m.status = 'finished' OR m.match_date <= now())
  )
);