import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CircleDashed, FileStack, FolderSearch, ShieldAlert, TriangleAlert } from "lucide-react";
import { Panel } from "@/components/common/Panels";

const cards = [
  {
    key: "investigations",
    label: "Investigations",
    icon: FolderSearch,
    hint: () => "research files",
    tone: "text-primary",
    to: "/investigations",
  },
  {
    key: "analyzedSources",
    label: "Sources analyzed",
    icon: FileStack,
    hint: (stats) => `${stats.sources} collected`,
    tone: "text-chart-2",
    to: "/sources",
  },
  {
    key: "gaps",
    label: "Information gaps",
    icon: CircleDashed,
    hint: () => "across all dossiers",
    tone: "text-chart-3",
    to: "/gaps",
  },
  {
    key: "contradictions",
    label: "Contradictions",
    icon: TriangleAlert,
    hint: () => "conflicting claims",
    tone: "text-chart-5",
    to: "/contradictions",
  },
  {
    key: "verification",
    label: "Needs verification",
    icon: ShieldAlert,
    hint: () => "claims to confirm",
    tone: "text-chart-4",
    to: "/investigations",
  },
];

export default function OverviewStats({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {cards.map((card) => (
        <Link key={card.key} to={card.to} className="group">
          <Panel className="h-full p-4 transition-colors group-hover:border-white/15 sm:p-5">
            <div className="flex items-start justify-between">
              <card.icon className={`h-4 w-4 ${card.tone}`} />
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
            </div>
            <p className="mt-4 font-heading text-[26px] font-semibold leading-none tracking-tight">
              {stats[card.key] ?? 0}
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/80">
              {card.label}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{card.hint(stats)}</p>
          </Panel>
        </Link>
      ))}
    </div>
  );
}