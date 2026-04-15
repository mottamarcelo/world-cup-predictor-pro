import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { name: string; email: string; avatarInitials: string };
  onSave: (data: { name: string; avatarUrl?: string }) => void;
}

export function UserProfileDialog({ open, onOpenChange, user, onSave }: UserProfileDialogProps) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
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
    }

    onSave({ name: name.trim(), avatarUrl: avatarPreview ?? undefined });
    toast.success("Perfil atualizado com sucesso!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative group"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
            <p className="text-xs text-muted-foreground">Clique para alterar a foto</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nome</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={user.email} disabled className="opacity-60" />
          </div>

          {/* Password change */}
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Alterar Senha</p>

            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Senha atual</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••"
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
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Salvar alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
