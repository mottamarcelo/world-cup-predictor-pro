import { useMemo } from "react";
import { MatchWithPrediction } from "@/types";
import { MatchCard } from "./MatchCard";
import { Calendar } from "lucide-react";

export type SortField = "date" | "time" | "group";
export type SortDir = "asc" | "desc";

interface MatchListProps {
  matches: MatchWithPrediction[];
  editable?: boolean;
  hidePrediction?: boolean;
  onPredictionSave?: (matchId: string, homeScore: number, awayScore: number) => void;
  sortField?: SortField;
  sortDir?: SortDir;
}

function compareMatches(a: MatchWithPrediction, b: MatchWithPrediction, field: SortField): number {
  if (field === "date") {
    const dc = a.date.localeCompare(b.date);
    if (dc !== 0) return dc;
    return a.time.localeCompare(b.time);
  }
  if (field === "time") {
    const tc = a.time.localeCompare(b.time);
    if (tc !== 0) return tc;
    return a.date.localeCompare(b.date);
  }
  // group
  const gc = (a.group ?? "").localeCompare(b.group ?? "");
  if (gc !== 0) return gc;
  const dc = a.date.localeCompare(b.date);
  if (dc !== 0) return dc;
  return a.time.localeCompare(b.time);
}

export function MatchList({
  matches,
  editable = false,
  hidePrediction = false,
  onPredictionSave,
  sortField = "date",
  sortDir = "asc",
}: MatchListProps) {
  const groupedByDate = useMemo(() => {
    const dirMul = sortDir === "asc" ? 1 : -1;

    if (sortField === "group") {
      // Group by group name instead of date
      const map = new Map<string, MatchWithPrediction[]>();
      for (const match of matches) {
        const key = match.group ?? "Sem grupo";
        const arr = map.get(key);
        if (arr) arr.push(match);
        else map.set(key, [match]);
      }
      const groups = Array.from(map.entries()).map(([key, arr]) => {
        arr.sort((a, b) => compareMatches(a, b, "date") * dirMul);
        return { date: key, label: key, matches: arr };
      });
      groups.sort((a, b) => a.label.localeCompare(b.label) * dirMul);
      return groups;
    }

    // Group by date for date/time sorts
    const map = new Map<string, MatchWithPrediction[]>();
    for (const match of matches) {
      const arr = map.get(match.date);
      if (arr) arr.push(match);
      else map.set(match.date, [match]);
    }

    const groups = Array.from(map.entries()).map(([date, dateMatches]) => {
      const d = new Date(date + "T12:00:00");
      const label = d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      dateMatches.sort((a, b) => compareMatches(a, b, sortField) * dirMul);
      return { date, label, matches: dateMatches };
    });

    groups.sort((a, b) => a.date.localeCompare(b.date) * dirMul);
    return groups;
  }, [matches, sortField, sortDir]);

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
          {/* Group header */}
          <div className="flex items-center gap-2 mb-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold capitalize text-foreground">{group.label}</h3>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {group.matches.map((match) => (
              <div key={match.id} className="w-full lg:w-[calc(50%-0.5rem)]">
                <MatchCard
                  match={match}
                  editable={editable}
                  hidePrediction={hidePrediction}
                  onPredictionSave={onPredictionSave}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
