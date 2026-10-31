import { jsPDF } from "jspdf";

export function parseReport(report) {
  try {
    return JSON.parse(report?.content || "{}");
  } catch {
    return null;
  }
}

export function exportReportPdf(report) {
  const content = parseReport(report);
  if (!content) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 52;
  const maxWidth = pageWidth - margin * 2;
  let y = 76;

  const ensure = (needed) => {
    if (y + needed > pageHeight - 56) {
      doc.addPage();
      y = 64;
    }
  };

  const write = (text, options = {}) => {
    const { size = 10, bold = false, color = [38, 40, 56], gap = 6, leading = size * 1.45 } = options;
    if (!text) return;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(String(text), maxWidth);
    lines.forEach((line) => {
      ensure(leading);
      doc.text(line, margin, y);
      y += leading;
    });
    y += gap;
  };

  const rule = () => {
    ensure(16);
    doc.setDrawColor(222, 222, 232);
    doc.setLineWidth(0.7);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  };

  doc.setFillColor(24, 26, 44);
  doc.rect(0, 0, pageWidth, 6, "F");

  write("DARKSPOT · RESEARCH REPORT", { size: 8, color: [124, 96, 245], gap: 10 });
  write(report.title || "Research report", { size: 20, bold: true, color: [16, 18, 30], gap: 8 });
  write(report.research_question || "", { size: 11, color: [70, 74, 96], gap: 10 });

  const generated = content.generated_at
    ? new Date(content.generated_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "";
  write(
    [
      generated ? `Generated ${generated}` : "",
      `Completeness ${content.completeness ?? 0}%`,
      `${report.source_count ?? 0} sources`,
      `${report.gap_count ?? 0} gaps`,
      `${report.contradiction_count ?? 0} contradictions`,
    ]
      .filter(Boolean)
      .join("   ·   "),
    { size: 9, color: [110, 114, 134], gap: 12 },
  );
  rule();

  write("EXECUTIVE SUMMARY", { size: 8, bold: true, color: [124, 96, 245], gap: 6 });
  write(content.executive_summary || "No summary recorded.", { size: 10.5, gap: 12 });

  if (content.key_findings?.length) {
    write("KEY FINDINGS", { size: 8, bold: true, color: [124, 96, 245], gap: 6 });
    content.key_findings.forEach((finding, index) => {
      write(`${index + 1}. ${finding}`, { size: 10, gap: 6 });
    });
    y += 6;
  }

  if (content.observations?.length) {
    write("OBSERVATIONS ON THE EVIDENCE", { size: 8, bold: true, color: [124, 96, 245], gap: 6 });
    content.observations.forEach((note) => write(`· ${note}`, { size: 10, color: [70, 74, 96], gap: 5 }));
    y += 6;
  }

  if (content.gaps?.length) {
    rule();
    write("INFORMATION GAPS", { size: 8, bold: true, color: [124, 96, 245], gap: 8 });
    content.gaps.forEach((gap) => {
      ensure(60);
      write(`${gap.title}  [${(gap.severity || "").toUpperCase()}]`, { size: 10.5, bold: true, gap: 4 });
      write(gap.description, { size: 9.5, color: [70, 74, 96], gap: 4 });
      if (gap.why_important) write(`Why it matters: ${gap.why_important}`, { size: 9, color: [96, 100, 120], gap: 4 });
      if (gap.next_steps) write(`Next step: ${gap.next_steps}`, { size: 9, color: [96, 100, 120], gap: 10 });
    });
  }

  if (content.contradictions?.length) {
    rule();
    write("CONTRADICTIONS", { size: 8, bold: true, color: [124, 96, 245], gap: 8 });
    content.contradictions.forEach((item) => {
      ensure(70);
      write(`${item.topic}  [${(item.severity || "").toUpperCase()}]`, { size: 10.5, bold: true, gap: 4 });
      write(`A · ${item.claim_a}${item.source_a ? ` (${item.source_a})` : ""}`, { size: 9, gap: 3 });
      write(`B · ${item.claim_b}${item.source_b ? ` (${item.source_b})` : ""}`, { size: 9, gap: 4 });
      if (item.explanation) write(item.explanation, { size: 9, color: [96, 100, 120], gap: 4 });
      if (item.next_steps) write(`Resolve: ${item.next_steps}`, { size: 9, color: [96, 100, 120], gap: 10 });
    });
  }

  if (content.outdated?.length) {
    rule();
    write("OUTDATED FINDINGS", { size: 8, bold: true, color: [124, 96, 245], gap: 8 });
    content.outdated.forEach((item) => {
      ensure(56);
      write(item.claim, { size: 9.5, bold: true, gap: 3 });
      write(
        `${item.status === "confirmed" ? "Confirmed outdated" : "Needs verification"}${item.date_reference ? ` · ${item.date_reference}` : ""}${item.source ? ` · ${item.source}` : ""}`,
        { size: 8.5, color: [124, 96, 245], gap: 3 },
      );
      write(item.reason, { size: 9, color: [70, 74, 96], gap: 3 });
      if (item.recommendation) write(`Recommended: ${item.recommendation}`, { size: 9, color: [96, 100, 120], gap: 10 });
      else y += 4;
    });
  }

  if (content.recommendations?.length) {
    rule();
    write("RECOMMENDED NEXT ACTIONS", { size: 8, bold: true, color: [124, 96, 245], gap: 8 });
    content.recommendations.forEach((item, index) => {
      ensure(44);
      write(`${index + 1}. ${item.title}  [${item.category} · ${item.priority}]`, { size: 10, bold: true, gap: 3 });
      write(item.detail, { size: 9, color: [70, 74, 96], gap: 8 });
    });
  }

  if (content.sources?.length) {
    rule();
    write("SOURCES", { size: 8, bold: true, color: [124, 96, 245], gap: 8 });
    content.sources.forEach((source, index) => {
      ensure(40);
      write(`${index + 1}. ${source.title}`, { size: 9.5, bold: true, gap: 2 });
      write(
        [source.reference, source.published_date ? `published ${source.published_date}` : "", `${source.claim_count} claims`]
          .filter(Boolean)
          .join(" · "),
        { size: 8.5, color: [110, 114, 134], gap: 8 },
      );
    });
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 152, 168);
    doc.text(`DARKSPOT — ${report.title || "Research report"}`, margin, pageHeight - 30);
    doc.text(`${page} / ${pages}`, pageWidth - margin, pageHeight - 30, { align: "right" });
  }

  const slug = (report.title || "dark-spot-report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  doc.save(`${slug || "darkspot-report"}.pdf`);
}