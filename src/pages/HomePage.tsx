import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MatchCard } from "@/components/MatchCard";
import { UserSummary } from "@/components/UserSummary";
import { getMatchesWithPredictions, getUserStats } from "@/data/mockData";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Filter = "all" | "upcoming" | "finished";

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const stats = getUserStats();
  const allMatches = useMemo(() => getMatchesWithPredictions(), []);

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

      {/* Matches */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nenhuma partida encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
