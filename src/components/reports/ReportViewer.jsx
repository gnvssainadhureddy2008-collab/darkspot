import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SeverityBadge, StatusBadge } from "@/components/common/Panels";
import { exportReportPdf, parseReport } from "@/lib/exportReportPdf";

function Section({ title, children }) {
  return (
    <section className="space-y-2.5">
      <h3 className="eyebrow">{title}</h3>
      {children}
    </section>
  );
}

export default function ReportViewer({ report, open, onOpenChange }) {
  const content = report ? parseReport(report) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[hsl(230_42%_7%)] sm:max-w-3xl">
        {report && content && (
          <>
            <DialogHeader>
              <DialogTitle className="text-left font-heading text-lg leading-snug">{report.title}</DialogTitle>
              <DialogDescription className="text-left text-xs">{report.research_question}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-2 border-y border-white/5 py-3 text-[10px] text-muted-foreground">
              <span>Completeness {content.completeness ?? 0}%</span>
              <span>·</span>
              <span>{report.source_count ?? 0} sources</span>
              <span>·</span>
              <span>{report.gap_count ?? 0} gaps</span>
              <span>·</span>
              <span>{report.contradiction_count ?? 0} contradictions</span>
              <button
                type="button"
                onClick={() => exportReportPdf(report)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-foreground transition-colors hover:bg-white/[0.06]"
              >
                <Download className="h-3 w-3" /> PDF
              </button>
            </div>

            <div className="space-y-6 text-xs">
              <Section title="Executive summary">
                <p className="leading-relaxed text-foreground/90">{content.executive_summary || "—"}</p>
              </Section>

              {content.key_findings?.length > 0 && (
                <Section title="Key findings">
                  <ol className="space-y-2">
                    {content.key_findings.map((finding, index) => (
                      <li key={finding} className="flex gap-2.5 leading-relaxed text-foreground/90">
                        <span className="font-mono text-[10px] text-primary">{String(index + 1).padStart(2, "0")}</span>
                        {finding}
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {content.gaps?.length > 0 && (
                <Section title="Information gaps">
                  <div className="space-y-3">
                    {content.gaps.map((gap) => (
                      <div key={gap.title} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-foreground">{gap.title}</p>
                          <SeverityBadge severity={gap.severity} />
                        </div>
                        <p className="mt-1.5 leading-relaxed text-muted-foreground">{gap.description}</p>
                        {gap.next_steps && (
                          <p className="mt-2 leading-relaxed text-foreground/80">Next: {gap.next_steps}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {content.contradictions?.length > 0 && (
                <Section title="Contradictions">
                  <div className="space-y-3">
                    {content.contradictions.map((item) => (
                      <div key={item.topic} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-foreground">{item.topic}</p>
                          <SeverityBadge severity={item.severity} />
                        </div>
                        <p className="mt-2 leading-relaxed text-foreground/85">A · {item.claim_a}</p>
                        <p className="mt-1 leading-relaxed text-foreground/85">B · {item.claim_b}</p>
                        <p className="mt-2 leading-relaxed text-muted-foreground">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {content.outdated?.length > 0 && (
                <Section title="Outdated findings">
                  <div className="space-y-2.5">
                    {content.outdated.map((item) => (
                      <div key={item.claim} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="leading-relaxed text-foreground/90">{item.claim}</p>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="mt-1.5 leading-relaxed text-muted-foreground">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {content.recommendations?.length > 0 && (
                <Section title="Recommended next actions">
                  <ul className="space-y-2">
                    {content.recommendations.map((item) => (
                      <li key={item.title} className="leading-relaxed">
                        <span className="text-foreground">{item.title}</span>
                        <span className="text-muted-foreground"> — {item.detail}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {content.sources?.length > 0 && (
                <Section title="Sources">
                  <ul className="space-y-1.5">
                    {content.sources.map((source) => (
                      <li key={source.title} className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          <span className="text-foreground/90">{source.title}</span>
                          {source.reference ? ` · ${source.reference}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}