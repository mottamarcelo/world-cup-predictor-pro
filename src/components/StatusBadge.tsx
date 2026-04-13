import { MatchStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: MatchStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "finished"
          ? "bg-muted text-muted-foreground"
          : "bg-primary/10 text-primary font-semibold"
      )}
    >
      {status === "finished" ? "Finalizada" : "Em breve"}
    </span>
  );
}
