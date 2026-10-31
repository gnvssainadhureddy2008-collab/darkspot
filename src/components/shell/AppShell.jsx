import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CircleDashed,
  FileStack,
  FileText,
  FolderSearch,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  TriangleAlert,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/AuthContext";
import { Logo } from "@/components/landing/SiteHeader";

const navigation = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/investigations", label: "Investigations", icon: FolderSearch },
  { to: "/sources", label: "Sources", icon: FileStack },
  { to: "/gaps", label: "Information gaps", icon: CircleDashed },
  { to: "/contradictions", label: "Contradictions", icon: TriangleAlert },
  { to: "/reports", label: "Reports", icon: FileText },
];

const titles = [
  { match: /^\/dashboard/, title: "Overview", crumb: "Workspace" },
  { match: /^\/new/, title: "New investigation", crumb: "Workspace" },
  { match: /^\/investigations\/[^/]+/, title: "Investigation dossier", crumb: "Investigations" },
  { match: /^\/investigations/, title: "Investigations", crumb: "Workspace" },
  { match: /^\/sources/, title: "Sources", crumb: "Workspace" },
  { match: /^\/gaps/, title: "Information gaps", crumb: "Intelligence" },
  { match: /^\/contradictions/, title: "Contradictions", crumb: "Intelligence" },
  { match: /^\/reports/, title: "Reports", crumb: "Intelligence" },
  { match: /^\/settings/, title: "Settings", crumb: "Account" },
];

function initials(name, email) {
  const source = (name || email || "DS").trim();
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] || "D").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

function NavList({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
          activeProps={{
            className:
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm bg-primary/12 text-foreground border border-primary/20",
          }}
        >
          <item.icon className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2 px-1 pt-1">
        <Logo />
      </Link>

      <Link
        to="/new"
        onClick={onNavigate}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_14px_40px_-18px_hsl(250_100%_70%)] transition-transform hover:scale-[1.01]"
      >
        <Plus className="h-4 w-4" />
        New investigation
      </Link>

      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
        <div>
          <p className="eyebrow mb-2 px-3">Workspace</p>
          <NavList onNavigate={onNavigate} />
        </div>
      </div>

      <div className="space-y-2 border-t border-white/5 pt-3">
        <Link
          to="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm bg-primary/12 text-foreground border border-primary/20",
          }}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 font-mono text-[11px] text-primary">
            {initials(user?.full_name, user?.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{user?.full_name || "Researcher"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.email || ""}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const current = titles.find((entry) => entry.match.test(pathname)) || { title: "Workspace", crumb: "" };

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-[262px] shrink-0 border-r border-white/5 bg-[hsl(228_44%_5%)]/80 backdrop-blur-xl lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarBody />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-background/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-white/10 bg-[hsl(228_44%_5%)] p-0">
                <SidebarBody onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{current.crumb}</p>
              <h1 className="truncate font-heading text-[15px] font-medium tracking-tight">{current.title}</h1>
            </div>
            <Link
              to="/new"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New investigation</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">{children}</main>
      </div>
    </div>
  );
}