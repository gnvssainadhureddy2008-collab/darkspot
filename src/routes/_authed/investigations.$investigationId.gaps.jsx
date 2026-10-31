import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import GapsTab from "@/components/investigation/GapsTab";

export const Route = createFileRoute("/_authed/investigations/$investigationId/gaps")({
  head: () => ({ meta: [{ title: "Information gaps — DARKSPOT" }] }),
  component: GapsRoute,
});

const parent = getRouteApi("/_authed/investigations/$investigationId");

function GapsRoute() {
  const bundle = parent.useLoaderData();
  if (!bundle) return null;
  return <GapsTab bundle={bundle} />;
}