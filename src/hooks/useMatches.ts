import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { buildMatchesWithPredictions, DbMatch, DbPrediction } from "@/lib/matchHelpers";
import { MatchWithPrediction } from "@/types";

async function fetchMatches(): Promise<DbMatch[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbMatch[];
}

async function fetchOwnPredictions(userId: string): Promise<DbPrediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as DbPrediction[];
}

export function useMatchesWithPredictions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["matchesWithPredictions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<MatchWithPrediction[]> => {
      const [matches, preds] = await Promise.all([fetchMatches(), fetchOwnPredictions(user!.id)]);
      return buildMatchesWithPredictions(matches, preds);
    },
  });
}

// Predictions of another user — only finished matches' predictions will return due to RLS
export function useUserPredictions(userId: string | undefined) {
  return useQuery({
    queryKey: ["userPredictions", userId],
    enabled: !!userId,
    queryFn: async (): Promise<MatchWithPrediction[]> => {
      const [matches, predsRes] = await Promise.all([
        fetchMatches(),
        supabase.from("predictions").select("*").eq("user_id", userId!),
      ]);
      if (predsRes.error) throw predsRes.error;
      return buildMatchesWithPredictions(matches, (predsRes.data ?? []) as DbPrediction[]);
    },
  });
}

export function useSavePrediction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { matchId: string; homeScore: number; awayScore: number }) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase.from("predictions").upsert(
        {
          user_id: user.id,
          match_id: p.matchId,
          home_score: p.homeScore,
          away_score: p.awayScore,
        },
        { onConflict: "user_id,match_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matchesWithPredictions"] }),
  });
}
