import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { RankingTable } from "@/components/RankingTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { List, Loader2, Users, Trophy, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  useMyLeagues,
  useLeagueDetail,
  useAllLeagues,
  useRequestJoinLeague,
  usePendingRequests,
  useDecideRequest,
} from "@/hooks/useLeagues";
import { useAuth } from "@/hooks/useAuth";

export default function LeaguesPage() {
  const { user } = useAuth();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: leagues = [], isLoading } = useMyLeagues();
  const { data: allLeagues = [], isLoading: allLoading } = useAllLeagues();
  const requestJoin = useRequestJoinLeague();

  useEffect(() => {
    if (!selectedId && leagues.length > 0) setSelectedId(leagues[0].id);
    if (selectedId && leagues.length > 0 && !leagues.find((l) => l.id === selectedId)) {
      setSelectedId(leagues[0].id);
    }
  }, [leagues, selectedId]);

  const { data: detail, isLoading: detailLoading } = useLeagueDetail(selectedId ?? undefined);
  const isOwner = !!detail && detail.league.owner_id === user?.id;
  const { data: pendingReqs = [] } = usePendingRequests(isOwner ? detail!.league.id : undefined);
  const decide = useDecideRequest();

  const handleRequest = async (leagueId: string, name: string) => {
    try {
      await requestJoin.mutateAsync(leagueId);
      toast.success(`Solicitação enviada para "${name}"`);
    } catch (e) {
      toast.error("Não foi possível solicitar", { description: (e as Error).message });
    }
  };

  const handleDecide = async (requestId: string, approve: boolean) => {
    try {
      await decide.mutateAsync({ requestId, approve });
      toast.success(approve ? "Solicitação aprovada" : "Solicitação rejeitada");
    } catch (e) {
      toast.error("Não foi possível concluir", { description: (e as Error).message });
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold">Minhas Ligas</h1>
        <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><List className="h-4 w-4" />Visualizar Ligas</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ligas disponíveis</DialogTitle>
              <DialogDescription>Solicite acesso a uma liga. O administrador da liga aprovará sua entrada.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto">
              {allLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : allLeagues.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Nenhuma liga cadastrada</p>
              ) : (
                allLeagues.map((lg) => (
                  <div key={lg.id} className="flex items-center justify-between gap-3 p-3 rounded-md border border-border">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{lg.name}</div>
                      {lg.description && (
                        <div className="text-xs text-muted-foreground truncate">{lg.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Users className="h-3 w-3" />{lg.participantCount} participantes
                      </div>
                    </div>
                    <div className="shrink-0">
                      {lg.membershipStatus === "member" ? (
                        <Badge variant="secondary">Você participa</Badge>
                      ) : lg.membershipStatus === "pending" ? (
                        <Badge variant="outline">Solicitação enviada</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRequest(lg.id, lg.name)}
                          disabled={requestJoin.isPending}
                        >
                          {requestJoin.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                          Solicitar acesso
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : leagues.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Você ainda não participa de nenhuma liga</p>
          <p className="text-sm mt-1">Clique em "Visualizar Ligas" para solicitar acesso</p>
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
                </div>
              </div>

              {isOwner && pendingReqs.length > 0 && (
                <div className="mb-4 rounded-lg border border-border p-3 bg-card">
                  <h3 className="text-sm font-semibold mb-2">Solicitações pendentes ({pendingReqs.length})</h3>
                  <div className="space-y-2">
                    {pendingReqs.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40">
                        <span className="text-sm font-medium truncate">{r.userName}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => handleDecide(r.id, true)} disabled={decide.isPending}>
                            <Check className="h-3.5 w-3.5 mr-1" />Aprovar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDecide(r.id, false)} disabled={decide.isPending}>
                            <X className="h-3.5 w-3.5 mr-1" />Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
