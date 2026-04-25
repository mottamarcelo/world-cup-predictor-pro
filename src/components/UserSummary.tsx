import { Trophy, Target, Crosshair, Hash } from "lucide-react";

interface UserSummaryProps {
  totalPoints: number;
  exactHits: number;
  winnerHits: number;
  position: number;
  leagueName: string;
  userName?: string;
}

export function UserSummary({ totalPoints, exactHits, winnerHits, position, leagueName, userName }: UserSummaryProps) {
  return (
    <div className="animate-fade-in">
      {userName && (
        <h2 className="text-lg font-bold mb-3">{userName}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{totalPoints}</p>
          <p className="text-[11px] text-muted-foreground">pontos</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="h-4 w-4 text-success" />
            <span className="text-xs font-medium">Exatos</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{exactHits}</p>
          <p className="text-[11px] text-muted-foreground">acertos</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Crosshair className="h-4 w-4 text-warning" />
            <span className="text-xs font-medium">Acertos</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{winnerHits}</p>
          <p className="text-[11px] text-muted-foreground">acertos</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Hash className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium">Posição</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{position}º</p>
          <p className="text-[11px] text-muted-foreground truncate">{leagueName}</p>
        </div>
      </div>
    </div>
  );
}
