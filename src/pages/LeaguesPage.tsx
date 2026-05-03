import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { RankingTable } from "@/components/RankingTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Plus, Loader2, Users, Trophy, Copy } from "lucide-react";
import { toast } from "sonner";
import { useMyLeagues, useJoinLeague, useCreateLeague, useLeagueDetail } from "@/hooks/useLeagues";
import { useAuth } from "@/hooks/useAuth";

export default function LeaguesPage() {
  const { user } = useAuth();
  const [joinOpen, setJoinOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: leagues = [], isLoading } = useMyLeagues();
  const joinLeague = useJoinLeague();
  const createLeague = useCreateLeague();

  useEffect(() => {
    if (!selectedId && leagues.length > 0) setSelectedId(leagues[0].id);
    if (selectedId && leagues.length > 0 && !leagues.find((l) => l.id === selectedId)) {
      setSelectedId(leagues[0].id);
    }
  }, [leagues, selectedId]);

  const { data: detail, isLoading: detailLoading } = useLeagueDetail(selectedId ?? undefined);

  const handleJoin = async () => {
    if (!code.trim()) return toast.error("Digite um código de convite");
    try {
      const lg = await joinLeague.mutateAsync(code);
      toast.success(`Você entrou em "${lg.name}"!`);
      setCode(""); setJoinOpen(false);
    } catch (e) {
      toast.error("Não foi possível entrar", { description: (e as Error).message });
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Dê um nome à liga");
    try {
      const lg = await createLeague.mutateAsync({ name, description });
      toast.success(`Liga criada! Código: ${lg.invite_code}`);
      setName(""); setDescription(""); setCreateOpen(false);
    } catch (e) {
      toast.error("Não foi possível criar a liga", { description: (e as Error).message });
    }
  };

  const copyInvite = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    toast.success(`Código ${codeStr} copiado!`);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold">Minhas Ligas</h1>
        <div className="flex gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Criar liga</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar nova liga</DialogTitle>
                <DialogDescription>Convide amigos compartilhando o código gerado.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="lg-name">Nome da liga</Label>
                  <Input id="lg-name" placeholder="Ex: Bolão dos Amigos" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lg-desc">Descrição (opcional)</Label>
                  <Input id="lg-desc" placeholder="Quem entra, joga" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={140} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={createLeague.isPending}>
                  {createLeague.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><UserPlus className="h-4 w-4" />Entrar em liga</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Entrar em uma liga</DialogTitle>
                <DialogDescription>Insira o código de convite compartilhado pelo administrador.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-2">
                <Input placeholder="Ex: ABC123" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={10} className="text-center tracking-widest text-lg font-semibold uppercase" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setJoinOpen(false)}>Cancelar</Button>
                <Button onClick={handleJoin} disabled={joinLeague.isPending}>
                  {joinLeague.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Entrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : leagues.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nenhuma liga encontrada</p>
          <p className="text-sm mt-1">Crie uma liga ou entre em uma existente usando o código de convite</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leagues.length > 1 && (
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground shrink-0">Liga:</Label>
              <Select value={selectedId ?? undefined} onValueChange={setSelectedId}>
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Selecione uma liga" />
                </SelectTrigger>
                <SelectContent>
                  {leagues.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {detail && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{detail.league.name}</h2>
                {detail.league.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{detail.league.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />{detail.participants.length} participantes
                  </span>
                  {(() => {
                    const myPos = detail.participants.find((p) => p.userId === user?.id)?.position ?? 0;
                    return myPos > 0 ? (
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-primary" />Sua posição: {myPos}º
                      </span>
                    ) : null;
                  })()}
                  <button
                    onClick={() => copyInvite(detail.league.invite_code)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    title="Copiar código de convite"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="font-mono tracking-wider">{detail.league.invite_code}</span>
                  </button>
                </div>
              </div>
              <RankingTable
                participants={detail.participants}
                currentUserId={user?.id ?? ""}
                leagueId={detail.league.id}
              />
            </div>
          )}

          {detailLoading && !detail && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
