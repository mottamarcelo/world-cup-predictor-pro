import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { MatchList } from "@/components/MatchList";
import { UserSummary } from "@/components/UserSummary";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useLeagueDetail } from "@/hooks/useLeagues";
import { useUserPredictions } from "@/hooks/useMatches";

export default function ParticipantDetailPage() {
  const { leagueId, participantId } = useParams();
  const { data: leagueData, isLoading: lLoading } = useLeagueDetail(leagueId);
  const { data: matches = [], isLoading: mLoading } = useUserPredictions(participantId);

  if (lLoading || mLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </AppLayout>
    );
  }

  const league = leagueData?.league;
  const participant = leagueData?.participants.find((p) => p.userId === participantId);

  if (!league || !participant) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Participante não encontrado</p>
          <Link to="/leagues" className="text-primary text-sm hover:underline mt-2 inline-block">Voltar para ligas</Link>
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
        <MatchList matches={matches} hidePrediction />
      </div>
    </AppLayout>
  );
}
