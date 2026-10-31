import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import SummaryTab from "@/components/investigation/SummaryTab";

export const Route = createFileRoute("/_authed/investigations/$investigationId/")({
  head: () => ({ meta: [{ title: "Summary — DARKSPOT" }] }),
  component: SummaryRoute,
});

const parent = getRouteApi("/_authed/investigations/$investigationId");

function SummaryRoute() {
  const bundle = parent.useLoaderData();
  if (!bundle) return null;
  return <SummaryTab bundle={bundle} />;
}