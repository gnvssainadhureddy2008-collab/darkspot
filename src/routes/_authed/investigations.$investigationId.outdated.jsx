import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import OutdatedTab from "@/components/investigation/OutdatedTab";

export const Route = createFileRoute("/_authed/investigations/$investigationId/outdated")({
  head: () => ({ meta: [{ title: "Outdated findings — DARKSPOT" }] }),
  component: OutdatedRoute,
});

const parent = getRouteApi("/_authed/investigations/$investigationId");

function OutdatedRoute() {
  const bundle = parent.useLoaderData();
  if (!bundle) return null;
  return <OutdatedTab bundle={bundle} />;
}