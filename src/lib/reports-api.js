import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { loadBundle } from "@/lib/bundle.server";
import { asArray } from "@/lib/shape";

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const [reports, investigations] = await Promise.all([
      base44.entities.Report.list({ sort: "-created_date", limit: 100 }).then(asArray),
      base44.entities.Investigation.list({ sort: "-created_date", limit: 100 }).then(asArray),
    ]);
    const titles = new Map(investigations.map((i) => [i.id, i.title]));
    return reports.map((report) => ({
      ...report,
      investigation_title: titles.get(report.investigation_id) || "Investigation",
    }));
  });

export const generateReport = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ investigationId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const { investigation, sources, claims, gaps, contradictions, outdated, recommendations } = await loadBundle(
      base44,
      data.investigationId,
    );

    if (investigation.status !== "complete") {
      throw new Error("Run the analysis before generating a report.");
    }

    const content = {
      generated_at: new Date().toISOString(),
      executive_summary: investigation.summary || "",
      completeness: investigation.completeness || 0,
      key_findings: investigation.key_findings || [],
      observations: investigation.observations || [],
      sources: sources.map((s) => ({
        title: s.title,
        type: s.source_type,
        reference: s.url || s.file_name || "",
        published_date: s.published_date || "",
        summary: s.summary || s.excerpt || "",
        claim_count: s.claim_count || 0,
        status: s.status,
      })),
      claims: claims.slice(0, 60).map((c) => ({
        text: c.claim_text,
        evidence: c.evidence_note,
        status: c.evidence_status,
        source: c.source_title,
        verification_needed: Boolean(c.verification_needed),
      })),
      gaps: gaps.map((g) => ({
        title: g.title,
        description: g.description,
        why_important: g.why_important,
        severity: g.severity,
        next_steps: g.next_steps,
      })),
      contradictions: contradictions.map((c) => ({
        topic: c.topic,
        claim_a: c.claim_a,
        source_a: c.source_a_title,
        claim_b: c.claim_b,
        source_b: c.source_b_title,
        explanation: c.explanation,
        severity: c.severity,
        next_steps: c.next_steps,
      })),
      outdated: outdated.map((o) => ({
        claim: o.claim,
        source: o.source_title,
        date_reference: o.date_reference,
        reason: o.reason,
        status: o.status,
        recommendation: o.recommendation,
      })),
      recommendations: recommendations.map((r) => ({
        title: r.title,
        detail: r.detail,
        category: r.category,
        priority: r.priority,
      })),
    };

    const report = await base44.entities.Report.create({
      investigation_id: investigation.id,
      title: investigation.title,
      research_question: investigation.research_question,
      content: JSON.stringify(content),
      completeness: investigation.completeness || 0,
      gap_count: gaps.length,
      contradiction_count: contradictions.length,
      source_count: sources.length,
    });

    return report;
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    await context.getBase44().entities.Report.delete(data.id);
    return { ok: true };
  });