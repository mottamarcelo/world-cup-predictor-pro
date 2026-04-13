import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { RankingTable } from "@/components/RankingTable";
import { leagues, currentUser } from "@/data/mockData";
import { ArrowLeft, Users, Trophy } from "lucide-react";

export default function LeagueDetailPage() {
  const { leagueId } = useParams();
  const league = leagues.find((l) => l.id === leagueId);

  if (!league) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Liga não encontrada</p>
          <Link to="/leagues" className="text-primary text-sm hover:underline mt-2 inline-block">
            Voltar para ligas
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back link */}
      <Link to="/leagues" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      {/* League header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">{league.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {league.participantCount} participantes
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Sua posição: {league.userPosition}º
          </span>
        </div>
      </div>

      <RankingTable
        participants={league.participants}
        currentUserId={currentUser.id}
        leagueId={league.id}
      />
    </AppLayout>
  );
}
