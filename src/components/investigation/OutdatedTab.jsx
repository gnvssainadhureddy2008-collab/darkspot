import { CalendarClock, FileWarning } from "lucide-react";
import { EmptyState, Panel, StatusBadge } from "@/components/common/Panels";

export default function OutdatedTab({ bundle }) {
  const { outdated } = bundle;

  if (!outdated.length) {
    return (
      <Panel>
        <EmptyState
          icon={FileWarning}
          title="No outdated facts flagged"
          body="Nothing in the evidence base appears to have passed its period of validity. Time-sensitive figures should still be re-checked before publication."
        />
      </Panel>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {outdated.map((item) => (
        <Panel key={item.id} className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs leading-relaxed text-foreground/90">{item.claim}</p>
            <StatusBadge status={item.status} />
          </div>

          {item.date_reference && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CalendarClock className="h-3 w-3" />
              {item.date_reference}
            </p>
          )}

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>

          {item.recommendation && (
            <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recommended</p>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/85">{item.recommendation}</p>
            </div>
          )}

          {item.source_title && (
            <p className="mt-auto pt-4 text-[10px] text-muted-foreground">Source: {item.source_title}</p>
          )}
        </Panel>
      ))}
    </div>
  );
}