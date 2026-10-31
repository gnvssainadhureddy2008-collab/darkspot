import { Link } from "@tanstack/react-router";
import { ArrowRight, FolderSearch, TriangleAlert } from "lucide-react";
import { Panel, PanelTitle, ScoreRing, StatusBadge } from "@/components/common/Panels";
import { EmptyState } from "@/components/common/Panels";

export default function RecentInvestigations({ items }) {
  return (
    <Panel className="h-full">
      <PanelTitle
        title="Recent investigations"
        hint="Your most recently opened research files"
        action={
          <Link to="/investigations" className="text-[11px] text-muted-foreground transition-colors hover:text-foreground">
            View all
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title="No investigations yet"
          body="Create your first investigation to see what your sources are missing."
          action={
            <Link
              to="/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
            >
              New investigation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-white/5">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to="/investigations/$investigationId"
                params={{ investigationId: item.id }}
                className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-white/[0.015]"
              >
                <ScoreRing value={item.completeness || 0} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {item.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{item.source_count || 0} sources</span>
                    <span className="flex items-center gap-1">
                      <TriangleAlert className="h-3 w-3" />
                      {item.contradiction_count || 0}
                    </span>
                    <span>{new Date(item.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}