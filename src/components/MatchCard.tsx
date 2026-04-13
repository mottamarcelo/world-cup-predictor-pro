import { useState } from "react";
import { MatchWithPrediction } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { ScoreBadge } from "./ScoreBadge";
import { TeamFlag } from "./TeamFlag";
import { MapPin, Clock, Check, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface MatchCardProps {
  match: MatchWithPrediction;
  editable?: boolean;
  hidePrediction?: boolean;
  onPredictionSave?: (matchId: string, homeScore: number, awayScore: number) => void;
}

export function MatchCard({ match, editable = false, hidePrediction = false, onPredictionSave }: MatchCardProps) {
  const canEdit = editable && match.status === "upcoming";

  const [homeInput, setHomeInput] = useState<number | null>(
    match.prediction?.homeScore !== null && match.prediction?.homeScore !== undefined
      ? match.prediction.homeScore
      : null
  );
  const [awayInput, setAwayInput] = useState<number | null>(
    match.prediction?.awayScore !== null && match.prediction?.awayScore !== undefined
      ? match.prediction.awayScore
      : null
  );
  const [saved, setSaved] = useState(false);

  const isUpcoming = match.status === "upcoming";

  const handleSave = () => {
    if (homeInput === null || awayInput === null || homeInput < 0 || awayInput < 0) {
      toast.error("Insira placares válidos");
      return;
    }
    onPredictionSave?.(match.id, homeInput, awayInput);
    setSaved(true);
    toast.success("Palpite salvo!");
    setTimeout(() => setSaved(false), 2000);
  };

  const increment = (current: number | null, setter: (v: number | null) => void) => {
    setter(Math.min((current ?? -1) + 1, 99));
    setSaved(false);
  };

  const decrement = (current: number | null, setter: (v: number | null) => void) => {
    if (current === null || current <= 0) return;
    setter(current - 1);
    setSaved(false);
  };

  const ScoreInput = ({ value, onChange, label }: { value: number | null; onChange: (v: number | null) => void; label: string }) => (
    <div className="flex items-center gap-0.5">
      <span className="w-8 h-8 flex items-center justify-center text-base font-bold tabular-nums rounded-md border border-input bg-background">
        {value !== null ? value : "-"}
      </span>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => increment(value, onChange)}
          className="w-5 h-4 flex items-center justify-center rounded-sm text-muted-foreground hover:bg-muted transition-colors"
          aria-label={`Aumentar ${label}`}
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => decrement(value, onChange)}
          className="w-5 h-4 flex items-center justify-center rounded-sm text-muted-foreground hover:bg-muted transition-colors"
          aria-label={`Diminuir ${label}`}
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  const renderCenterPrediction = () => {
    if (hidePrediction && isUpcoming) {
      return <p className="text-[11px] text-muted-foreground italic text-center">Oculto</p>;
    }

    if (canEdit) {
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <ScoreInput value={homeInput} onChange={setHomeInput} label={match.homeTeam.name} />
            <span className="text-muted-foreground text-xs font-medium mt-0.5">×</span>
            <ScoreInput value={awayInput} onChange={setAwayInput} label={match.awayTeam.name} />
          </div>
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1 px-2.5 h-6 rounded text-[11px] font-medium transition-colors ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Check className="h-3 w-3" />
            {saved ? "Salvo" : "Salvar"}
          </button>
        </div>
      );
    }

    if (match.prediction) {
      return (
        <p className="text-sm font-semibold tabular-nums text-center">
          {match.prediction.homeScore} × {match.prediction.awayScore}
        </p>
      );
    }
    return <p className="text-[11px] text-muted-foreground italic text-center">Sem palpite</p>;
  };

  return (
    <div className="match-card animate-fade-in">
      {/* Top: time, group, status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {match.time}
          </span>
          {match.group && (
            <span className="font-medium uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-muted">
              {match.group}
            </span>
          )}
        </div>
        <StatusBadge status={match.status} />
      </div>

      {/* Teams & Score/Prediction */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Home team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamFlag code={match.homeTeam.code} name={match.homeTeam.name} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{match.homeTeam.name}</p>
            <p className="text-[11px] text-muted-foreground">{match.homeTeam.code}</p>
          </div>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center shrink-0 gap-0.5">
          {isUpcoming ? (
            <>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Seu palpite</p>
              {renderCenterPrediction()}
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tabular-nums w-7 text-center">
                  {match.homeScore ?? "-"}
                </span>
                <span className="text-muted-foreground text-sm">×</span>
                <span className="text-xl font-bold tabular-nums w-7 text-center">
                  {match.awayScore ?? "-"}
                </span>
              </div>
              <div className="flex flex-col items-center mt-1">
                <p className="text-[10px] text-muted-foreground">{hidePrediction ? "Palpite" : "Seu palpite"}</p>
                {hidePrediction ? (
                  <p className="text-xs font-semibold tabular-nums">
                    {match.prediction ? `${match.prediction.homeScore} × ${match.prediction.awayScore}` : "—"}
                  </p>
                ) : match.prediction ? (
                  <p className="text-xs font-semibold tabular-nums">
                    {match.prediction.homeScore} × {match.prediction.awayScore}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">Sem palpite</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{match.awayTeam.name}</p>
            <p className="text-[11px] text-muted-foreground">{match.awayTeam.code}</p>
          </div>
          <TeamFlag code={match.awayTeam.code} name={match.awayTeam.name} />
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{match.venue}</span>
      </div>

      {/* Score badge for finished matches */}
      {match.status === "finished" && (
        <div className="border-t border-border pt-2 mt-2 flex justify-end">
          <ScoreBadge scoreType={match.scoreType} points={match.points} />
        </div>
      )}
    </div>
  );
}
