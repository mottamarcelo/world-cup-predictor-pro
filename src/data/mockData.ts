import { Match, MatchWithPrediction, Prediction, League, User, ScoreType } from "@/types";

export const currentUser: User = {
  id: "user-1",
  name: "Lucas Silva",
  email: "lucas@email.com",
  avatarInitials: "LS",
};

export const matches: Match[] = [
  {
    id: "m1", homeTeam: { code: "BRA", name: "Brasil", flag: "🇧🇷" },
    awayTeam: { code: "SRB", name: "Sérvia", flag: "🇷🇸" },
    date: "2026-06-12", time: "16:00", venue: "MetLife Stadium, Nova York",
    status: "finished", homeScore: 2, awayScore: 0, group: "Grupo G",
  },
  {
    id: "m2", homeTeam: { code: "ARG", name: "Argentina", flag: "🇦🇷" },
    awayTeam: { code: "KSA", name: "Arábia Saudita", flag: "🇸🇦" },
    date: "2026-06-12", time: "13:00", venue: "Lumen Field, Seattle",
    status: "finished", homeScore: 1, awayScore: 2, group: "Grupo C",
  },
  {
    id: "m3", homeTeam: { code: "FRA", name: "França", flag: "🇫🇷" },
    awayTeam: { code: "AUS", name: "Austrália", flag: "🇦🇺" },
    date: "2026-06-13", time: "19:00", venue: "SoFi Stadium, Los Angeles",
    status: "finished", homeScore: 4, awayScore: 1, group: "Grupo D",
  },
  {
    id: "m4", homeTeam: { code: "GER", name: "Alemanha", flag: "🇩🇪" },
    awayTeam: { code: "JPN", name: "Japão", flag: "🇯🇵" },
    date: "2026-06-13", time: "16:00", venue: "AT&T Stadium, Dallas",
    status: "finished", homeScore: 1, awayScore: 2, group: "Grupo E",
  },
  {
    id: "m5", homeTeam: { code: "ESP", name: "Espanha", flag: "🇪🇸" },
    awayTeam: { code: "CRC", name: "Costa Rica", flag: "🇨🇷" },
    date: "2026-06-14", time: "13:00", venue: "Hard Rock Stadium, Miami",
    status: "finished", homeScore: 7, awayScore: 0, group: "Grupo E",
  },
  {
    id: "m6", homeTeam: { code: "POR", name: "Portugal", flag: "🇵🇹" },
    awayTeam: { code: "GHA", name: "Gana", flag: "🇬🇭" },
    date: "2026-06-14", time: "16:00", venue: "Lincoln Financial Field, Filadélfia",
    status: "finished", homeScore: 3, awayScore: 2, group: "Grupo H",
  },
  {
    id: "m7", homeTeam: { code: "BRA", name: "Brasil", flag: "🇧🇷" },
    awayTeam: { code: "SUI", name: "Suíça", flag: "🇨🇭" },
    date: "2026-06-17", time: "16:00", venue: "MetLife Stadium, Nova York",
    status: "finished", homeScore: 1, awayScore: 0, group: "Grupo G",
  },
  {
    id: "m8", homeTeam: { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    awayTeam: { code: "USA", name: "Estados Unidos", flag: "🇺🇸" },
    date: "2026-06-18", time: "19:00", venue: "Rose Bowl, Los Angeles",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo B",
  },
  {
    id: "m9", homeTeam: { code: "ARG", name: "Argentina", flag: "🇦🇷" },
    awayTeam: { code: "MEX", name: "México", flag: "🇲🇽" },
    date: "2026-06-19", time: "22:00", venue: "Estadio Azteca, Cidade do México",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo C",
  },
  {
    id: "m10", homeTeam: { code: "BRA", name: "Brasil", flag: "🇧🇷" },
    awayTeam: { code: "CMR", name: "Camarões", flag: "🇨🇲" },
    date: "2026-06-20", time: "16:00", venue: "BC Place, Vancouver",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo G",
  },
  {
    id: "m11", homeTeam: { code: "FRA", name: "França", flag: "🇫🇷" },
    awayTeam: { code: "DEN", name: "Dinamarca", flag: "🇩🇰" },
    date: "2026-06-21", time: "19:00", venue: "BMO Field, Toronto",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo D",
  },
  {
    id: "m12", homeTeam: { code: "POR", name: "Portugal", flag: "🇵🇹" },
    awayTeam: { code: "URY", name: "Uruguai", flag: "🇺🇾" },
    date: "2026-06-22", time: "16:00", venue: "Gillette Stadium, Boston",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo H",
  },
];

const userPredictions: Record<string, Prediction> = {
  m1: { matchId: "m1", homeScore: 2, awayScore: 0 },
  m2: { matchId: "m2", homeScore: 2, awayScore: 0 },
  m3: { matchId: "m3", homeScore: 3, awayScore: 1 },
  m4: { matchId: "m4", homeScore: 2, awayScore: 0 },
  m5: { matchId: "m5", homeScore: 4, awayScore: 0 },
  m6: { matchId: "m6", homeScore: 2, awayScore: 1 },
  m7: { matchId: "m7", homeScore: 1, awayScore: 0 },
  m8: { matchId: "m8", homeScore: 2, awayScore: 1 },
  m9: { matchId: "m9", homeScore: 1, awayScore: 0 },
  m10: { matchId: "m10", homeScore: 3, awayScore: 0 },
};

function computeScoreType(match: Match, pred: Prediction | null): ScoreType {
  if (match.status === "upcoming") return "pending";
  if (!pred || pred.homeScore === null || pred.awayScore === null) return "none";
  if (match.homeScore === pred.homeScore && match.awayScore === pred.awayScore) return "exact";
  const matchResult = Math.sign((match.homeScore ?? 0) - (match.awayScore ?? 0));
  const predResult = Math.sign(pred.homeScore - pred.awayScore);
  if (matchResult === predResult) return "winner";
  return "none";
}

function computePoints(scoreType: ScoreType): number {
  if (scoreType === "exact") return 10;
  if (scoreType === "winner") return 5;
  return 0;
}

export function getMatchesWithPredictions(predictions: Record<string, Prediction> = userPredictions): MatchWithPrediction[] {
  return matches.map((match) => {
    const pred = predictions[match.id] ?? null;
    const scoreType = computeScoreType(match, pred);
    return {
      ...match,
      prediction: pred,
      scoreType,
      points: computePoints(scoreType),
    };
  }).sort((a, b) => {
    if (a.status === "upcoming" && b.status === "finished") return -1;
    if (a.status === "finished" && b.status === "upcoming") return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

const participantPredictions: Record<string, Record<string, Prediction>> = {
  "user-2": {
    m1: { matchId: "m1", homeScore: 1, awayScore: 0 },
    m2: { matchId: "m2", homeScore: 3, awayScore: 0 },
    m3: { matchId: "m3", homeScore: 2, awayScore: 0 },
    m4: { matchId: "m4", homeScore: 3, awayScore: 1 },
    m5: { matchId: "m5", homeScore: 7, awayScore: 0 },
    m6: { matchId: "m6", homeScore: 2, awayScore: 0 },
    m7: { matchId: "m7", homeScore: 2, awayScore: 1 },
    m8: { matchId: "m8", homeScore: 1, awayScore: 1 },
  },
  "user-3": {
    m1: { matchId: "m1", homeScore: 3, awayScore: 1 },
    m2: { matchId: "m2", homeScore: 1, awayScore: 2 },
    m3: { matchId: "m3", homeScore: 4, awayScore: 1 },
    m4: { matchId: "m4", homeScore: 1, awayScore: 1 },
    m5: { matchId: "m5", homeScore: 3, awayScore: 0 },
    m6: { matchId: "m6", homeScore: 3, awayScore: 2 },
    m7: { matchId: "m7", homeScore: 0, awayScore: 1 },
  },
  "user-4": {
    m1: { matchId: "m1", homeScore: 2, awayScore: 1 },
    m2: { matchId: "m2", homeScore: 2, awayScore: 1 },
    m3: { matchId: "m3", homeScore: 2, awayScore: 0 },
    m4: { matchId: "m4", homeScore: 2, awayScore: 1 },
    m5: { matchId: "m5", homeScore: 5, awayScore: 1 },
    m6: { matchId: "m6", homeScore: 1, awayScore: 0 },
    m7: { matchId: "m7", homeScore: 1, awayScore: 1 },
  },
  "user-5": {
    m1: { matchId: "m1", homeScore: 1, awayScore: 1 },
    m2: { matchId: "m2", homeScore: 0, awayScore: 1 },
    m3: { matchId: "m3", homeScore: 3, awayScore: 0 },
    m5: { matchId: "m5", homeScore: 4, awayScore: 1 },
    m6: { matchId: "m6", homeScore: 2, awayScore: 2 },
  },
  "user-6": {
    m1: { matchId: "m1", homeScore: 2, awayScore: 0 },
    m2: { matchId: "m2", homeScore: 1, awayScore: 0 },
    m3: { matchId: "m3", homeScore: 1, awayScore: 0 },
    m4: { matchId: "m4", homeScore: 1, awayScore: 2 },
    m5: { matchId: "m5", homeScore: 3, awayScore: 0 },
    m7: { matchId: "m7", homeScore: 0, awayScore: 2 },
  },
  "user-7": {
    m1: { matchId: "m1", homeScore: 0, awayScore: 1 },
    m2: { matchId: "m2", homeScore: 2, awayScore: 1 },
    m4: { matchId: "m4", homeScore: 0, awayScore: 1 },
    m5: { matchId: "m5", homeScore: 6, awayScore: 0 },
    m6: { matchId: "m6", homeScore: 2, awayScore: 1 },
  },
  "user-8": {
    m1: { matchId: "m1", homeScore: 3, awayScore: 0 },
    m2: { matchId: "m2", homeScore: 2, awayScore: 0 },
    m3: { matchId: "m3", homeScore: 2, awayScore: 2 },
    m4: { matchId: "m4", homeScore: 2, awayScore: 2 },
    m5: { matchId: "m5", homeScore: 5, awayScore: 0 },
    m6: { matchId: "m6", homeScore: 3, awayScore: 1 },
    m7: { matchId: "m7", homeScore: 2, awayScore: 0 },
  },
  "user-9": {
    m1: { matchId: "m1", homeScore: 1, awayScore: 0 },
    m3: { matchId: "m3", homeScore: 3, awayScore: 2 },
    m5: { matchId: "m5", homeScore: 2, awayScore: 0 },
    m6: { matchId: "m6", homeScore: 1, awayScore: 1 },
  },
};

export function getParticipantPredictions(userId: string): MatchWithPrediction[] {
  if (userId === currentUser.id) return getMatchesWithPredictions();
  const preds = participantPredictions[userId] ?? {};
  return getMatchesWithPredictions(preds);
}

const allUsers: Record<string, { name: string; initials: string }> = {
  "user-1": { name: "Lucas Silva", initials: "LS" },
  "user-2": { name: "Ana Oliveira", initials: "AO" },
  "user-3": { name: "Pedro Santos", initials: "PS" },
  "user-4": { name: "Maria Costa", initials: "MC" },
  "user-5": { name: "João Ferreira", initials: "JF" },
  "user-6": { name: "Camila Souza", initials: "CS" },
  "user-7": { name: "Rafael Lima", initials: "RL" },
  "user-8": { name: "Isabela Alves", initials: "IA" },
  "user-9": { name: "Gabriel Rocha", initials: "GR" },
};

function buildParticipants(userIds: string[]): { userId: string; name: string; avatarInitials: string; totalPoints: number; exactHits: number; winnerHits: number; position: number }[] {
  const results = userIds.map((uid) => {
    const preds = uid === "user-1" ? getMatchesWithPredictions() : getParticipantPredictions(uid);
    const finished = preds.filter(m => m.status === "finished");
    const totalPoints = finished.reduce((s, m) => s + m.points, 0);
    const exactHits = finished.filter(m => m.scoreType === "exact").length;
    const winnerHits = finished.filter(m => m.scoreType === "winner").length;
    const user = allUsers[uid];
    return { userId: uid, name: user.name, avatarInitials: user.initials, totalPoints, exactHits, winnerHits, position: 0 };
  });
  results.sort((a, b) => b.totalPoints - a.totalPoints);
  results.forEach((r, i) => { r.position = i + 1; });
  return results;
}

const league1Participants = buildParticipants(["user-1", "user-2", "user-3", "user-4", "user-5", "user-6", "user-7", "user-8", "user-9"]);
const league2Participants = buildParticipants(["user-1", "user-3", "user-5", "user-7", "user-9"]);

export const leagues: League[] = [
  {
    id: "league-1",
    name: "Bolão dos Amigos",
    participantCount: 9,
    userPoints: league1Participants.find(p => p.userId === "user-1")?.totalPoints ?? 0,
    userPosition: league1Participants.find(p => p.userId === "user-1")?.position ?? 0,
    participants: league1Participants,
  },
  {
    id: "league-2",
    name: "Família Copa 2026",
    participantCount: 5,
    userPoints: league2Participants.find(p => p.userId === "user-1")?.totalPoints ?? 0,
    userPosition: league2Participants.find(p => p.userId === "user-1")?.position ?? 0,
    participants: league2Participants,
  },
];

export function getUserStats() {
  const mwp = getMatchesWithPredictions();
  const finished = mwp.filter(m => m.status === "finished");
  return {
    totalPoints: finished.reduce((s, m) => s + m.points, 0),
    exactHits: finished.filter(m => m.scoreType === "exact").length,
    winnerHits: finished.filter(m => m.scoreType === "winner").length,
    totalPredictions: finished.filter(m => m.prediction !== null).length,
    position: leagues[0]?.userPosition ?? 0,
    leagueName: leagues[0]?.name ?? "",
  };
}
