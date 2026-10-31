import { Link } from "@tanstack/react-router";
import { CircleDashed, FileStack, Lightbulb, Sparkles } from "lucide-react";
import { EmptyState, Panel, PanelTitle, StatusBadge } from "@/components/common/Panels";

export default function SummaryTab({ bundle }) {
  const { investigation, sources, recommendations, gaps } = bundle;
  const complete = investigation.status === "complete";
  const findings = investigation.key_findings || [];
  const observations = investigation.observations || [];

  if (!complete) {
    return (
      <Panel>
        <EmptyState
          icon={Sparkles}
          title={investigation.status === "failed" ? "The last analysis failed" : "No synthesis yet"}
          body={
            investigation.error_message ||
            "The sources have not been compared yet. Add evidence and run the analysis to build the dossier."
          }
          action={
            <Link
              to="/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
            >
              Start a new investigation
            </Link>
          }
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <Panel>
          <PanelTitle title="Executive summary" hint="What the evidence does and does not establish" />
          <p className="text-sm leading-relaxed text-foreground/90">{investigation.summary || "—"}</p>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Key findings</p>
              {findings.length ? (
                <ol className="mt-3 space-y-2.5">
                  {findings.map((finding, index) => (
                    <li key={finding} className="flex gap-2.5 text-xs leading-relaxed text-foreground/90">
                      <span className="mt-0.5 font-mono text-[10px] text-primary">{String(index + 1).padStart(2, "0")}</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">No findings were recorded.</p>
              )}
            </div>
            <div>
              <p className="eyebrow">Observations</p>
              {observations.length ? (
                <ul className="mt-3 space-y-2.5">
                  {observations.map((note) => (
                    <li key={note} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">No observations were recorded.</p>
              )}
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <PanelTitle
              title="Evidence base"
              hint={`${sources.length} sources in this dossier`}
              action={
                <Link to="/sources" className="text-[11px] text-muted-foreground hover:text-foreground">
                  All
                </Link>
              }
            />
            {sources.length ? (
              <ul className="space-y-2.5">
                {sources.slice(0, 6).map((source) => (
                  <li key={source.id} className="flex items-start gap-2.5">
                    <FileStack className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-foreground">{source.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {source.claim_count || 0} claims · {source.source_type}
                      </p>
                    </div>
                    <StatusBadge status={source.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No sources attached.</p>
            )}
          </Panel>

          {gaps.length > 0 && (
            <Panel>
              <PanelTitle title="Open gaps" hint="Highest severity first" />
              <ul className="space-y-2">
                {[...gaps]
                  .sort((a, b) => {
                    const order = { critical: 0, high: 1, medium: 2, low: 3 };
                    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
                  })
                  .slice(0, 3)
                  .map((gap) => (
                    <li key={gap.id} className="flex items-start gap-2 text-xs">
                      <CircleDashed className="mt-0.5 h-3 w-3 shrink-0 text-chart-3" />
                      <span className="text-muted-foreground">{gap.title}</span>
                    </li>
                  ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <Panel>
          <PanelTitle title="Recommended next actions" hint="From the analysis of your evidence base" />
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-chart-4" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.category} · {item.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium leading-snug text-foreground">{item.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}