import { useState } from "react";
import { createFileRoute, Link, Outlet, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getInvestigation } from "@/lib/investigations-api";
import { deleteInvestigation } from "@/lib/investigations-api";
import { synthesize } from "@/lib/analysis-api";
import { generateReport } from "@/lib/reports-api";
import DossierHeader from "@/components/investigation/DossierHeader";
import AddSourcesDialog from "@/components/investigation/AddSourcesDialog";
import { EmptyState } from "@/components/common/Panels";
import { FolderSearch } from "lucide-react";

export const Route = createFileRoute("/_authed/investigations/$investigationId")({
  loader: async ({ params }) => {
    const bundle = await getInvestigation({ data: { id: params.investigationId } });
    if (!bundle) throw notFound();
    return bundle;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.investigation?.title || "Investigation"} — DARKSPOT` }],
  }),
  component: DossierLayout,
});

function tabsFor(id, bundle) {
  const params = { investigationId: id };
  return [
    { to: "/investigations/$investigationId", params, label: "Summary", count: null, exact: true },
    { to: "/investigations/$investigationId/gaps", params, label: "Gaps", count: bundle.gaps.length },
    {
      to: "/investigations/$investigationId/contradictions",
      params,
      label: "Contradictions",
      count: bundle.contradictions.length,
    },
    { to: "/investigations/$investigationId/outdated", params, label: "Outdated", count: bundle.outdated.length },
    { to: "/investigations/$investigationId/evidence", params, label: "Evidence", count: bundle.claims.length },
    { to: "/investigations/$investigationId/assistant", params, label: "Assistant", count: null },
  ];
}

function DossierLayout() {
  const bundle = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const rerun = useServerFn(synthesize);
  const report = useServerFn(generateReport);
  const remove = useServerFn(deleteInvestigation);

  const [rerunning, setRerunning] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  if (!bundle) {
    return (
      <EmptyState
        icon={FolderSearch}
        title="Investigation not available"
        body="It may have been deleted, or it belongs to another researcher."
        action={
          <Link to="/investigations" className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground">
            Back to investigations
          </Link>
        }
      />
    );
  }

  const tabs = tabsFor(bundle.investigation.id, bundle);

  const handleRerun = async () => {
    setRerunning(true);
    try {
      await rerun({ data: { id: bundle.investigation.id } });
      await router.invalidate();
      toast.success("Dossier re-analysed from the current sources.");
    } catch (error) {
      toast.error(error?.message || "The analysis could not be re-run.");
    } finally {
      setRerunning(false);
    }
  };

  const handleReport = async () => {
    setReporting(true);
    try {
      await report({ data: { investigationId: bundle.investigation.id } });
      toast.success("Report generated.");
      navigate({ to: "/reports" });
    } catch (error) {
      toast.error(error?.message || "The report could not be generated.");
    } finally {
      setReporting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await remove({ data: { id: bundle.investigation.id } });
      toast.success("Investigation deleted.");
      navigate({ to: "/investigations" });
    } catch (error) {
      toast.error(error?.message || "The investigation could not be deleted.");
    }
  };

  return (
    <div className="space-y-6">
      <DossierHeader
        bundle={bundle}
        onRerun={handleRerun}
        onAddSources={() => setAddOpen(true)}
        onReport={handleReport}
        onDelete={handleDelete}
        rerunning={rerunning}
        reporting={reporting}
      />

      <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-white/5 px-1">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            params={tab.params}
            activeOptions={{ exact: Boolean(tab.exact) }}
            activeProps={{
              className:
                "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 border-primary px-3.5 py-2.5 text-xs font-medium text-foreground",
            }}
            inactiveProps={{
              className:
                "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3.5 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
            }}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      <Outlet />

      <AddSourcesDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        investigationId={bundle.investigation.id}
      />
    </div>
  );
}