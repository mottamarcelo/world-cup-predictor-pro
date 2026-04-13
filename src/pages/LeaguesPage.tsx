import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { LeagueCard } from "@/components/LeagueCard";
import { leagues } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function LeaguesPage() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (!code.trim()) {
      toast.error("Digite um código de convite");
      return;
    }
    // Mock: simulate joining
    toast.success("Solicitação enviada! Aguarde a aprovação do administrador.");
    setCode("");
    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Minhas Ligas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              Entrar em liga
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Entrar em uma liga</DialogTitle>
              <DialogDescription>
                Insira o código de convite compartilhado pelo administrador da liga.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <Input
                placeholder="Ex: ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={10}
                className="text-center tracking-widest text-lg font-semibold uppercase"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleJoin}>Entrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
