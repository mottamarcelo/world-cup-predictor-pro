import { AppLayout } from "@/components/AppLayout";
import { LeagueCard } from "@/components/LeagueCard";
import { leagues } from "@/data/mockData";

export default function LeaguesPage() {
  return (
    <AppLayout>
      <h1 className="text-xl font-bold mb-4">Minhas Ligas</h1>

      {leagues.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nenhuma liga encontrada</p>
          <p className="text-sm mt-1">Você ainda não participa de nenhuma liga</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
