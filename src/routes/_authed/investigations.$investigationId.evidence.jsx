import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import EvidenceTab from "@/components/investigation/EvidenceTab";

export const Route = createFileRoute("/_authed/investigations/$investigationId/evidence")({
  head: () => ({ meta: [{ title: "Evidence — DARKSPOT" }] }),
  component: EvidenceRoute,
});

const parent = getRouteApi("/_authed/investigations/$investigationId");

function EvidenceRoute() {
  const bundle = parent.useLoaderData();
  if (!bundle) return null;
  return <EvidenceTab bundle={bundle} />;
}