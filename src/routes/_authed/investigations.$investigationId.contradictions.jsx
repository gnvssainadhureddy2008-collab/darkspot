import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import ContradictionsTab from "@/components/investigation/ContradictionsTab";

export const Route = createFileRoute("/_authed/investigations/$investigationId/contradictions")({
  head: () => ({ meta: [{ title: "Contradictions — DARKSPOT" }] }),
  component: ContradictionsRoute,
});

const parent = getRouteApi("/_authed/investigations/$investigationId");

function ContradictionsRoute() {
  const bundle = parent.useLoaderData();
  if (!bundle) return null;
  return <ContradictionsTab bundle={bundle} />;
}