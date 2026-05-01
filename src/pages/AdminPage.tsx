import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Pencil, Plus, Save, ShieldAlert, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

const STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "group", label: "Fase de Grupos" },
  { value: "round_of_32", label: "16-avos de Final" },
  { value: "round_of_16", label: "Oitavas de Final" },
  { value: "quarter_finals", label: "Quartas de Final" },
  { value: "semi_finals", label: "Semifinal" },
  { value: "third_place", label: "Disputa de 3º Lugar" },
  { value: "final", label: "Final" },
];

const GROUP_OPTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

interface NewMatchForm {
  match_date: string; // datetime-local
  home_team: string;
  away_team: string;
  group_name: string;
  stage: string;
  venue: string;
}

const emptyForm: NewMatchForm = {
  match_date: "",
  home_team: "",
  away_team: "",
  group_name: "",
  stage: "group",
  venue: "",
};

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewMatchForm>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: DbMatch) => {
    const d = new Date(m.match_date);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setEditingId(m.id);
    setForm({
      match_date: local,
      home_team: m.home_team,
      away_team: m.away_team,
      group_name: m.group_name ?? "",
      stage: m.stage ?? "group",
      venue: m.venue ?? "",
    });
    setDialogOpen(true);
  };

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
    onError: (e: Error) =>
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: NewMatchForm) => {
      if (!data.match_date || !data.home_team.trim() || !data.away_team.trim()) {
        throw new Error("Preencha data, time mandante e time visitante.");
      }
      const isoDate = new Date(data.match_date).toISOString();
      const payload = {
        match_date: isoDate,
        home_team: data.home_team.trim(),
        away_team: data.away_team.trim(),
        home_code: data.home_team.trim(),
        away_code: data.away_team.trim(),
        group_name: data.stage === "group" ? (data.group_name || null) : null,
        stage: data.stage,
        venue: data.venue.trim() || null,
        status: "scheduled",
      };
      const { error } = await supabase.from("matches").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminMatches"] });
      qc.invalidateQueries({ queryKey: ["matchesWithPredictions"] });
      toast({ title: "Partida adicionada" });
      setCreateOpen(false);
      setForm(emptyForm);
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao adicionar", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase.from("matches").delete().eq("id", matchId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminMatches"] });
      qc.invalidateQueries({ queryKey: ["matchesWithPredictions"] });
      toast({ title: "Partida removida" });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });

  const grouped = useMemo(() => {
    if (!matches) return [] as { date: string; items: DbMatch[] }[];
    const map = new Map<string, DbMatch[]>();
    matches.forEach((m) => {
      const key = new Date(m.match_date).toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      });
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
            <p className="text-sm text-muted-foreground">
              Esta área é exclusiva para administradores.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar
            </Button>
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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Admin · Placares</h1>
            <p className="text-sm text-muted-foreground">
              Lance os placares finais das partidas. Marque "Finalizada" para liberar a pontuação dos
              palpites.
            </p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Nova partida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar partida</DialogTitle>
                <DialogDescription>
                  Preencha os dados da partida. A data/hora deve ser informada no horário local do
                  navegador.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="match_date">Data e hora</Label>
                  <Input
                    id="match_date"
                    type="datetime-local"
                    value={form.match_date}
                    onChange={(e) => setForm({ ...form, match_date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="home_team">Time mandante</Label>
                    <Input
                      id="home_team"
                      value={form.home_team}
                      onChange={(e) => setForm({ ...form, home_team: e.target.value })}
                      placeholder="Ex: Brasil"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="away_team">Time visitante</Label>
                    <Input
                      id="away_team"
                      value={form.away_team}
                      onChange={(e) => setForm({ ...form, away_team: e.target.value })}
                      placeholder="Ex: Argentina"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="stage">Fase</Label>
                    <Select
                      value={form.stage}
                      onValueChange={(v) => setForm({ ...form, stage: v })}
                    >
                      <SelectTrigger id="stage">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="group_name">Grupo</Label>
                    <Select
                      value={form.group_name}
                      onValueChange={(v) => setForm({ ...form, group_name: v })}
                      disabled={form.stage !== "group"}
                    >
                      <SelectTrigger id="group_name">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {GROUP_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            Grupo {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="venue">Estádio / Local</Label>
                  <Input
                    id="venue"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="Ex: MetLife Stadium, Nova York/Nova Jersey"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto_auto_auto] gap-3 items-center border rounded-md p-3"
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" aria-label="Remover partida">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover partida?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação removerá permanentemente a partida{" "}
                            <strong>
                              {m.home_team} × {m.away_team}
                            </strong>{" "}
                            e todos os palpites associados. Não é possível desfazer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(m.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
