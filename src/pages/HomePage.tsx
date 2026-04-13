import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MatchList } from "@/components/MatchList";
import { UserSummary } from "@/components/UserSummary";
import { getMatchesWithPredictions, getUserStats } from "@/data/mockData";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MatchWithPrediction } from "@/types";

type Filter = "all" | "upcoming" | "finished";

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const stats = getUserStats();
  const [allMatches, setAllMatches] = useState<MatchWithPrediction[]>(() => getMatchesWithPredictions());

  const handlePredictionSave = useCallback((matchId: string, homeScore: number, awayScore: number) => {
    setAllMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, prediction: { matchId, homeScore, awayScore } }
          : m
      )
    );
  }, []);

  const filteredMatches = useMemo(() => {
    let list = allMatches;
    if (filter === "upcoming") list = list.filter((m) => m.status === "upcoming");
    if (filter === "finished") list = list.filter((m) => m.status === "finished");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.homeTeam.code.toLowerCase().includes(q) ||
          m.awayTeam.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allMatches, filter, search]);

  const filters: { label: string; value: Filter }[] = [
    { label: "Todos", value: "all" },
    { label: "Próximos", value: "upcoming" },
    { label: "Finalizados", value: "finished" },
  ];

  return (
    <AppLayout>
      <UserSummary {...stats} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 mb-4">
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`nav-item ${filter === f.value ? "nav-item-active" : "nav-item-inactive"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar seleção..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <MatchList
        matches={filteredMatches}
        editable
        onPredictionSave={handlePredictionSave}
      />
    </AppLayout>
  );
}
