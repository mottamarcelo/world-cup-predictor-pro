import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { UserSummary } from "@/components/UserSummary";
import { getParticipantPredictions, leagues } from "@/data/mockData";
import { ArrowLeft } from "lucide-react";

export default function ParticipantDetailPage() {
  const { leagueId, participantId } = useParams();
  const league = leagues.find((l) => l.id === leagueId);
  const participant = league?.participants.find((p) => p.userId === participantId);

  const matches = useMemo(
    () => (participantId ? getParticipantPredictions(participantId) : []),
    [participantId]
  );

  if (!league || !participant) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Participante não encontrado</p>
          <Link to="/leagues" className="text-primary text-sm hover:underline mt-2 inline-block">
            Voltar para ligas
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link
        to={`/leagues/${leagueId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para {league.name}
      </Link>

      <UserSummary
        userName={participant.name}
        totalPoints={participant.totalPoints}
        exactHits={participant.exactHits}
        winnerHits={participant.winnerHits}
        position={participant.position}
        leagueName={league.name}
      />

      <div className="mt-6">
        <h2 className="text-base font-semibold mb-4">Palpites de {participant.name}</h2>
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} hidePrediction />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
