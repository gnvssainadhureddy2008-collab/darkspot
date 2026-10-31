import { useMemo, useState } from "react";
import { Search, ShieldCheck, ShieldQuestion } from "lucide-react";
import { EmptyState, Panel, StatusBadge } from "@/components/common/Panels";
import { Input } from "@/components/ui/input";

const FILTERS = [
  { key: "all", label: "All claims" },
  { key: "supported", label: "Supported" },
  { key: "partial", label: "Partial" },
  { key: "unsupported", label: "Unsupported" },
  { key: "unclear", label: "Unclear" },
  { key: "verify", label: "Needs verification" },
];

export default function EvidenceTab({ bundle }) {
  const { claims, sources } = bundle;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = { all: claims.length, supported: 0, partial: 0, unsupported: 0, unclear: 0, verify: 0 };
    for (const claim of claims) {
      map[claim.evidence_status] = (map[claim.evidence_status] || 0) + 1;
      if (claim.verification_needed) map.verify += 1;
    }
    return map;
  }, [claims]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return claims.filter((claim) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "verify"
            ? Boolean(claim.verification_needed)
            : claim.evidence_status === filter;
      const matchesQuery =
        !needle ||
        claim.claim_text.toLowerCase().includes(needle) ||
        (claim.source_title || "").toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [claims, filter, query]);

  if (!claims.length) {
    return (
      <Panel>
        <EmptyState
          icon={ShieldQuestion}
          title="No claims extracted yet"
          body="Claims appear once each source has been analysed. Re-run the analysis if sources are stuck at pending."
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                filter === item.key
                  ? "border-primary/35 bg-primary/12 text-foreground"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">{counts[item.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search claims or sources"
            className="h-9 border-white/10 bg-white/[0.03] pl-9 text-xs"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Panel>
          <p className="py-8 text-center text-xs text-muted-foreground">No claims match that filter.</p>
        </Panel>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((claim) => (
            <Panel key={claim.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={claim.evidence_status} />
                {claim.verification_needed && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    <ShieldQuestion className="h-2.5 w-2.5" /> verify
                  </span>
                )}
                {claim.date_reference && (
                  <span className="text-[10px] text-muted-foreground">{claim.date_reference}</span>
                )}
                <span className="ml-auto truncate text-[10px] text-muted-foreground">
                  {claim.source_title}
                </span>
              </div>

              <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">{claim.claim_text}</p>

              {claim.evidence_note && (
                <div className="mt-2.5 flex gap-2">
                  <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{claim.evidence_note}</p>
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        {claims.length} claims extracted from {sources.filter((s) => s.status === "analyzed").length} analysed sources
      </p>
    </div>
  );
}