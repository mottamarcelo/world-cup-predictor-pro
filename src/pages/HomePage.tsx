import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MatchList } from "@/components/MatchList";
import { UserSummary } from "@/components/UserSummary";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMatchesWithPredictions, useSavePrediction } from "@/hooks/useMatches";
import { useMyLeagues } from "@/hooks/useLeagues";
import { toast } from "sonner";

type Filter = "all" | "upcoming" | "finished";

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const { data: allMatches = [], isLoading } = useMatchesWithPredictions();
  const { data: leagues = [] } = useMyLeagues();
  const savePrediction = useSavePrediction();

  const stats = useMemo(() => {
    const finished = allMatches.filter((m) => m.status === "finished");
    const totalPoints = finished.reduce((s, m) => s + m.points, 0);
    const exactHits = finished.filter((m) => m.scoreType === "exact").length;
    const winnerHits = finished.filter((m) => m.scoreType === "winner").length;
    const topLeague = leagues[0];
    return {
      totalPoints,
      exactHits,
      winnerHits,
      position: topLeague?.userPosition ?? 0,
      leagueName: topLeague?.name ?? "Nenhuma liga",
    };
  }, [allMatches, leagues]);

  const handlePredictionSave = async (matchId: string, homeScore: number, awayScore: number) => {
    try {
      await savePrediction.mutateAsync({ matchId, homeScore, awayScore });
    } catch (e) {
      toast.error("Erro ao salvar palpite", { description: (e as Error).message });
    }
  };

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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MatchList matches={filteredMatches} editable onPredictionSave={handlePredictionSave} />
      )}
    </AppLayout>
  );
}
