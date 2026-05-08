DROP POLICY IF EXISTS "See others predictions after kickoff" ON public.predictions;

CREATE POLICY "Authenticated see all predictions"
ON public.predictions
FOR SELECT
TO authenticated
USING (true);