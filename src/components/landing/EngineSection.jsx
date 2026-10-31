import Reveal from "@/components/landing/Reveal";

const steps = [
  {
    step: "01",
    title: "Collect",
    body: "Paste source URLs, upload PDFs, or write notes directly. DARKSPOT extracts the readable text and records provenance for every item.",
  },
  {
    step: "02",
    title: "Extract",
    body: "Each source is mined for material claims, evaluated for evidentiary support, and tagged with the date that makes it time-sensitive.",
  },
  {
    step: "03",
    title: "Compare",
    body: "Claims are compared across sources to locate genuine conflicts, silent agreement, and questions the material never addresses.",
  },
  {
    step: "04",
    title: "Surface",
    body: "Gaps, contradictions, outdated findings and next actions are written to your dossier with a completeness score you can defend.",
  },
];

export default function EngineSection() {
  return (
    <section id="engine" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">The analytical engine</p>
            <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-[2.6rem]">
              A pipeline that reasons about evidence, not vibes.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Every output traces back to a source you supplied. The engine is instructed to state
              uncertainty, return empty findings rather than fabricate them, and mark what needs
              independent verification — so the dossier survives scrutiny.
            </p>
            <div className="mt-8 space-y-4 border-l border-white/10 pl-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Guardrail</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Source text is handled as untrusted data, never as instructions.
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Guardrail</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Claims without evidence are labelled unsupported, not smoothed over.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="relative">
            <div className="absolute left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/40 via-white/10 to-transparent" aria-hidden="true" />
            <div className="space-y-3">
              {steps.map((item, index) => (
                <Reveal key={item.step} delay={index * 0.08}>
                  <div className="relative flex gap-5 rounded-2xl border border-transparent px-1 py-4 transition-colors hover:border-white/10 hover:bg-white/[0.02]">
                    <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-card font-mono text-xs tracking-[0.1em] text-primary">
                      {item.step}
                    </span>
                    <div className="pt-1">
                      <h3 className="font-heading text-base font-medium tracking-tight">{item.title}</h3>
                      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}