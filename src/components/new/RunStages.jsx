import { Check, CircleDashed, Loader2, TriangleAlert } from "lucide-react";

export const STAGES = [
  { key: "create", label: "Creating dossier", detail: "Research question registered" },
  { key: "collect", label: "Collecting sources", detail: "Fetching and extracting readable text" },
  { key: "extract", label: "Extracting claims", detail: "Mining each source for material statements" },
  { key: "synthesise", label: "Comparing sources", detail: "Cross-referencing claims for conflict and coverage" },
  { key: "finalise", label: "Writing dossier", detail: "Recording gaps, contradictions and next steps" },
];

export default function RunStages({ stageIndex, percent, sources, sourceStates }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-glow rounded-full bg-primary/20 blur-2xl" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </span>
        </div>
        <p className="eyebrow">Analysis in progress</p>
        <h2 className="mt-2 font-heading text-xl font-medium tracking-tight">
          {STAGES[Math.min(stageIndex, STAGES.length - 1)].label}
        </h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {STAGES[Math.min(stageIndex, STAGES.length - 1)].detail}
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Progress</span>
          <span className="font-mono">{Math.round(percent)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-chart-3 to-chart-2 transition-[width] duration-700 ease-out"
            style={{ width: `${Math.max(3, percent)}%` }}
          />
        </div>
      </div>

      <ol className="space-y-3">
        {STAGES.map((stage, index) => {
          const done = index < stageIndex;
          const active = index === stageIndex;
          return (
            <li key={stage.key} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  done
                    ? "border-chart-4/40 bg-chart-4/10 text-chart-4"
                    : active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground"
                }`}
              >
                {done ? (
                  <Check className="h-3 w-3" />
                ) : active ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CircleDashed className="h-3 w-3" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs ${active ? "text-foreground" : done ? "text-foreground/70" : "text-muted-foreground"}`}>
                  {stage.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {sources.length > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
          <p className="eyebrow mb-2">Sources</p>
          <ul className="space-y-1.5">
            {sources.map((source) => {
              const state = sourceStates[source.id] || "pending";
              return (
                <li key={source.id} className="flex items-center gap-2 text-[11px]">
                  {state === "failed" ? (
                    <TriangleAlert className="h-3 w-3 shrink-0 text-destructive" />
                  ) : state === "analyzed" ? (
                    <Check className="h-3 w-3 shrink-0 text-chart-4" />
                  ) : state === "pending" ? (
                    <CircleDashed className="h-3 w-3 shrink-0 text-muted-foreground" />
                  ) : (
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{source.title}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70">
                    {state}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}