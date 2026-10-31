import { useMemo, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, FileStack, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listSources } from "@/lib/investigations-api";
import { analyzeSource, collectSource, deleteSource, synthesize } from "@/lib/analysis-api";
import { EmptyState, Panel, StatusBadge } from "@/components/common/Panels";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authed/sources")({
  loader: () => listSources(),
  head: () => ({ meta: [{ title: "Sources — DARKSPOT" }] }),
  component: SourcesPage,
});

const STATUSES = ["all", "analyzed", "collected", "pending", "failed"];

function SourcesPage() {
  const { sources, investigations } = Route.useLoaderData();
  const router = useRouter();
  const collect = useServerFn(collectSource);
  const analyze = useServerFn(analyzeSource);
  const removeSource = useServerFn(deleteSource);
  const rerunSynthesis = useServerFn(synthesize);

  const [status, setStatus] = useState("all");
  const [investigation, setInvestigation] = useState("all");
  const [active, setActive] = useState(null);
  const [busyId, setBusyId] = useState("");

  const titles = useMemo(
    () => new Map(investigations.map((item) => [item.id, item.title])),
    [investigations],
  );

  const filtered = sources.filter((source) => {
    const matchesStatus = status === "all" || source.status === status;
    const matchesInvestigation = investigation === "all" || source.investigation_id === investigation;
    return matchesStatus && matchesInvestigation;
  });

  const reprocess = async (source) => {
    setBusyId(source.id);
    try {
      const collected = await collect({ data: { id: source.id } });
      if (!collected.ok) throw new Error(collected.error);
      const result = await analyze({ data: { id: source.id } });
      if (!result.ok) throw new Error(result.error);
      await rerunSynthesis({ data: { id: source.investigation_id } });
      await router.invalidate();
      toast.success("Source re-analysed and the dossier updated.");
    } catch (error) {
      toast.error(error?.message || "This source could not be re-analysed.");
    } finally {
      setBusyId("");
    }
  };

  const remove = async (source) => {
    setBusyId(source.id);
    try {
      await removeSource({ data: { id: source.id } });
      await router.invalidate();
      toast.success("Source removed.");
    } catch (error) {
      toast.error(error?.message || "The source could not be removed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Evidence base</p>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Sources</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {sources.length} sources · {sources.filter((s) => s.status === "analyzed").length} analysed
          </p>
        </div>
        <Link
          to="/new"
          className="self-start rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-foreground transition-colors hover:bg-white/[0.07]"
        >
          Add via a new investigation
        </Link>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key)}
              className={`rounded-full border px-3 py-1.5 text-[11px] capitalize transition-colors ${
                status === key
                  ? "border-primary/35 bg-primary/12 text-foreground"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"
              }`}
            >
              {key}
              <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                {key === "all" ? sources.length : sources.filter((s) => s.status === key).length}
              </span>
            </button>
          ))}
        </div>
        <select
          value={investigation}
          onChange={(event) => setInvestigation(event.target.value)}
          className="ml-auto h-9 rounded-lg border border-white/10 bg-[hsl(230_40%_8%)] px-2.5 text-xs text-foreground"
        >
          <option value="all">All investigations</option>
          {investigations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title={sources.length ? "No sources match" : "No sources yet"}
          body={
            sources.length
              ? "Try a different status or investigation."
              : "Add websites, documents or notes to an investigation to build its evidence base."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((source) => (
            <Panel key={source.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={source.status} />
                    <span className="rounded-full border border-white/8 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      {source.source_type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {source.claim_count || 0} claims
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActive(source)}
                    className="mt-2 block max-w-full truncate text-left text-sm text-foreground hover:text-primary"
                  >
                    {source.title}
                  </button>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {source.url || source.file_name || "Research note"} ·{" "}
                    {titles.get(source.investigation_id) || "Investigation"}
                  </p>
                  {source.error_message && (
                    <p className="mt-1.5 text-[10px] text-destructive">{source.error_message}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActive(source)}
                    className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => reprocess(source)}
                    disabled={busyId === source.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {busyId === source.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Re-process
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(source)}
                    disabled={busyId === source.id}
                    className="rounded-lg border border-white/10 p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
                    aria-label={`Delete ${source.title}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Dialog open={Boolean(active)} onOpenChange={(open) => (!open ? setActive(null) : null)}>
        <DialogContent className="max-h-[86vh] overflow-y-auto border-white/10 bg-[hsl(230_42%_7%)] sm:max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left font-heading text-base leading-snug">
                  {active.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={active.status} />
                  <span className="text-[10px] text-muted-foreground">
                    {titles.get(active.investigation_id) || "Investigation"}
                  </span>
                  {active.published_date && (
                    <span className="text-[10px] text-muted-foreground">· {active.published_date}</span>
                  )}
                </div>

                {active.url && (
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {active.url}
                  </a>
                )}
                {active.file_name && !active.url && (
                  <p className="text-muted-foreground">File: {active.file_name}</p>
                )}

                {active.summary && (
                  <div>
                    <p className="eyebrow mb-1.5">Extracted summary</p>
                    <p className="leading-relaxed text-foreground/90">{active.summary}</p>
                  </div>
                )}
                {active.reliability_note && (
                  <div>
                    <p className="eyebrow mb-1.5">Reliability note</p>
                    <p className="leading-relaxed text-muted-foreground">{active.reliability_note}</p>
                  </div>
                )}
                {active.content && (
                  <div>
                    <p className="eyebrow mb-1.5">Collected text</p>
                    <p className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/8 bg-white/[0.02] p-3 leading-relaxed text-muted-foreground">
                      {active.content.slice(0, 6000)}
                    </p>
                  </div>
                )}
                {active.error_message && (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                    {active.error_message}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}