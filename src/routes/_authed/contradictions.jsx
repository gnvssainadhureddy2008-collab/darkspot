import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { listAllContradictions } from "@/lib/investigations-api";
import { EmptyState, Panel, SeverityBadge } from "@/components/common/Panels";

export const Route = createFileRoute("/_authed/contradictions")({
  loader: () => listAllContradictions(),
  head: () => ({ meta: [{ title: "Contradictions — DARKSPOT" }] }),
  component: ContradictionsPage,
});

const SEVERITIES = ["all", "critical", "high", "medium", "low"];

function ContradictionsPage() {
  const contradictions = Route.useLoaderData();
  const [severity, setSeverity] = useState("all");

  const filtered = contradictions.filter((item) => severity === "all" || item.severity === severity);
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...filtered].sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Conflict register</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Contradictions</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Places where two sources disagree on the same fact — quoted side by side, no verdict invented.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SEVERITIES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSeverity(key)}
            className={`rounded-full border px-3 py-1.5 text-[11px] capitalize transition-colors ${
              severity === key
                ? "border-primary/35 bg-primary/12 text-foreground"
                : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"
            }`}
          >
            {key}
            <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
              {key === "all" ? contradictions.length : contradictions.filter((item) => item.severity === key).length}
            </span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={contradictions.length ? "No conflicts at that severity" : "No contradictions detected"}
          body={
            contradictions.length
              ? "Try another severity filter."
              : "Conflicts appear when two analysed sources state incompatible facts about the same topic."
          }
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((item) => (
            <Panel key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-chart-5" />
                  <h2 className="font-heading text-sm font-medium tracking-tight">{item.topic}</h2>
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

              <Link
                to="/investigations/$investigationId/contradictions"
                params={{ investigationId: item.investigation_id }}
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-primary/90 transition-colors hover:text-primary"
              >
                {item.investigation_title}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}