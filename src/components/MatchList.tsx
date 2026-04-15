import { useMemo } from "react";
import { MatchWithPrediction } from "@/types";
import { MatchCard } from "./MatchCard";
import { Calendar } from "lucide-react";

interface MatchListProps {
  matches: MatchWithPrediction[];
  editable?: boolean;
  hidePrediction?: boolean;
  onPredictionSave?: (matchId: string, homeScore: number, awayScore: number) => void;
}

export function MatchList({ matches, editable = false, hidePrediction = false, onPredictionSave }: MatchListProps) {
  const groupedByDate = useMemo(() => {
    const groups: { date: string; label: string; matches: MatchWithPrediction[] }[] = [];
    const map = new Map<string, MatchWithPrediction[]>();

    for (const match of matches) {
      const existing = map.get(match.date);
      if (existing) {
        existing.push(match);
      } else {
        const arr = [match];
        map.set(match.date, arr);
      }
    }

    for (const [date, dateMatches] of map) {
      const d = new Date(date + "T12:00:00");
      const label = d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      // Sort within day by time, then by group
      dateMatches.sort((a, b) => {
        const timeCmp = a.time.localeCompare(b.time);
        if (timeCmp !== 0) return timeCmp;
        return (a.group ?? "").localeCompare(b.group ?? "");
      });
      groups.push({ date, label, matches: dateMatches });
    }

    return groups;
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Nenhuma partida encontrada</p>
        <p className="text-sm mt-1">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedByDate.map((group) => (
        <div key={group.date}>
          {/* Date header */}
          <div className="flex items-center gap-2 mb-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold capitalize text-foreground">{group.label}</h3>
          </div>

          {/* 2-column grid */}
          <div className={`grid gap-4 ${group.matches.length === 1 ? "grid-cols-1 max-w-[50%] mx-auto" : "grid-cols-1 md:grid-cols-2"}`}>
            {group.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                editable={editable}
                hidePrediction={hidePrediction}
                onPredictionSave={onPredictionSave}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
