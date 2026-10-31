import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { getDashboard } from "@/lib/investigations-api";
import { useAuth } from "@/lib/AuthContext";
import OverviewStats from "@/components/dashboard/OverviewStats";
import ActivityChart from "@/components/dashboard/ActivityChart";
import RecentInvestigations from "@/components/dashboard/RecentInvestigations";
import { CompletenessPanel, GapSeverityPanel, ReliabilityPanel } from "@/components/dashboard/OverviewCharts";
import { Panel } from "@/components/common/Panels";

export const Route = createFileRoute("/_authed/dashboard")({
  loader: () => getDashboard(),
  head: () => ({ meta: [{ title: "Overview — DARKSPOT" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const data = Route.useLoaderData();
  const { user } = useAuth();
  const firstName = (user?.full_name || "").split(" ")[0];
  const isEmpty = data.stats.investigations === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Research intelligence</p>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-[28px]">
            {firstName ? `${firstName}'s workspace` : "Workspace overview"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isEmpty
              ? "Add sources to an investigation and DARKSPOT will map what your evidence base is missing."
              : `${data.stats.investigations} investigations · ${data.stats.analyzedSources} sources analysed · ${data.stats.contradictions} contradictions on record`}
          </p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_16px_50px_-20px_hsl(250_100%_70%)] transition-transform hover:scale-[1.02]"
        >
          <Sparkles className="h-4 w-4" />
          New investigation
        </Link>
      </div>

      <OverviewStats stats={data.stats} />

      {isEmpty ? (
        <Panel className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(250_100%_70%_/_0.12),transparent_60%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">Start here</p>
              <h2 className="mt-3 font-heading text-xl font-medium tracking-tight">
                An investigation turns a question plus sources into a defensible dossier.
              </h2>
              <ol className="mt-5 space-y-3 text-sm text-muted-foreground">
                {[
                  "State the research question you need answered.",
                  "Add the sources you already trust — URLs, PDFs or notes.",
                  "Let the engine extract claims, then compare them across sources.",
                  "Read the gaps, contradictions and stale facts it surfaces.",
                ].map((line, index) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-[10px] text-primary">
                      {index + 1}
                    </span>
                    {line}
                  </li>
                ))}
              </ol>
              <Link
                to="/new"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/20"
              >
                Create the first investigation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="eyebrow">What it reports</p>
              <ul className="mt-4 space-y-4">
                {[
                  ["Information gaps", "Sub-questions no source addresses."],
                  ["Contradictions", "Two sources disagreeing on the same fact."],
                  ["Outdated facts", "Claims whose reference date has passed."],
                  ["Unsupported claims", "Assertions arriving without evidence."],
                ].map(([title, body]) => (
                  <li key={title}>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.28fr_0.72fr]">
            <ActivityChart data={data.activity} />
            <RecentInvestigations items={data.recent} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CompletenessPanel data={data.completeness} />
            <ReliabilityPanel data={data.reliability} />
            <GapSeverityPanel data={data.gapSeverity} />
          </div>
        </>
      )}
    </div>
  );
}