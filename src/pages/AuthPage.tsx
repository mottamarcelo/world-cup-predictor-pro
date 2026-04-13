import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
      {/* Branding */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className="h-8 w-8 text-accent" />
          <h1 className="text-2xl font-bold text-navy-foreground">
            Bolão Copa 2026
          </h1>
        </div>
        <p className="text-sm text-navy-foreground/60">
          Faça seus palpites e dispute com seus amigos
        </p>
        <div className="mt-4 text-4xl">⚽🏆</div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-xl">
        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Seu nome" className="pl-10" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder="E-mail" className="pl-10" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="Senha" className="pl-10" />
          </div>

          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-xs text-primary hover:underline">
                Esqueci minha senha
              </button>
            </div>
          )}

          <Button type="submit" className="w-full">
            {isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
