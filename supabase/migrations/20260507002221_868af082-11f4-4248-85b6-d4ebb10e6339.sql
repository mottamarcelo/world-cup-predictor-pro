
-- Join requests table
CREATE TABLE public.league_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  decided_by UUID
);

CREATE UNIQUE INDEX league_join_requests_unique_pending
  ON public.league_join_requests(league_id, user_id)
  WHERE status = 'pending';

ALTER TABLE public.league_join_requests ENABLE ROW LEVEL SECURITY;

-- Helper to check league ownership
CREATE OR REPLACE FUNCTION public.is_league_owner(_league_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.leagues WHERE id = _league_id AND owner_id = _user_id);
$$;

-- RLS policies
CREATE POLICY "Users insert own join requests"
ON public.league_join_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own requests"
ON public.league_join_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owners see league requests"
ON public.league_join_requests FOR SELECT TO authenticated
USING (public.is_league_owner(league_id, auth.uid()));

CREATE POLICY "Owners update league requests"
ON public.league_join_requests FOR UPDATE TO authenticated
USING (public.is_league_owner(league_id, auth.uid()))
WITH CHECK (public.is_league_owner(league_id, auth.uid()));

CREATE POLICY "Users cancel own pending requests"
ON public.league_join_requests FOR DELETE TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Approve / reject RPCs
CREATE OR REPLACE FUNCTION public.approve_join_request(_request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.league_join_requests%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.league_join_requests WHERE id = _request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Solicitação não encontrada'; END IF;
  IF NOT public.is_league_owner(r.league_id, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o dono da liga pode aprovar';
  END IF;
  IF r.status <> 'pending' THEN RAISE EXCEPTION 'Solicitação já decidida'; END IF;

  INSERT INTO public.league_members (league_id, user_id)
  VALUES (r.league_id, r.user_id)
  ON CONFLICT (league_id, user_id) DO NOTHING;

  UPDATE public.league_join_requests
  SET status = 'approved', decided_at = now(), decided_by = auth.uid()
  WHERE id = _request_id;
END; $$;

CREATE OR REPLACE FUNCTION public.reject_join_request(_request_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.league_join_requests%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.league_join_requests WHERE id = _request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Solicitação não encontrada'; END IF;
  IF NOT public.is_league_owner(r.league_id, auth.uid()) THEN
    RAISE EXCEPTION 'Apenas o dono da liga pode rejeitar';
  END IF;
  IF r.status <> 'pending' THEN RAISE EXCEPTION 'Solicitação já decidida'; END IF;

  UPDATE public.league_join_requests
  SET status = 'rejected', decided_at = now(), decided_by = auth.uid()
  WHERE id = _request_id;
END; $$;
