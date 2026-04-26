import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { RankingTable } from "@/components/RankingTable";
import { ArrowLeft, Users, Trophy, Copy, Loader2 } from "lucide-react";
import { useLeagueDetail } from "@/hooks/useLeagues";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function LeagueDetailPage() {
  const { leagueId } = useParams();
  const { user } = useAuth();
  const { data, isLoading } = useLeagueDetail(leagueId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Liga não encontrada</p>
          <Link to="/leagues" className="text-primary text-sm hover:underline mt-2 inline-block">Voltar para ligas</Link>
        </div>
      </AppLayout>
    );
  }

  const { league, participants } = data;
  const myPos = participants.find((p) => p.userId === user?.id)?.position ?? 0;

  return (
    <AppLayout>
      <Link to="/leagues" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />Voltar
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold">{league.name}</h1>
        {league.description && <p className="text-sm text-muted-foreground mt-1">{league.description}</p>}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{participants.length} participantes</span>
          {myPos > 0 && <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-primary" />Sua posição: {myPos}º</span>}
          <button
            onClick={() => { navigator.clipboard.writeText(league.invite_code); toast.success(`Código ${league.invite_code} copiado!`); }}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            title="Copiar código de convite"
          >
            <Copy className="h-3.5 w-3.5" /><span className="font-mono tracking-wider">{league.invite_code}</span>
          </button>
        </div>
      </div>

      <RankingTable participants={participants} currentUserId={user?.id ?? ""} leagueId={league.id} />
    </AppLayout>
  );
}
