import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import { Logo } from "@/components/landing/SiteHeader";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(250_100%_70%_/_0.18),transparent_65%)]" />
            <div className="pointer-events-none absolute inset-0 grid-veil opacity-30" />
            <div className="relative">
              <p className="eyebrow">Open the dossier</p>
              <h2 className="mx-auto mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-[2.8rem]">
                Stop wondering what your research missed.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Create an investigation, add your sources, and get a defensible map of the gaps,
                conflicts and stale facts inside your evidence base.
              </p>
              <Link
                to="/dashboard"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-[0_20px_70px_-20px_hsl(250_100%_70%)] transition-transform hover:scale-[1.02]"
              >
                Enter the workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Research intelligence, evidenced.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <a className="transition-colors hover:text-foreground" href="#signals">
            Signals
          </a>
          <a className="transition-colors hover:text-foreground" href="#engine">
            Engine
          </a>
          <a className="transition-colors hover:text-foreground" href="#capabilities">
            Capabilities
          </a>
          <Link className="transition-colors hover:text-foreground" to="/login">
            Sign in
          </Link>
          <span className="text-muted-foreground/60">© {new Date().getFullYear()} DARKSPOT</span>
        </div>
      </div>
    </footer>
  );
}