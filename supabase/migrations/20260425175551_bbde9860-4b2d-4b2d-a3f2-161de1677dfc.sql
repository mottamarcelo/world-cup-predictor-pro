
-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Jogador',
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== MATCHES ===========
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_date TIMESTAMPTZ NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_code TEXT NOT NULL,
  away_code TEXT NOT NULL,
  group_name TEXT,
  stage TEXT NOT NULL DEFAULT 'group',
  venue TEXT,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches viewable by authenticated"
  ON public.matches FOR SELECT TO authenticated USING (true);

CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_matches_date ON public.matches(match_date);

-- =========== PREDICTIONS ===========
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL CHECK (home_score >= 0 AND home_score <= 20),
  away_score INTEGER NOT NULL CHECK (away_score >= 0 AND away_score <= 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Own predictions: full access
CREATE POLICY "Users see own predictions"
  ON public.predictions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own predictions"
  ON public.predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own predictions"
  ON public.predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own predictions"
  ON public.predictions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Others' predictions only after match finishes
CREATE POLICY "See others predictions after match ends"
  ON public.predictions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = predictions.match_id AND m.status = 'finished'
    )
  );

CREATE TRIGGER trg_predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_predictions_user ON public.predictions(user_id);
CREATE INDEX idx_predictions_match ON public.predictions(match_id);

-- =========== LEAGUES ===========
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (league_id, user_id)
);
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- Membership helper to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.is_league_member(_league_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = _league_id AND user_id = _user_id
  );
$$;

-- Leagues: members can see their leagues; anyone authenticated can look up by invite code (handled by app via .eq filter; SELECT below allows it)
CREATE POLICY "Members see their leagues"
  ON public.leagues FOR SELECT TO authenticated
  USING (public.is_league_member(id, auth.uid()) OR owner_id = auth.uid());
CREATE POLICY "Anyone can lookup leagues to join"
  ON public.leagues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create leagues"
  ON public.leagues FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner updates league"
  ON public.leagues FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owner deletes league"
  ON public.leagues FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER trg_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- League members
CREATE POLICY "Members see league roster"
  ON public.league_members FOR SELECT TO authenticated
  USING (public.is_league_member(league_id, auth.uid()));
CREATE POLICY "Users join leagues"
  ON public.league_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave leagues"
  ON public.league_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Auto-add owner as member
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.league_members (league_id, user_id) VALUES (NEW.id, NEW.owner_id);
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_league_add_owner
  AFTER INSERT ON public.leagues
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();

-- Generate invite code helper
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END; $$;

-- Scoring function (10 exact, 5 winner)
CREATE OR REPLACE FUNCTION public.calculate_points(
  pred_home INT, pred_away INT, real_home INT, real_away INT
) RETURNS INT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN real_home IS NULL OR real_away IS NULL THEN 0
    WHEN pred_home = real_home AND pred_away = real_away THEN 10
    WHEN sign(pred_home - pred_away) = sign(real_home - real_away) THEN 5
    ELSE 0
  END;
$$;
