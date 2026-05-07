ALTER TABLE public.predictions
  DROP CONSTRAINT IF EXISTS predictions_match_id_fkey;

ALTER TABLE public.predictions
  ADD CONSTRAINT predictions_match_id_fkey
  FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE RESTRICT;