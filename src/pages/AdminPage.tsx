import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Save, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { DbMatch } from "@/lib/matchHelpers";

interface RowState {
  home: string;
  away: string;
  finished: boolean;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["adminMatches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbMatch[];
    },
  });

  const [rows, setRows] = useState<Record<string, RowState>>({});

  useEffect(() => {
    if (!matches) return;
    const init: Record<string, RowState> = {};
    matches.forEach((m) => {
      init[m.id] = {
        home: m.home_score?.toString() ?? "",
        away: m.away_score?.toString() ?? "",
        finished: m.status === "finished",
      };
    });
    setRows(init);
  }, [matches]);

  const saveMutation = useMutation({
    mutationFn: async (m: DbMatch) => {
      const r = rows[m.id];
      const home = r.home === "" ? null : parseInt(r.home, 10);
      const away = r.away === "" ? null : parseInt(r.away, 10);
      const status = home !== null && away !== null && r.finished ? "finished" : "scheduled";
      const { error } = await supabase
        .from("matches")
        .update({ home_score: home, away_score: away, status })
        .eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminMatches"] });
      qc.invalidateQueries({ queryKey: ["matchesWithPredictions"] });
      toast({ title: "Placar salvo" });
    },
    onError: (e: any) => toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" }),
  });

  const grouped = useMemo(() => {
    if (!matches) return [] as { date: string; items: DbMatch[] }[];
    const map = new Map<string, DbMatch[]>();
    matches.forEach((m) => {
      const key = new Date(m.match_date).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [matches]);

  if (roleLoading || isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center gap-3">
            <ShieldAlert className="h-10 w-10 text-destructive" />
            <h2 className="text-lg font-semibold">Acesso restrito</h2>
            <p className="text-sm text-muted-foreground">Esta área é exclusiva para administradores.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Voltar</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const update = (id: string, patch: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin · Placares</h1>
          <p className="text-sm text-muted-foreground">
            Lance os placares finais das partidas. Marque "Finalizada" para liberar a pontuação dos palpites.
          </p>
        </div>

        {grouped.map((g) => (
          <Card key={g.date}>
            <CardHeader>
              <CardTitle className="text-base">{g.date}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {g.items.map((m) => {
                const r = rows[m.id] ?? { home: "", away: "", finished: false };
                const time = new Date(m.match_date).toLocaleTimeString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={m.id}
                    className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto_auto] gap-3 items-center border rounded-md p-3"
                  >
                    <span className="text-xs text-muted-foreground">{time}</span>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="flex-1 text-right">{m.home_team}</span>
                      <Input
                        type="number"
                        min={0}
                        className="w-14 text-center"
                        value={r.home}
                        onChange={(e) => update(m.id, { home: e.target.value })}
                      />
                      <span>×</span>
                      <Input
                        type="number"
                        min={0}
                        className="w-14 text-center"
                        value={r.away}
                        onChange={(e) => update(m.id, { away: e.target.value })}
                      />
                      <span className="flex-1">{m.away_team}</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={r.finished}
                        onChange={(e) => update(m.id, { finished: e.target.checked })}
                      />
                      Finalizada
                    </label>
                    <Button
                      size="sm"
                      onClick={() => saveMutation.mutate(m)}
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4" /> Salvar
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
