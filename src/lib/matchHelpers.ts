import type { Match, MatchStatus, MatchWithPrediction, Prediction, ScoreType } from "@/types";

// Database row shapes
export interface DbMatch {
  id: string;
  match_date: string;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  group_name: string | null;
  stage: string;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
}

export interface DbPrediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
}

const FLAG_FALLBACK: Record<string, string> = {};

function emoji(_code: string): string {
  return FLAG_FALLBACK[_code] ?? "";
}

function statusFromDb(s: string): MatchStatus {
  return s === "finished" ? "finished" : "upcoming";
}

export function dbMatchToMatch(m: DbMatch): Match {
  const d = new Date(m.match_date);
  // Format BRT
  const isoDate = d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }); // YYYY-MM-DD
  const time = d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
  return {
    id: m.id,
    homeTeam: { code: m.home_code, name: m.home_team, flag: emoji(m.home_code) },
    awayTeam: { code: m.away_code, name: m.away_team, flag: emoji(m.away_code) },
    date: isoDate,
    time,
    venue: m.venue ?? "",
    status: statusFromDb(m.status),
    homeScore: m.home_score,
    awayScore: m.away_score,
    group: m.group_name ? `Grupo ${m.group_name}` : undefined,
  };
}

export function computeScoreType(match: Match, pred: Prediction | null): ScoreType {
  if (match.status === "upcoming") return "pending";
  if (!pred || pred.homeScore === null || pred.awayScore === null) return "none";
  if (match.homeScore === pred.homeScore && match.awayScore === pred.awayScore) return "exact";
  const matchResult = Math.sign((match.homeScore ?? 0) - (match.awayScore ?? 0));
  const predResult = Math.sign(pred.homeScore - pred.awayScore);
  if (matchResult === predResult) return "winner";
  return "none";
}

export function pointsFor(scoreType: ScoreType): number {
  if (scoreType === "exact") return 10;
  if (scoreType === "winner") return 5;
  return 0;
}

export function buildMatchesWithPredictions(
  matches: DbMatch[],
  predictions: DbPrediction[]
): MatchWithPrediction[] {
  const predByMatch = new Map(predictions.map((p) => [p.match_id, p]));
  return matches
    .map((dbm) => {
      const match = dbMatchToMatch(dbm);
      const dbPred = predByMatch.get(dbm.id) ?? null;
      const prediction: Prediction | null = dbPred
        ? { matchId: dbm.id, homeScore: dbPred.home_score, awayScore: dbPred.away_score }
        : null;
      const scoreType = computeScoreType(match, prediction);
      return { ...match, prediction, scoreType, points: pointsFor(scoreType) };
    })
    .sort((a, b) => {
      if (a.status === "upcoming" && b.status === "finished") return -1;
      if (a.status === "finished" && b.status === "upcoming") return 1;
      const ad = new Date(`${a.date}T${a.time}:00`).getTime();
      const bd = new Date(`${b.date}T${b.time}:00`).getTime();
      return a.status === "upcoming" ? ad - bd : bd - ad;
    });
}
