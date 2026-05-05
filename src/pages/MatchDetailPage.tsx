import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { TeamFlag } from "@/components/TeamFlag";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { dbMatchToMatch, computeScoreType, pointsFor, DbMatch, DbPrediction } from "@/lib/matchHelpers";
import { ArrowLeft, Loader2, MapPin, Clock, Trophy, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantPrediction {
  userId: string;
  name: string;
  homeScore: number | null;
  awayScore: number | null;
  scoreType: "exact" | "winner" | "none";
  points: number;
}

export default function MatchDetailPage() {
  const { matchId } = useParams();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["matchDetail", matchId, user?.id],
    enabled: !!matchId && !!user,
    queryFn: async () => {
      const { data: m, error: mErr } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId!)
        .maybeSingle();
      if (mErr) throw mErr;
      if (!m) return null;
      const dbMatch = m as DbMatch;
      const match = dbMatchToMatch(dbMatch);

      // Find all leagues the current user belongs to and gather all members
      const { data: myMemberships, error: mmErr } = await supabase
        .from("league_members")
        .select("league_id")
        .eq("user_id", user!.id);
      if (mmErr) throw mmErr;
      const leagueIds = (myMemberships ?? []).map((r) => r.league_id);

      let userIds: string[] = [user!.id];
      if (leagueIds.length > 0) {
        const { data: members, error: memErr } = await supabase
          .from("league_members")
          .select("user_id")
          .in("league_id", leagueIds);
        if (memErr) throw memErr;
        userIds = Array.from(new Set([...(members ?? []).map((r) => r.user_id), user!.id]));
      }

      const [profilesRes, predsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, name").in("user_id", userIds),
        supabase.from("predictions").select("*").eq("match_id", matchId!).in("user_id", userIds),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      if (predsRes.error) throw predsRes.error;

      const profMap = new Map((profilesRes.data ?? []).map((p) => [p.user_id, p.name]));
      const preds = (predsRes.data ?? []) as DbPrediction[];

      const participants: ParticipantPrediction[] = userIds.map((uid) => {
        const pr = preds.find((p) => p.user_id === uid);
        const prediction = pr
          ? { matchId: dbMatch.id, homeScore: pr.home_score, awayScore: pr.away_score }
          : null;
        const st = computeScoreType(match, prediction);
        const scoreType = st === "pending" ? "none" : st;
        return {
          userId: uid,
          name: profMap.get(uid) ?? "Jogador",
          homeScore: pr?.home_score ?? null,
          awayScore: pr?.away_score ?? null,
          scoreType: scoreType as "exact" | "winner" | "none",
          points: pointsFor(st),
        };
      });

      participants.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return a.name.localeCompare(b.name);
      });

      return { match, participants };
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Partida não encontrada</p>
          <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">
            Voltar
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { match, participants } = data;

  return (
    <AppLayout>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para partidas
      </Link>

      <div className="match-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 tabular-nums">
              {match.date.slice(8, 10)}/{match.date.slice(5, 7)}
              <Clock className="h-3 w-3 ml-1" />
              {match.time}
            </span>
            {match.group && (
              <span className="font-medium uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-muted">
                {match.group}
              </span>
            )}
          </div>
          <StatusBadge status={match.status} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamFlag code={match.homeTeam.code} name={match.homeTeam.name} className="w-12 h-9" />
            <p className="text-sm font-semibold truncate w-full text-center">{match.homeTeam.name}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-3xl font-bold tabular-nums w-10 text-center">
              {match.homeScore ?? "-"}
            </span>
            <span className="text-muted-foreground">×</span>
            <span className="text-3xl font-bold tabular-nums w-10 text-center">
              {match.awayScore ?? "-"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamFlag code={match.awayTeam.code} name={match.awayTeam.name} className="w-12 h-9" />
            <p className="text-sm font-semibold truncate w-full text-center">{match.awayTeam.name}</p>
          </div>
        </div>

        {match.venue && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4">
            <MapPin className="h-3 w-3" />
            <span>{match.venue}</span>
          </div>
        )}
      </div>

      <h2 className="text-base font-semibold mb-3">Palpites dos participantes</h2>
      {participants.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum participante.</p>
      ) : (
        <div className="space-y-2">
          {participants.map((p) => {
            const Icon =
              p.scoreType === "exact" ? Trophy : p.scoreType === "winner" ? Target : X;
            const isMe = p.userId === user?.id;
            return (
              <div
                key={p.userId}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-md border bg-card",
                  isMe && "ring-1 ring-primary"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {p.name} {isMe && <span className="text-xs text-muted-foreground">(você)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold tabular-nums">
                    {p.homeScore !== null && p.awayScore !== null
                      ? `${p.homeScore} × ${p.awayScore}`
                      : "—"}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      p.scoreType === "exact" && "score-badge-exact",
                      p.scoreType === "winner" && "score-badge-winner",
                      p.scoreType === "none" && "score-badge-none"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {p.points} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
