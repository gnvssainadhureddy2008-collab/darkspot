import { FileText, Gauge, Layers, Link2, MessagesSquare, Sparkles } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

const capabilities = [
  {
    icon: Gauge,
    title: "Completeness scoring",
    body: "A defended percentage of how fully your evidence answers the question — measured against sub-parts, not effort.",
  },
  {
    icon: Link2,
    title: "Cited everything",
    body: "Each finding names the source that produced it. Claims, gaps and contradictions are all traceable back to the file.",
  },
  {
    icon: MessagesSquare,
    title: "Grounded assistant",
    body: "Ask questions inside an investigation and get answers limited to its dossier — with an explicit refusal when the data cannot answer.",
  },
  {
    icon: FileText,
    title: "Exportable dossiers",
    body: "Build a board-ready report from the analysis and export it as a document without retyping a single finding.",
  },
  {
    icon: Layers,
    title: "Multi-source workspace",
    body: "Web pages, PDFs and your own notes analysed side by side in one investigation, each with its own evidence trail.",
  },
  {
    icon: Sparkles,
    title: "Verification queue",
    body: "Items that need an independent source are queued separately from confirmed findings, so confidence stays honest.",
  },
];

export default function CapabilitySection() {
  return (
    <section id="capabilities" className="border-t border-white/5 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">Capabilities</p>
          <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-[2.6rem]">
            Built for research that has to hold up.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <div className="group h-full bg-[hsl(230_42%_6%)] p-6 transition-colors hover:bg-[hsl(232_42%_8%)] sm:p-7">
                <item.icon className="h-5 w-5 text-primary/90 transition-transform duration-500 group-hover:scale-110" />
                <h3 className="mt-5 font-heading text-base font-medium tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}