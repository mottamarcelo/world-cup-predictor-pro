export function MatchCardSkeleton() {
  return (
    <div className="match-card animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-5 w-16 bg-muted rounded-full" />
      </div>
      <div className="h-3 w-12 bg-muted rounded mb-2" />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded-full" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="h-6 w-16 bg-muted rounded" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-full" />
        </div>
      </div>
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-5 w-28 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function LeagueCardSkeleton() {
  return (
    <div className="league-card animate-pulse">
      <div className="h-5 w-32 bg-muted rounded mb-3" />
      <div className="h-3 w-24 bg-muted rounded mb-4" />
      <div className="border-t border-border pt-3 flex gap-4">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-12 bg-muted rounded" />
      </div>
    </div>
  );
}
