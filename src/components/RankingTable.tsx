import { LeagueParticipant } from "@/types";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Trophy, Target } from "lucide-react";

interface RankingTableProps {
  participants: LeagueParticipant[];
  currentUserId: string;
  leagueId: string;
}

function MedalBadge({ position }: { position: number }) {
  if (position === 1) return <span className="text-lg">🥇</span>;
  if (position === 2) return <span className="text-lg">🥈</span>;
  if (position === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm text-muted-foreground font-medium w-7 text-center">{position}º</span>;
}

export function RankingTable({ participants, currentUserId, leagueId }: RankingTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem_3.5rem] md:grid-cols-[3rem_1fr_5rem_4.5rem_4.5rem] gap-2 px-4 py-3 text-xs text-muted-foreground font-medium border-b border-border bg-muted/50">
        <span>#</span>
        <span>Participante</span>
        <span className="text-center">Pts</span>
        <span className="text-center hidden sm:block">
          <Trophy className="h-3 w-3 mx-auto" />
        </span>
        <span className="text-center hidden sm:block">
          <Target className="h-3 w-3 mx-auto" />
        </span>
      </div>

      {/* Rows */}
      {participants.map((p) => {
        const isCurrentUser = p.userId === currentUserId;
        return (
          <Link
            key={p.userId}
            to={`/leagues/${leagueId}/participant/${p.userId}`}
            className={cn(
              "grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem_3.5rem] md:grid-cols-[3rem_1fr_5rem_4.5rem_4.5rem] gap-2 px-4 py-3 items-center transition-colors hover:bg-muted/50 border-b border-border last:border-b-0",
              isCurrentUser && "bg-primary/5"
            )}
          >
            <MedalBadge position={p.position} />
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                {p.avatarInitials}
              </div>
              <span className={cn("text-sm truncate", isCurrentUser && "font-semibold")}>
                {p.name}
                {isCurrentUser && <span className="text-primary ml-1">(você)</span>}
              </span>
            </div>
            <span className="text-sm font-bold text-center tabular-nums">{p.totalPoints}</span>
            <span className="text-xs text-center tabular-nums hidden sm:block">{p.exactHits}</span>
            <span className="text-xs text-center tabular-nums hidden sm:block">{p.winnerHits}</span>
          </Link>
        );
      })}
    </div>
  );
}
