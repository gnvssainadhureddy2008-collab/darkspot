import { CircleDashed, FileWarning, ScanSearch, TriangleAlert } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

const signals = [
  {
    icon: CircleDashed,
    title: "Information gaps",
    body: "Sub-questions your evidence base never answers, with the severity of each omission and the exact next step to close it.",
    tone: "text-chart-3",
    ring: "from-primary/25",
  },
  {
    icon: TriangleAlert,
    title: "Contradictions",
    body: "Where two sources genuinely conflict — both sides quoted side by side, the nature of the conflict named, no verdict invented.",
    tone: "text-chart-5",
    ring: "from-chart-5/25",
  },
  {
    icon: FileWarning,
    title: "Outdated facts",
    body: "Time-sensitive claims flagged against their reference date, separated into confirmed staleness and items needing verification.",
    tone: "text-destructive",
    ring: "from-destructive/20",
  },
  {
    icon: ScanSearch,
    title: "Unsupported claims",
    body: "Every extracted claim scored for evidentiary support, so assertions that arrive without evidence never pass as findings.",
    tone: "text-chart-4",
    ring: "from-chart-4/25",
  },
];

export default function SignalGrid() {
  return (
    <section id="signals" className="relative border-y border-white/5 bg-white/[0.012] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">Signal detection</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-2xl font-heading text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-[2.6rem]">
              Four questions every research file should answer before you trust it.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Most research tools help you collect more. DARKSPOT interrogates what you have already
              collected and shows you the shape of its blind spots.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {signals.map((signal, index) => (
            <Reveal key={signal.title} delay={index * 0.07}>
              <article className="panel panel-hover group relative h-full overflow-hidden p-6 sm:p-7">
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${signal.ring} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                />
                <signal.icon className={`h-5 w-5 ${signal.tone}`} />
                <h3 className="mt-5 font-heading text-lg font-medium tracking-tight">{signal.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{signal.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}