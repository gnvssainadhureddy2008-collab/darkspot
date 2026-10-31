import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { loadBundle } from "@/lib/bundle.server";
import { asArray } from "@/lib/shape";
import { extractSourceInsights, fetchWebsiteContent, synthesizeInvestigation } from "@/lib/analysis.server";

const sourceInput = z.object({
  title: z.string().trim().min(1).max(220),
  source_type: z.enum(["website", "document", "note"]),
  url: z.string().trim().max(1200).optional().default(""),
  file_url: z.string().trim().max(1200).optional().default(""),
  file_name: z.string().trim().max(240).optional().default(""),
  content: z.string().max(18000).optional().default(""),
  note: z.string().trim().max(3000).optional().default(""),
});

export const addSources = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ investigationId: z.string(), sources: z.array(sourceInput).min(1).max(8) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const records = data.sources.map((source) => ({
      investigation_id: data.investigationId,
      title: source.title,
      source_type: source.source_type,
      url: source.url,
      file_url: source.file_url,
      file_name: source.file_name,
      content: source.content,
      note: source.note,
      status: "pending",
      excerpt: source.content ? source.content.slice(0, 280) : "",
    }));
    const before = asArray(
      await base44.entities.Source.filter({ investigation_id: data.investigationId }),
    );
    const beforeIds = new Set(before.map((source) => source.id));
    await base44.entities.Source.bulkCreate(records);
    const after = asArray(
      await base44.entities.Source.filter({ investigation_id: data.investigationId }),
    );
    await base44.entities.Investigation.update(data.investigationId, { source_count: after.length });
    const created = after.filter((source) => !beforeIds.has(source.id));
    return { added: records.length, sources: created };
  });

export const deleteSource = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const source = await base44.entities.Source.get(data.id);
    await base44.entities.Claim.deleteMany({ source_id: data.id });
    await base44.entities.Source.delete(data.id);
    const remaining = asArray(
      await base44.entities.Source.filter({ investigation_id: source.investigation_id }),
    );
    await base44.entities.Investigation.update(source.investigation_id, {
      source_count: remaining.length,
    });
    return { ok: true };
  });

export const collectSource = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const source = await base44.entities.Source.get(data.id);

    if (source.source_type === "website") {
      try {
        const page = await fetchWebsiteContent(source.url);
        const updated = await base44.entities.Source.update(source.id, {
          title: source.title || page.title,
          content: page.text,
          excerpt: page.text.slice(0, 280),
          site_name: page.siteName,
          published_date: source.published_date || page.publishedDate,
          status: "collected",
          error_message: "",
        });
        return { ok: true, source: updated };
      } catch (error) {
        const updated = await base44.entities.Source.update(source.id, {
          status: "failed",
          error_message: error.message || "Collection failed.",
        });
        return { ok: false, error: updated.error_message, source: updated };
      }
    }

    if (!source.content && !source.file_url) {
      const updated = await base44.entities.Source.update(source.id, {
        status: "failed",
        error_message: "This source has no readable content.",
      });
      return { ok: false, error: updated.error_message, source: updated };
    }

    const updated = await base44.entities.Source.update(source.id, {
      status: "collected",
      excerpt: (source.content || source.note || source.title).slice(0, 280),
      error_message: "",
    });
    return { ok: true, source: updated };
  });

export const analyzeSource = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const source = await base44.entities.Source.get(data.id);
    const investigation = await base44.entities.Investigation.get(source.investigation_id);

    await base44.entities.Source.update(source.id, { status: "analyzing", error_message: "" });

    try {
      const insights = await extractSourceInsights(base44, { investigation, source });

      await base44.entities.Claim.deleteMany({ source_id: source.id });
      if (insights.claims.length) {
        await base44.entities.Claim.bulkCreate(
          insights.claims.map((claim) => ({
            investigation_id: investigation.id,
            source_id: source.id,
            source_title: source.title,
            ...claim,
          })),
        );
      }

      const updated = await base44.entities.Source.update(source.id, {
        status: "analyzed",
        summary: insights.summary,
        reliability_note: insights.reliabilityNote,
        published_date: source.published_date || insights.publishedDate,
        excerpt: (source.excerpt || source.content || insights.summary).slice(0, 280),
        claim_count: insights.claims.length,
        error_message: "",
      });

      return {
        ok: true,
        claims: insights.claims.length,
        unanswered: insights.unanswered,
        source: updated,
      };
    } catch (error) {
      await base44.entities.Source.update(source.id, {
        status: "failed",
        error_message: error.message || "Analysis failed.",
      });
      return { ok: false, error: error.message || "Analysis failed." };
    }
  });

export const synthesize = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const { investigation, sources, claims } = await loadBundle(base44, data.id);
    const ready = sources.filter((s) => s.status === "analyzed");

    if (!ready.length) {
      throw new Error("No sources finished analysis, so there is nothing to synthesise yet.");
    }

    const result = await synthesizeInvestigation(base44, {
      investigation,
      sources: ready,
      claims: claims.filter((c) => ready.some((s) => s.id === c.source_id)),
    });

    const titleOf = new Map(ready.map((s) => [s.id, s.title]));
    const query = { investigation_id: investigation.id };

    await Promise.all([
      base44.entities.InfoGap.deleteMany(query),
      base44.entities.Contradiction.deleteMany(query),
      base44.entities.OutdatedFinding.deleteMany(query),
      base44.entities.Recommendation.deleteMany(query),
    ]);

    const writes = [];
    if (result.gaps.length) {
      writes.push(
        base44.entities.InfoGap.bulkCreate(
          result.gaps.map((gap) => ({ investigation_id: investigation.id, ...gap })),
        ),
      );
    }
    if (result.contradictions.length) {
      writes.push(
        base44.entities.Contradiction.bulkCreate(
          result.contradictions.map((item) => ({
            investigation_id: investigation.id,
            topic: item.topic,
            claim_a: item.claim_a,
            source_a_id: item.source_a_id,
            source_a_title: titleOf.get(item.source_a_id) || "",
            claim_b: item.claim_b,
            source_b_id: item.source_b_id,
            source_b_title: titleOf.get(item.source_b_id) || "",
            explanation: item.explanation,
            severity: item.severity,
            next_steps: item.next_steps,
          })),
        ),
      );
    }
    if (result.outdated.length) {
      writes.push(
        base44.entities.OutdatedFinding.bulkCreate(
          result.outdated.map((item) => ({
            investigation_id: investigation.id,
            ...item,
            source_title: titleOf.get(item.source_id) || "",
          })),
        ),
      );
    }
    if (result.recommendations.length) {
      writes.push(
        base44.entities.Recommendation.bulkCreate(
          result.recommendations.map((item) => ({ investigation_id: investigation.id, ...item })),
        ),
      );
    }
    await Promise.all(writes);

    await base44.entities.Investigation.update(investigation.id, {
      status: "complete",
      stage: "complete",
      progress: 100,
      summary: result.summary,
      key_findings: result.keyFindings,
      observations: result.observations,
      completeness: result.completeness,
      source_count: ready.length,
      gap_count: result.gaps.length,
      contradiction_count: result.contradictions.length,
      analyses: investigation.analyses?.length ? investigation.analyses : ["gaps", "contradictions", "outdated", "evidence"],
      error_message: "",
      last_analyzed: new Date().toISOString(),
    });

    return {
      gaps: result.gaps.length,
      contradictions: result.contradictions.length,
      outdated: result.outdated.length,
      recommendations: result.recommendations.length,
      completeness: result.completeness,
    };
  });