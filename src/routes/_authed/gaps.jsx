import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CircleDashed } from "lucide-react";
import { listAllGaps } from "@/lib/investigations-api";
import { EmptyState, Panel, SeverityBadge } from "@/components/common/Panels";

export const Route = createFileRoute("/_authed/gaps")({
  loader: () => listAllGaps(),
  head: () => ({ meta: [{ title: "Information gaps — DARKSPOT" }] }),
  component: GapsPage,
});

const SEVERITIES = ["all", "critical", "high", "medium", "low"];

function GapsPage() {
  const gaps = Route.useLoaderData();
  const [severity, setSeverity] = useState("all");

  const filtered = gaps.filter((gap) => severity === "all" || gap.severity === severity);
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...filtered].sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Gap register</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Information gaps</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every question your evidence base leaves open, across {new Set(gaps.map((g) => g.investigation_id)).size}{" "}
          investigation(s).
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
              {key === "all" ? gaps.length : gaps.filter((gap) => gap.severity === key).length}
            </span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CircleDashed}
          title={gaps.length ? "No gaps at that severity" : "No gaps recorded yet"}
          body={
            gaps.length
              ? "Try another severity filter."
              : "Gaps appear once an investigation has finished comparing its sources."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((gap) => (
            <Panel key={gap.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-sm font-medium leading-snug tracking-tight">{gap.title}</h2>
                <SeverityBadge severity={gap.severity} />
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{gap.description}</p>
              {gap.why_important && (
                <p className="mt-3 text-xs leading-relaxed text-foreground/80">{gap.why_important}</p>
              )}
              <Link
                to="/investigations/$investigationId/gaps"
                params={{ investigationId: gap.investigation_id }}
                className="mt-auto flex items-center gap-1.5 pt-4 text-[11px] text-primary/90 transition-colors hover:text-primary"
              >
                {gap.investigation_title}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}