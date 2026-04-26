import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { buildMatchesWithPredictions, DbMatch, DbPrediction } from "@/lib/matchHelpers";
import { LeagueParticipant } from "@/types";

export interface DbLeague {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

export interface DbLeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  joined_at: string;
}

export interface LeagueWithStats extends DbLeague {
  participantCount: number;
  userPoints: number;
  userPosition: number;
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function computeParticipants(leagueId: string): Promise<LeagueParticipant[]> {
  const { data: members, error: mErr } = await supabase
    .from("league_members")
    .select("user_id")
    .eq("league_id", leagueId);
  if (mErr) throw mErr;
  const userIds = (members ?? []).map((m) => m.user_id);
  if (userIds.length === 0) return [];

  const [profilesRes, matchesRes, predsRes] = await Promise.all([
    supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", userIds),
    supabase.from("matches").select("*"),
    supabase.from("predictions").select("*").in("user_id", userIds),
  ]);
  if (profilesRes.error) throw profilesRes.error;
  if (matchesRes.error) throw matchesRes.error;
  if (predsRes.error) throw predsRes.error;

  const matches = (matchesRes.data ?? []) as DbMatch[];
  const allPreds = (predsRes.data ?? []) as DbPrediction[];

  const stats = userIds.map((uid) => {
    const userPreds = allPreds.filter((p) => p.user_id === uid);
    const mwp = buildMatchesWithPredictions(matches, userPreds);
    const finished = mwp.filter((m) => m.status === "finished");
    const totalPoints = finished.reduce((s, m) => s + m.points, 0);
    const exactHits = finished.filter((m) => m.scoreType === "exact").length;
    const winnerHits = finished.filter((m) => m.scoreType === "winner").length;
    const profile = (profilesRes.data ?? []).find((p) => p.user_id === uid);
    const name = profile?.name ?? "Jogador";
    return {
      userId: uid,
      name,
      avatarInitials: initialsOf(name),
      totalPoints,
      exactHits,
      winnerHits,
      position: 0,
    };
  });
  stats.sort((a, b) => b.totalPoints - a.totalPoints || b.exactHits - a.exactHits);
  stats.forEach((s, i) => {
    s.position = i + 1;
  });
  return stats;
}

export function useMyLeagues() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myLeagues", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<LeagueWithStats[]> => {
      const { data: memberships, error } = await supabase
        .from("league_members")
        .select("league_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      const ids = (memberships ?? []).map((m) => m.league_id);
      if (ids.length === 0) return [];
      const { data: leagues, error: lErr } = await supabase
        .from("leagues")
        .select("*")
        .in("id", ids);
      if (lErr) throw lErr;

      const result: LeagueWithStats[] = [];
      for (const lg of (leagues ?? []) as DbLeague[]) {
        const participants = await computeParticipants(lg.id);
        const me = participants.find((p) => p.userId === user!.id);
        result.push({
          ...lg,
          participantCount: participants.length,
          userPoints: me?.totalPoints ?? 0,
          userPosition: me?.position ?? 0,
        });
      }
      return result;
    },
  });
}

export function useLeagueDetail(leagueId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["leagueDetail", leagueId, user?.id],
    enabled: !!leagueId && !!user,
    queryFn: async (): Promise<{ league: DbLeague; participants: LeagueParticipant[] } | null> => {
      const { data: lg, error } = await supabase
        .from("leagues")
        .select("*")
        .eq("id", leagueId!)
        .maybeSingle();
      if (error) throw error;
      if (!lg) return null;
      const participants = await computeParticipants(lg.id);
      return { league: lg as DbLeague, participants };
    },
  });
}

export function useCreateLeague() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string }) => {
      if (!user) throw new Error("Não autenticado");
      // Generate invite code via DB function
      const { data: codeData, error: codeErr } = await supabase.rpc("generate_invite_code");
      if (codeErr) throw codeErr;
      const code: string = (codeData as string) ?? Math.random().toString(36).slice(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from("leagues")
        .insert({
          name: input.name.trim(),
          description: input.description?.trim() || null,
          invite_code: code,
          owner_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as DbLeague;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myLeagues"] }),
  });
}

export function useJoinLeague() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error("Não autenticado");
      const code = inviteCode.trim().toUpperCase();
      const { data: league, error } = await supabase
        .from("leagues")
        .select("id, name")
        .eq("invite_code", code)
        .maybeSingle();
      if (error) throw error;
      if (!league) throw new Error("Código inválido");

      const { error: insErr } = await supabase
        .from("league_members")
        .insert({ league_id: league.id, user_id: user.id });
      if (insErr) {
        if (insErr.code === "23505") throw new Error("Você já participa dessa liga");
        throw insErr;
      }
      return league;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myLeagues"] }),
  });
}
