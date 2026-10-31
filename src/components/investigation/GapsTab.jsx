import { ArrowRight, CircleDashed } from "lucide-react";
import { EmptyState, Panel, SeverityBadge } from "@/components/common/Panels";

export default function GapsTab({ bundle }) {
  const { gaps, sources } = bundle;
  const titles = new Map(sources.map((source) => [source.id, source.title]));

  if (!gaps.length) {
    return (
      <Panel>
        <EmptyState
          icon={CircleDashed}
          title="No information gaps recorded"
          body="Either the evidence base answers every part of the question, or the analysis has not run yet. Re-run the analysis after adding sources."
        />
      </Panel>
    );
  }

  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...gaps].sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sorted.map((gap) => {
        const related = (gap.related_source_ids || []).map((id) => titles.get(id)).filter(Boolean);
        return (
          <Panel key={gap.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-sm font-medium leading-snug tracking-tight">{gap.title}</h3>
              <SeverityBadge severity={gap.severity} />
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{gap.description}</p>

            {gap.why_important && (
              <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Why it matters</p>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/85">{gap.why_important}</p>
              </div>
            )}

            {gap.next_steps && (
              <div className="mt-3 flex gap-2">
                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-foreground/80">{gap.next_steps}</p>
              </div>
            )}

            {related.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {related.map((title) => (
                  <span
                    key={title}
                    className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {title}
                  </span>
                ))}
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}