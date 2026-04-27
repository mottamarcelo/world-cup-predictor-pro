export interface Team {
  code: string;
  name: string;
  flag: string; // emoji flag
}

export type MatchStatus = "upcoming" | "finished";

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string; // ISO YYYY-MM-DD (BRT)
  time: string; // HH:mm (BRT)
  kickoffAt: string; // ISO timestamp (UTC) — source of truth for "started"
  venue: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  group?: string;
  round?: string;
}

export type ScoreType = "exact" | "winner" | "none" | "pending";

export interface Prediction {
  matchId: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface MatchWithPrediction extends Match {
  prediction: Prediction | null;
  scoreType: ScoreType;
  points: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

export interface LeagueParticipant {
  userId: string;
  name: string;
  avatarInitials: string;
  totalPoints: number;
  exactHits: number;
  winnerHits: number;
  position: number;
}

export interface League {
  id: string;
  name: string;
  participantCount: number;
  userPoints: number;
  userPosition: number;
  participants: LeagueParticipant[];
}
