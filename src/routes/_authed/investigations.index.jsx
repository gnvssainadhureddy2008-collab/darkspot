import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderSearch, Plus, Search } from "lucide-react";
import { listInvestigations } from "@/lib/investigations-api";
import { EmptyState, ScoreRing, StatusBadge } from "@/components/common/Panels";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authed/investigations/")({
  loader: () => listInvestigations(),
  head: () => ({ meta: [{ title: "Investigations — DARKSPOT" }] }),
  component: InvestigationsPage,
});

const STATUS_FILTERS = ["all", "complete", "analyzing", "draft", "failed"];

function InvestigationsPage() {
  const items = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = items.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      item.title.toLowerCase().includes(needle) ||
      (item.research_question || "").toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Research files</p>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Investigations</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {items.length} dossier{items.length === 1 ? "" : "s"} in this workspace
          </p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> New investigation
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((key) => (
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
                {key === "all" ? items.length : items.filter((item) => item.status === key).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search investigations"
            className="h-9 border-white/10 bg-white/[0.03] pl-9 text-xs"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title={items.length ? "No investigations match" : "No investigations yet"}
          body={
            items.length
              ? "Adjust the filters or search for a different question."
              : "A dossier starts with one question and the sources you trust."
          }
          action={
            !items.length && (
              <Link
                to="/new"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" /> Create investigation
              </Link>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              to="/investigations/$investigationId"
              params={{ investigationId: item.id }}
              className="panel panel-hover flex flex-col p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <StatusBadge status={item.status} />
                <ScoreRing value={item.completeness || 0} size={44} />
              </div>
              <h2 className="mt-4 font-heading text-sm font-medium leading-snug tracking-tight">{item.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {item.research_question}
              </p>
              <div className="mt-auto grid grid-cols-3 gap-2 border-t border-white/5 pt-3.5 text-[10px] text-muted-foreground">
                <span>{item.source_count || 0} sources</span>
                <span>{item.gap_count || 0} gaps</span>
                <span>{item.contradiction_count || 0} conflicts</span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground/70">
                {new Date(item.created_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}