import { MatchWithPrediction } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { ScoreBadge } from "./ScoreBadge";
import { MapPin, Calendar } from "lucide-react";

interface MatchCardProps {
  match: MatchWithPrediction;
}

export function MatchCard({ match }: MatchCardProps) {
  const dateFormatted = new Date(match.date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  });

  return (
    <div className="match-card animate-fade-in">
      {/* Top: Date, time, status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{dateFormatted} · {match.time}</span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {/* Group */}
      {match.group && (
        <div className="text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">
          {match.group}
        </div>
      )}

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Home team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl">{match.homeTeam.flag}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{match.homeTeam.name}</p>
            <p className="text-[11px] text-muted-foreground">{match.homeTeam.code}</p>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xl font-bold tabular-nums w-7 text-center">
            {match.homeScore !== null ? match.homeScore : "-"}
          </span>
          <span className="text-muted-foreground text-sm">×</span>
          <span className="text-xl font-bold tabular-nums w-7 text-center">
            {match.awayScore !== null ? match.awayScore : "-"}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{match.awayTeam.name}</p>
            <p className="text-[11px] text-muted-foreground">{match.awayTeam.code}</p>
          </div>
          <span className="text-2xl">{match.awayTeam.flag}</span>
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{match.venue}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Seu palpite</p>
            {match.prediction ? (
              <p className="text-sm font-semibold tabular-nums">
                {match.prediction.homeScore} × {match.prediction.awayScore}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sem palpite</p>
            )}
          </div>
          <ScoreBadge scoreType={match.scoreType} points={match.points} />
        </div>
      </div>
    </div>
  );
}
