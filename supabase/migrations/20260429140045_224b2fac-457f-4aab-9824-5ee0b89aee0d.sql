-- Allow admins to insert and delete matches
CREATE POLICY "Admins insert matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete matches"
ON public.matches
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));