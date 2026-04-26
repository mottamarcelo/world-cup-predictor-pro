import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && profile) setName(profile.name);
  }, [open, profile]);

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }
    setSaving(true);
    try {
      if (profile && name.trim() !== profile.name) {
        await updateProfile.mutateAsync({ name: name.trim() });
      }

      if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
          toast.error("Informe a senha atual");
          return;
        }
        if (newPassword.length < 6) {
          toast.error("A nova senha deve ter pelo menos 6 caracteres");
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error("As senhas não coincidem");
          return;
        }
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: user?.email ?? "",
          password: currentPassword,
        });
        if (signInErr) {
          toast.error("Senha atual incorreta");
          return;
        }
        const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
        if (pwErr) {
          toast.error("Erro ao atualizar senha", { description: pwErr.message });
          return;
        }
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      toast.success("Perfil atualizado!");
      onOpenChange(false);
    } catch (e) {
      toast.error("Erro ao salvar", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
              {initials}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nome</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={profile?.email ?? user?.email ?? ""} disabled className="opacity-60" />
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Alterar Senha (opcional)</p>

            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Senha atual</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-pw">Nova senha</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Confirmar nova senha</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
