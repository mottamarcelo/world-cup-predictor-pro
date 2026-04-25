import { Match, MatchWithPrediction, Prediction, League, User, ScoreType } from "@/types";

export const currentUser: User = {
  id: "user-1",
  name: "Lucas Silva",
  email: "lucas@email.com",
  avatarInitials: "LS",
};

// Calendário oficial da Copa do Mundo FIFA 2026 (USA, Canadá, México)
// Horários convertidos de EDT para BRT (Brasília, +1h)
export const matches: Match[] = [
  // ===== Matchday 1 =====
  {
    id: "m1", homeTeam: { code: "MEX", name: "México", flag: "🇲🇽" },
    awayTeam: { code: "RSA", name: "África do Sul", flag: "🇿🇦" },
    date: "2026-06-11", time: "16:00", venue: "Estadio Azteca, Cidade do México",
    status: "finished", homeScore: 2, awayScore: 0, group: "Grupo A",
  },
  {
    id: "m2", homeTeam: { code: "CAN", name: "Canadá", flag: "🇨🇦" },
    awayTeam: { code: "PUE", name: "Play-off UEFA A", flag: "🏴" },
    date: "2026-06-12", time: "16:00", venue: "BMO Field, Toronto",
    status: "finished", homeScore: 1, awayScore: 1, group: "Grupo B",
  },
  {
    id: "m3", homeTeam: { code: "USA", name: "Estados Unidos", flag: "🇺🇸" },
    awayTeam: { code: "PAR", name: "Paraguai", flag: "🇵🇾" },
    date: "2026-06-12", time: "22:00", venue: "SoFi Stadium, Los Angeles",
    status: "finished", homeScore: 3, awayScore: 1, group: "Grupo D",
  },
  {
    id: "m4", homeTeam: { code: "BRA", name: "Brasil", flag: "🇧🇷" },
    awayTeam: { code: "MAR", name: "Marrocos", flag: "🇲🇦" },
    date: "2026-06-13", time: "19:00", venue: "MetLife Stadium, Nova York/Nova Jersey",
    status: "finished", homeScore: 2, awayScore: 1, group: "Grupo C",
  },
  {
    id: "m5", homeTeam: { code: "GER", name: "Alemanha", flag: "🇩🇪" },
    awayTeam: { code: "CUW", name: "Curaçao", flag: "🇨🇼" },
    date: "2026-06-14", time: "14:00", venue: "NRG Stadium, Houston",
    status: "finished", homeScore: 4, awayScore: 0, group: "Grupo E",
  },
  {
    id: "m6", homeTeam: { code: "NED", name: "Holanda", flag: "🇳🇱" },
    awayTeam: { code: "JPN", name: "Japão", flag: "🇯🇵" },
    date: "2026-06-14", time: "17:00", venue: "AT&T Stadium, Dallas",
    status: "finished", homeScore: 2, awayScore: 1, group: "Grupo F",
  },
  {
    id: "m7", homeTeam: { code: "ESP", name: "Espanha", flag: "🇪🇸" },
    awayTeam: { code: "CPV", name: "Cabo Verde", flag: "🇨🇻" },
    date: "2026-06-15", time: "13:00", venue: "Mercedes-Benz Stadium, Atlanta",
    status: "finished", homeScore: 3, awayScore: 0, group: "Grupo H",
  },
  {
    id: "m8", homeTeam: { code: "ARG", name: "Argentina", flag: "🇦🇷" },
    awayTeam: { code: "ALG", name: "Argélia", flag: "🇩🇿" },
    date: "2026-06-16", time: "22:00", venue: "Arrowhead Stadium, Kansas City",
    status: "finished", homeScore: 2, awayScore: 0, group: "Grupo J",
  },
  {
    id: "m9", homeTeam: { code: "POR", name: "Portugal", flag: "🇵🇹" },
    awayTeam: { code: "PUF", name: "Play-off FIFA 1", flag: "🌍" },
    date: "2026-06-17", time: "14:00", venue: "NRG Stadium, Houston",
    status: "finished", homeScore: 3, awayScore: 1, group: "Grupo K",
  },
  {
    id: "m10", homeTeam: { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    awayTeam: { code: "CRO", name: "Croácia", flag: "🇭🇷" },
    date: "2026-06-17", time: "17:00", venue: "AT&T Stadium, Dallas",
    status: "finished", homeScore: 1, awayScore: 1, group: "Grupo L",
  },
  {
    id: "m11", homeTeam: { code: "FRA", name: "França", flag: "🇫🇷" },
    awayTeam: { code: "SEN", name: "Senegal", flag: "🇸🇳" },
    date: "2026-06-16", time: "16:00", venue: "MetLife Stadium, Nova York/Nova Jersey",
    status: "finished", homeScore: 2, awayScore: 1, group: "Grupo I",
  },
  {
    id: "m12", homeTeam: { code: "BEL", name: "Bélgica", flag: "🇧🇪" },
    awayTeam: { code: "EGY", name: "Egito", flag: "🇪🇬" },
    date: "2026-06-15", time: "16:00", venue: "Lumen Field, Seattle",
    status: "finished", homeScore: 2, awayScore: 1, group: "Grupo G",
  },
  // ===== Matchday 2 (próximos) =====
  {
    id: "m13", homeTeam: { code: "BRA", name: "Brasil", flag: "🇧🇷" },
    awayTeam: { code: "HAI", name: "Haiti", flag: "🇭🇹" },
    date: "2026-06-19", time: "22:00", venue: "Lincoln Financial Field, Filadélfia",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo C",
  },
  {
    id: "m14", homeTeam: { code: "USA", name: "Estados Unidos", flag: "🇺🇸" },
    awayTeam: { code: "AUS", name: "Austrália", flag: "🇦🇺" },
    date: "2026-06-19", time: "16:00", venue: "Lumen Field, Seattle",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo D",
  },
  {
    id: "m15", homeTeam: { code: "ARG", name: "Argentina", flag: "🇦🇷" },
    awayTeam: { code: "AUT", name: "Áustria", flag: "🇦🇹" },
    date: "2026-06-22", time: "14:00", venue: "AT&T Stadium, Dallas",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo J",
  },
  {
    id: "m16", homeTeam: { code: "ESP", name: "Espanha", flag: "🇪🇸" },
    awayTeam: { code: "KSA", name: "Arábia Saudita", flag: "🇸🇦" },
    date: "2026-06-21", time: "13:00", venue: "Mercedes-Benz Stadium, Atlanta",
    status: "upcoming", homeScore: null, awayScore: null, group: "Grupo H",
  },
];

const userPredictions: Record<string, Prediction> = {
  m1: { matchId: "m1", homeScore: 2, awayScore: 1 },
  m2: { matchId: "m2", homeScore: 3, awayScore: 0 },
  m3: { matchId: "m3", homeScore: 3, awayScore: 0 },
  m4: { matchId: "m4", homeScore: 2, awayScore: 0 },
  m5: { matchId: "m5", homeScore: 3, awayScore: 1 },
  m6: { matchId: "m6", homeScore: 2, awayScore: 1 },
  m7: { matchId: "m7", homeScore: 4, awayScore: 0 },
  m8: { matchId: "m8", homeScore: 2, awayScore: 0 },
  m9: { matchId: "m9", homeScore: 2, awayScore: 1 },
  m10: { matchId: "m10", homeScore: 1, awayScore: 0 },
  m11: { matchId: "m11", homeScore: 2, awayScore: 0 },
  m12: { matchId: "m12", homeScore: 2, awayScore: 1 },
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
