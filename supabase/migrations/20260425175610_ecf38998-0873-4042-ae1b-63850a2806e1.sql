
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION public.calculate_points(
  pred_home INT, pred_away INT, real_home INT, real_away INT
) RETURNS INT LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN real_home IS NULL OR real_away IS NULL THEN 0
    WHEN pred_home = real_home AND pred_away = real_away THEN 10
    WHEN sign(pred_home - pred_away) = sign(real_home - real_away) THEN 5
    ELSE 0
  END;
$$;
