import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Mail, Lock, Loader2, User, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PASSWORD_RULES = [
  { id: "len", label: "Pelo menos 8 caracteres", test: (p: string) => p.length >= 8 },
  { id: "lower", label: "Uma letra minúscula (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "Uma letra maiúscula (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "digit", label: "Um número (0-9)", test: (p: string) => /\d/.test(p) },
  { id: "symbol", label: "Um caractere especial (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("password should contain") || m.includes("weak password") || m.includes("password should be")) {
    return "Senha fraca. Atenda a todos os requisitos listados abaixo do campo de senha.";
  }
  if (m.includes("password") && m.includes("at least") && m.includes("character")) {
    return "A senha não atende ao tamanho mínimo exigido.";
  }
  if (m.includes("registered") || m.includes("already")) {
    return "Este email já está cadastrado. Faça login.";
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "E-mail inválido.";
  }
  if (m.includes("invalid")) {
    return "Email ou senha inválidos.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  }
  return message;
}
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona se já estiver logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail || !password) {
      toast({ title: "Preencha email e senha", variant: "destructive" });
      return;
    }
    if (!isLogin && (trimmedName.length < 2 || trimmedName.length > 60)) {
      toast({ title: "Informe um nome entre 2 e 60 caracteres", variant: "destructive" });
      return;
    }
    if (!isLogin) {
      const failed = PASSWORD_RULES.filter((r) => !r.test(password));
      if (failed.length > 0) {
        toast({
          title: "Senha não atende aos requisitos",
          description: failed.map((r) => `• ${r.label}`).join("\n"),
          variant: "destructive",
        });
        return;
      }
    } else if (password.length < 6) {
      toast({ title: "A senha deve ter ao menos 6 caracteres", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) {
          const msg = error.message.toLowerCase().includes("invalid")
            ? "Email ou senha inválidos"
            : error.message;
          toast({ title: "Erro ao entrar", description: msg, variant: "destructive" });
          return;
        }
        toast({ title: "Bem-vindo de volta!" });
      } else {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name: trimmedName },
          },
        });
        if (error) {
          const msg = error.message.toLowerCase().includes("registered")
            ? "Este email já está cadastrado. Faça login."
            : error.message;
          toast({ title: "Erro ao criar conta", description: msg, variant: "destructive" });
          return;
        }
        toast({ title: "Conta criada com sucesso!", description: "Você já pode entrar." });
        setIsLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
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

      <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-xl">
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
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
              <Input
                type="text"
                placeholder="Nome (exibido na pontuação)"
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={60}
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="E-mail"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
