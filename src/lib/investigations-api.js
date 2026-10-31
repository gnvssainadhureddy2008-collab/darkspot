import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { asArray } from "@/lib/shape";

const DAY = 24 * 60 * 60 * 1000;

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

export const listInvestigations = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const investigations = asArray(
      await base44.entities.Investigation.list({ sort: "-created_date", limit: 100 }),
    );
    return investigations;
  });

export const getInvestigation = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const id = data.id;
    const [investigation, sources, claims, gaps, contradictions, outdated, recommendations, messages, reports] =
      await Promise.all([
        base44.entities.Investigation.get(id).catch(() => null),
        base44.entities.Source.filter({ investigation_id: id }, { sort: "-created_date", limit: 100 }),
        base44.entities.Claim.filter({ investigation_id: id }, { sort: "created_date", limit: 400 }),
        base44.entities.InfoGap.filter({ investigation_id: id }, { sort: "-created_date", limit: 100 }),
        base44.entities.Contradiction.filter({ investigation_id: id }, { sort: "-created_date", limit: 100 }),
        base44.entities.OutdatedFinding.filter({ investigation_id: id }, { sort: "-created_date", limit: 100 }),
        base44.entities.Recommendation.filter({ investigation_id: id }, { sort: "created_date", limit: 100 }),
        base44.entities.AssistantMessage.filter({ investigation_id: id }, { sort: "created_date", limit: 100 }),
        base44.entities.Report.filter({ investigation_id: id }, { sort: "-created_date", limit: 50 }),
      ]);
    if (!investigation) return null;
    return {
      investigation,
      sources: asArray(sources),
      claims: asArray(claims),
      gaps: asArray(gaps),
      contradictions: asArray(contradictions),
      outdated: asArray(outdated),
      recommendations: asArray(recommendations),
      messages: asArray(messages),
      reports: asArray(reports),
    };
  });

const createSchema = z.object({
  title: z.string().trim().min(1).max(160),
  research_question: z.string().trim().min(3).max(1200),
  description: z.string().trim().max(2000).optional().default(""),
  analyses: z.array(z.string().max(40)).max(8).optional().default([]),
});

export const createInvestigation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(createSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    return base44.entities.Investigation.create({
      ...data,
      status: "draft",
      stage: "queued",
      progress: 0,
      summary: "",
      key_findings: [],
      observations: [],
      completeness: 0,
      source_count: 0,
      gap_count: 0,
      contradiction_count: 0,
    });
  });

export const updateInvestigation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string(),
      status: z.enum(["draft", "analyzing", "complete", "failed"]).optional(),
      stage: z.string().max(40).optional(),
      progress: z.number().min(0).max(100).optional(),
      error_message: z.string().max(600).optional(),
      summary: z.string().max(4000).optional(),
      completeness: z.number().min(0).max(100).optional(),
    }),
  )
  .handler(async ({ data: { id, ...patch }, context }) =>
    context.getBase44().entities.Investigation.update(id, patch),
  );

export const deleteInvestigation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const query = { investigation_id: data.id };
    await Promise.all([
      base44.entities.Source.deleteMany(query),
      base44.entities.Claim.deleteMany(query),
      base44.entities.InfoGap.deleteMany(query),
      base44.entities.Contradiction.deleteMany(query),
      base44.entities.OutdatedFinding.deleteMany(query),
      base44.entities.Recommendation.deleteMany(query),
      base44.entities.AssistantMessage.deleteMany(query),
      base44.entities.Report.deleteMany(query),
    ]);
    await base44.entities.Investigation.delete(data.id);
    return { ok: true };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const [investigations, sources, gaps, contradictions, claims] = await Promise.all([
      base44.entities.Investigation.list({ sort: "-created_date", limit: 100 }).then(asArray),
      base44.entities.Source.list({ sort: "-created_date", limit: 300 }).then(asArray),
      base44.entities.InfoGap.list({ sort: "-created_date", limit: 300 }).then(asArray),
      base44.entities.Contradiction.list({ sort: "-created_date", limit: 300 }).then(asArray),
      base44.entities.Claim.list({ sort: "-created_date", limit: 400 }).then(asArray),
    ]);

    const titleOf = new Map(investigations.map((i) => [i.id, i.title]));
    const shortTitle = (value) => (value && value.length > 18 ? `${value.slice(0, 17)}…` : value || "Untitled");

    const reliabilityLabels = {
      supported: "Supported",
      partial: "Partial",
      unsupported: "Unsupported",
      unclear: "Unclear",
    };
    const reliability = Object.keys(reliabilityLabels).map((key) => ({
      name: reliabilityLabels[key],
      key,
      value: claims.filter((c) => c.evidence_status === key).length,
    }));

    const gapSeverity = SEVERITY_ORDER.map((severity) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      key: severity,
      value: gaps.filter((g) => g.severity === severity).length,
    }));

    const contradictionByInvestigation = [...contradictions.reduce((map, c) => {
      const key = c.investigation_id;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map())]
      .map(([id, value]) => ({ name: shortTitle(titleOf.get(id)), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(Date.now() - (13 - index) * DAY);
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
        investigations: 0,
        sources: 0,
      };
    });
    const dayIndex = new Map(days.map((d) => [d.key, d]));
    for (const item of investigations) {
      const bucket = dayIndex.get(String(item.created_date || "").slice(0, 10));
      if (bucket) bucket.investigations += 1;
    }
    for (const item of sources) {
      const bucket = dayIndex.get(String(item.created_date || "").slice(0, 10));
      if (bucket) bucket.sources += 1;
    }

    return {
      stats: {
        investigations: investigations.length,
        active: investigations.filter((i) => i.status === "analyzing").length,
        sources: sources.length,
        analyzedSources: sources.filter((s) => s.status === "analyzed").length,
        gaps: gaps.length,
        contradictions: contradictions.length,
        verification: claims.filter((c) => c.verification_needed).length,
        outdated: 0,
      },
      completeness: investigations
        .filter((i) => i.status === "complete")
        .slice(0, 8)
        .map((i) => ({ name: shortTitle(i.title), value: i.completeness || 0 })),
      reliability,
      gapSeverity,
      contradictionByInvestigation,
      activity: days,
      recent: investigations.slice(0, 5),
    };
  });

export const listSources = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const [sources, investigations] = await Promise.all([
      base44.entities.Source.list({ sort: "-created_date", limit: 200 }).then(asArray),
      base44.entities.Investigation.list({ sort: "-created_date", limit: 100 }).then(asArray),
    ]);
    return {
      sources,
      investigations: investigations.map((i) => ({ id: i.id, title: i.title })),
    };
  });

export const listAllGaps = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const [gaps, investigations] = await Promise.all([
      base44.entities.InfoGap.list({ sort: "-created_date", limit: 300 }).then(asArray),
      base44.entities.Investigation.list({ sort: "-created_date", limit: 100 }).then(asArray),
    ]);
    const titles = new Map(investigations.map((i) => [i.id, i.title]));
    return gaps.map((g) => ({ ...g, investigation_title: titles.get(g.investigation_id) || "Investigation" }));
  });

export const listAllContradictions = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const [contradictions, investigations] = await Promise.all([
      base44.entities.Contradiction.list({ sort: "-created_date", limit: 300 }).then(asArray),
      base44.entities.Investigation.list({ sort: "-created_date", limit: 100 }).then(asArray),
    ]);
    const titles = new Map(investigations.map((i) => [i.id, i.title]));
    return contradictions.map((c) => ({
      ...c,
      investigation_title: titles.get(c.investigation_id) || "Investigation",
    }));
  });