import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Shield, Sparkles } from "lucide-react";
import { getDashboard } from "@/lib/investigations-api";
import { useAuth } from "@/lib/AuthContext";
import { Panel, PanelTitle } from "@/components/common/Panels";

export const Route = createFileRoute("/_authed/settings")({
  loader: () => getDashboard(),
  head: () => ({ meta: [{ title: "Settings — DARKSPOT" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const data = Route.useLoaderData();
  const { user, logout } = useAuth();
  const initials = ((user?.full_name || user?.email || "DS").match(/\b\w/g) || ["D"])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your researcher profile and workspace footprint.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Panel>
          <PanelTitle title="Researcher profile" hint="Managed by your workspace account" />
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 font-heading text-base text-primary">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-medium">{user?.full_name || "Researcher"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/90">
                {user?.role || "user"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/5 pt-5">
            {[
              ["Investigations", data.stats.investigations],
              ["Sources", data.stats.sources],
              ["Gaps mapped", data.stats.gaps],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                <p className="mt-1 font-heading text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <PanelTitle title="Analysis engine" hint="How findings are produced" />
            <ul className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <li className="flex gap-2.5">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Each source is analysed in isolation before anything is compared, so a single
                document cannot set the frame for the rest.
              </li>
              <li className="flex gap-2.5">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-4" />
                Source text is treated as untrusted data. Text that tries to instruct the engine is
                flagged, never obeyed.
              </li>
              <li className="flex gap-2.5">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-2" />
                Findings are limited to the sources you supplied. Empty results are allowed and
                preferred over invented ones.
              </li>
            </ul>
          </Panel>

          <Panel>
            <PanelTitle title="Continue research" />
            <div className="flex flex-col gap-2">
              <Link
                to="/new"
                className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-center text-xs text-foreground transition-colors hover:bg-primary/20"
              >
                New investigation
              </Link>
              <Link
                to="/investigations"
                className="rounded-xl border border-white/10 px-4 py-2.5 text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Browse investigations
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}