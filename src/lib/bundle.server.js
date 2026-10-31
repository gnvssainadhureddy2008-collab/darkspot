import { asArray } from "@/lib/shape";

export { asArray };

export async function loadBundle(base44, investigationId) {
  const investigation = await base44.entities.Investigation.get(investigationId);
  if (!investigation) throw new Error("That investigation no longer exists.");
  const [sources, claims, gaps, contradictions, outdated, recommendations] = await Promise.all([
    base44.entities.Source.filter({ investigation_id: investigationId }),
    base44.entities.Claim.filter({ investigation_id: investigationId }),
    base44.entities.InfoGap.filter({ investigation_id: investigationId }),
    base44.entities.Contradiction.filter({ investigation_id: investigationId }),
    base44.entities.OutdatedFinding.filter({ investigation_id: investigationId }),
    base44.entities.Recommendation.filter({ investigation_id: investigationId }),
  ]);
  return {
    investigation,
    sources: asArray(sources),
    claims: asArray(claims),
    gaps: asArray(gaps),
    contradictions: asArray(contradictions),
    outdated: asArray(outdated),
    recommendations: asArray(recommendations),
  };
}