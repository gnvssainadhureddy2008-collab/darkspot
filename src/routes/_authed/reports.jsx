import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, ScrollText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listReports } from "@/lib/reports-api";
import { deleteReport } from "@/lib/reports-api";
import { EmptyState, Panel, ScoreRing } from "@/components/common/Panels";
import ReportViewer from "@/components/reports/ReportViewer";
import { exportReportPdf } from "@/lib/exportReportPdf";

export const Route = createFileRoute("/_authed/reports")({
  loader: () => listReports(),
  head: () => ({ meta: [{ title: "Reports — DARKSPOT" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const reports = Route.useLoaderData();
  const router = useRouter();
  const remove = useServerFn(deleteReport);
  const [active, setActive] = useState(null);
  const [busyId, setBusyId] = useState("");

  const handleDelete = async (report) => {
    setBusyId(report.id);
    try {
      await remove({ data: { id: report.id } });
      await router.invalidate();
      toast.success("Report deleted.");
    } catch (error) {
      toast.error(error?.message || "The report could not be deleted.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Deliverables</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Exported dossiers you can hand to a decision maker or attach to a brief.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No reports generated"
          body="Open a completed investigation and choose Generate report to build a document from its analysis."
          action={
            <Link
              to="/investigations"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
            >
              Go to investigations
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Panel key={report.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <ScoreRing value={report.completeness || 0} size={52} />
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setActive(report)}
                    className="block max-w-full truncate text-left font-heading text-sm font-medium hover:text-primary"
                  >
                    {report.title}
                  </button>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{report.research_question}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                    <Link
                      to="/investigations/$investigationId"
                      params={{ investigationId: report.investigation_id }}
                      className="text-primary/90 hover:text-primary"
                    >
                      {report.investigation_title}
                    </Link>
                    <span>{report.source_count ?? 0} sources</span>
                    <span>{report.gap_count ?? 0} gaps</span>
                    <span>{report.contradiction_count ?? 0} contradictions</span>
                    <span>
                      {new Date(report.created_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActive(report)}
                    className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => exportReportPdf(report)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(report)}
                    disabled={busyId === report.id}
                    className="rounded-lg border border-white/10 p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
                    aria-label={`Delete ${report.title}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <ReportViewer report={active} open={Boolean(active)} onOpenChange={(open) => (!open ? setActive(null) : null)} />

      <p className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <FileText className="h-3 w-3" />
        Reports are generated from the analysis stored in each dossier — nothing is invented at export time.
      </p>
    </div>
  );
}