import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleDot, ScanSearch, TriangleAlert } from "lucide-react";
import IntelligenceSphere from "@/components/landing/IntelligenceSphere";

const floating = [
  {
    label: "Information gap",
    detail: "No source addresses pricing for 2026",
    icon: CircleDot,
    position: "left-[-6%] top-[16%]",
    tone: "text-chart-3",
  },
  {
    label: "Contradiction",
    detail: "Two sources disagree on annual output",
    icon: TriangleAlert,
    position: "right-[-4%] top-[46%]",
    tone: "text-chart-5",
  },
  {
    label: "Outdated",
    detail: "Figure last valid in Q3 2024",
    icon: ScanSearch,
    position: "left-[2%] bottom-[8%]",
    tone: "text-chart-4",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-veil opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-4 animate-pulse-glow" />
            <span className="eyebrow">Research intelligence engine</span>
          </span>

          <h1 className="mt-6 font-heading text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.1rem]">
            <span className="text-gradient">Find what</span>
            <br />
            <span className="text-gradient">your sources</span>{" "}
            <span className="text-gradient-violet">never say.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            DARKSPOT reads every source in your investigation and reports what the evidence base
            actually contains — the information gaps it leaves open, the contradictions between
            documents, the facts that have gone stale, and the claims nothing backs up.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_18px_60px_-18px_hsl(250_100%_70%_/_1)] transition-transform hover:scale-[1.02]"
            >
              Start an investigation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#engine"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-6 py-3 text-sm text-foreground/90 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              See how analysis works
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/5 pt-6">
            {[
              { value: "4", label: "Signal classes" },
              { value: "100%", label: "Source traceability" },
              { value: "0", label: "Invented citations" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-heading text-2xl font-semibold text-foreground">{item.value}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <IntelligenceSphere className="h-full w-full" />
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {floating.map((chip, index) => (
              <div
                key={chip.label}
                className={`absolute ${chip.position} animate-float-slow`}
                style={{ animationDelay: `${index * 2.4}s` }}
              >
                <div className="glass flex max-w-[220px] items-start gap-2.5 rounded-xl px-3.5 py-3 shadow-[0_20px_60px_-30px_hsl(230_80%_2%)]">
                  <chip.icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${chip.tone}`} />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/90">
                      {chip.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{chip.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}