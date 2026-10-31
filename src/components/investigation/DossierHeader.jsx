import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FilePlus2, Loader2, RefreshCw, ScrollText, Trash2 } from "lucide-react";
import { ScoreRing, StatusBadge } from "@/components/common/Panels";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-base font-semibold leading-none">{value}</p>
    </div>
  );
}

export default function DossierHeader({ bundle, onRerun, onAddSources, onReport, onDelete, rerunning, reporting }) {
  const { investigation, sources, claims, gaps, contradictions, reports } = bundle;
  const [deleting, setDeleting] = useState(false);

  const analyzedSources = sources.filter((s) => s.status === "analyzed").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={investigation.status} />
            {investigation.last_analyzed && (
              <span className="text-[11px] text-muted-foreground">
                Analysed{" "}
                {new Date(investigation.last_analyzed).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-heading text-2xl font-semibold leading-tight tracking-tight sm:text-[28px]">
            {investigation.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {investigation.research_question}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRerun}
            disabled={rerunning || analyzedSources === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-foreground transition-colors hover:bg-white/[0.07] disabled:opacity-50"
          >
            {rerunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {rerunning ? "Re-analysing" : "Re-run analysis"}
          </button>
          <button
            type="button"
            onClick={onAddSources}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-foreground transition-colors hover:bg-white/[0.07]"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            Add sources
          </button>
          <button
            type="button"
            onClick={onReport}
            disabled={reporting || investigation.status !== "complete"}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {reporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScrollText className="h-3.5 w-3.5" />}
            Generate report
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="rounded-full border border-white/10 p-2 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                aria-label="Delete investigation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-[hsl(230_42%_7%)]">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this investigation?</AlertDialogTitle>
                <AlertDialogDescription>
                  Every source, claim, gap, contradiction and report inside it is removed. This
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 bg-transparent">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setDeleting(true);
                    await onDelete();
                    setDeleting(false);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.015] p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <ScoreRing value={investigation.completeness || 0} size={62} />
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Completeness</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {investigation.completeness >= 70
                ? "Evidence base broadly covers the question"
                : investigation.completeness >= 40
                  ? "Partial coverage — material gaps remain"
                  : "Thin coverage — treat conclusions as provisional"}
            </p>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Sources" value={`${analyzedSources}/${sources.length}`} />
          <Stat label="Claims" value={claims.length} />
          <Stat label="Gaps" value={gaps.length} />
          <Stat label="Conflicts" value={contradictions.length} />
        </div>
        {reports.length > 0 && (
          <Link
            to="/reports"
            className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-center text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {reports.length} report{reports.length > 1 ? "s" : ""}
          </Link>
        )}
      </div>
    </div>
  );
}