import { League } from "@/types";
import { Users, Trophy, ChevronRight, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface LeagueCardProps {
  league: League;
  inviteCode?: string;
}

export function LeagueCard({ league, inviteCode }: LeagueCardProps) {
  const copyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    toast.success(`Código ${inviteCode} copiado!`);
  };

  return (
    <Link to={`/leagues/${league.id}`} className="league-card block animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate">{league.name}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {league.participantCount} participantes
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-semibold">{league.userPoints} pts</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {league.userPosition > 0 ? `${league.userPosition}º lugar` : "—"}
        </div>
        {inviteCode && (
          <button
            onClick={copyCode}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Copiar código de convite"
          >
            <Copy className="h-3 w-3" />
            <span className="font-mono tracking-wider">{inviteCode}</span>
          </button>
        )}
      </div>
    </Link>
  );
}
