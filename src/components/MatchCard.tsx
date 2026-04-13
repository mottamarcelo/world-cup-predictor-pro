import { useState } from "react";
import { MatchWithPrediction } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { ScoreBadge } from "./ScoreBadge";
import { MapPin, Calendar, Check } from "lucide-react";
import { toast } from "sonner";

interface MatchCardProps {
  match: MatchWithPrediction;
  editable?: boolean;
  hidePrediction?: boolean;
  onPredictionSave?: (matchId: string, homeScore: number, awayScore: number) => void;
}

export function MatchCard({ match, editable = false, hidePrediction = false, onPredictionSave }: MatchCardProps) {
  const canEdit = editable && match.status === "upcoming";

  const [homeInput, setHomeInput] = useState<string>(
    match.prediction?.homeScore !== null && match.prediction?.homeScore !== undefined
      ? String(match.prediction.homeScore)
      : ""
  );
  const [awayInput, setAwayInput] = useState<string>(
    match.prediction?.awayScore !== null && match.prediction?.awayScore !== undefined
      ? String(match.prediction.awayScore)
      : ""
  );
  const [saved, setSaved] = useState(false);

  const dateFormatted = new Date(match.date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  });

  const handleSave = () => {
    const h = parseInt(homeInput, 10);
    const a = parseInt(awayInput, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0 || h > 99 || a > 99) {
      toast.error("Insira placares válidos (0-99)");
      return;
    }
    onPredictionSave?.(match.id, h, a);
    setSaved(true);
    toast.success("Palpite salvo!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleScoreInput = (value: string, setter: (v: string) => void) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 2);
    setter(cleaned);
    setSaved(false);
  };

  return (
    <div className="match-card animate-fade-in">
      {/* Top: Date, time, status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{dateFormatted} · {match.time}</span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {/* Group */}
      {match.group && (
        <div className="text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">
          {match.group}
        </div>
      )}

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Home team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl">{match.homeTeam.flag}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{match.homeTeam.name}</p>
            <p className="text-[11px] text-muted-foreground">{match.homeTeam.code}</p>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xl font-bold tabular-nums w-7 text-center">
            {match.homeScore !== null ? match.homeScore : "-"}
          </span>
          <span className="text-muted-foreground text-sm">×</span>
          <span className="text-xl font-bold tabular-nums w-7 text-center">
            {match.awayScore !== null ? match.awayScore : "-"}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{match.awayTeam.name}</p>
            <p className="text-[11px] text-muted-foreground">{match.awayTeam.code}</p>
          </div>
          <span className="text-2xl">{match.awayTeam.flag}</span>
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{match.venue}</span>
      </div>

      {/* Divider + Prediction */}
      <div className="border-t border-border pt-3">
        {hidePrediction && match.status === "upcoming" ? (
          <p className="text-sm text-muted-foreground italic">Palpite oculto até o jogo finalizar</p>
        ) : canEdit ? (
          <div>
            <p className="text-[11px] text-muted-foreground mb-2">Seu palpite</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={homeInput}
                onChange={(e) => handleScoreInput(e.target.value, setHomeInput)}
                placeholder="-"
                className="w-10 h-9 text-center text-sm font-semibold rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring tabular-nums"
                aria-label={`Palpite ${match.homeTeam.name}`}
              />
              <span className="text-muted-foreground text-sm">×</span>
              <input
                type="text"
                inputMode="numeric"
                value={awayInput}
                onChange={(e) => handleScoreInput(e.target.value, setAwayInput)}
                placeholder="-"
                className="w-10 h-9 text-center text-sm font-semibold rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring tabular-nums"
                aria-label={`Palpite ${match.awayTeam.name}`}
              />
              <button
                onClick={handleSave}
                className={`ml-auto inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium transition-colors ${
                  saved
                    ? "bg-emerald-600 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                {saved ? "Salvo" : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">
                {hidePrediction ? "Palpite" : "Seu palpite"}
              </p>
              {match.prediction ? (
                <p className="text-sm font-semibold tabular-nums">
                  {match.prediction.homeScore} × {match.prediction.awayScore}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sem palpite</p>
              )}
            </div>
            <ScoreBadge scoreType={match.scoreType} points={match.points} />
          </div>
        )}
      </div>
    </div>
  );
}
