import { ArrowLeftRight, ArrowRight, TriangleAlert } from "lucide-react";
import { EmptyState, Panel, SeverityBadge } from "@/components/common/Panels";

export default function ContradictionsTab({ bundle }) {
  const { contradictions } = bundle;

  if (!contradictions.length) {
    return (
      <Panel>
        <EmptyState
          icon={TriangleAlert}
          title="No contradictions detected"
          body="Either the sources agree on every overlapping fact, or there is not enough overlap yet. Add a second source on the same question to test agreement."
        />
      </Panel>
    );
  }

  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...contradictions].sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));

  return (
    <div className="space-y-4">
      {sorted.map((item) => (
        <Panel key={item.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-chart-5" />
              <h3 className="font-heading text-sm font-medium tracking-tight">{item.topic}</h3>
            </div>
            <SeverityBadge severity={item.severity} />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              { label: "Position A", claim: item.claim_a, source: item.source_a_title },
              { label: "Position B", claim: item.claim_b, source: item.source_b_title },
            ].map((side) => (
              <div key={side.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-chart-5">{side.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-foreground/90">{side.claim || "—"}</p>
                {side.source && (
                  <p className="mt-2.5 truncate text-[10px] text-muted-foreground">Source: {side.source}</p>
                )}
              </div>
            ))}
          </div>

          {item.explanation && (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{item.explanation}</p>
          )}

          {item.next_steps && (
            <div className="mt-3 flex gap-2 rounded-xl border border-primary/15 bg-primary/[0.06] p-3">
              <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-foreground/85">{item.next_steps}</p>
            </div>
          )}
        </Panel>
      ))}
    </div>
  );
}