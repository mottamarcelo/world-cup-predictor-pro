import { ScoreType } from "@/types";
import { cn } from "@/lib/utils";
import { Trophy, Target, X } from "lucide-react";

interface ScoreBadgeProps {
  scoreType: ScoreType;
  points: number;
  size?: "sm" | "md";
}

const config: Record<ScoreType, { label: string; className: string; icon: typeof Trophy }> = {
  exact: { label: "Acertou em cheio", className: "score-badge-exact", icon: Trophy },
  winner: { label: "Acertou vencedor", className: "score-badge-winner", icon: Target },
  none: { label: "Não pontuou", className: "score-badge-none", icon: X },
  pending: { label: "Aguardando jogo", className: "score-badge-none", icon: Target },
};

export function ScoreBadge({ scoreType, points, size = "sm" }: ScoreBadgeProps) {
  const c = config[scoreType];
  const Icon = c.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        c.className,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {scoreType === "pending" ? c.label : `${points} pts — ${c.label}`}
    </span>
  );
}
