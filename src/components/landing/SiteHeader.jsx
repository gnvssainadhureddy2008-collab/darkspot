import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-primary/40 via-primary/10 to-transparent">
        <span className="absolute h-4 w-4 rounded-full bg-primary/30 blur-md" />
        <svg viewBox="0 0 24 24" className="relative h-4 w-4" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" fill="hsl(252 100% 88%)" />
          <circle cx="12" cy="12" r="8" fill="none" stroke="hsl(250 100% 70%)" strokeWidth="1.1" strokeDasharray="2 3" />
          <circle cx="19" cy="6" r="1.4" fill="hsl(215 100% 70%)" />
        </svg>
      </span>
      {!compact && (
        <span className="font-heading text-[15px] font-semibold tracking-[0.16em] text-foreground">
          DARKSPOT
        </span>
      )}
    </span>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a className="transition-colors hover:text-foreground" href="#signals">
            Signals
          </a>
          <a className="transition-colors hover:text-foreground" href="#engine">
            Engine
          </a>
          <a className="transition-colors hover:text-foreground" href="#capabilities">
            Capabilities
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_10px_40px_-12px_hsl(250_100%_70%_/_0.9)] transition-transform hover:scale-[1.02]"
          >
            Enter workspace
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}