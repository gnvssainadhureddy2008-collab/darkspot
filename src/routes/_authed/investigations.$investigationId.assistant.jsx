import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import AssistantTab from "@/components/investigation/AssistantTab";

export const Route = createFileRoute("/_authed/investigations/$investigationId/assistant")({
  head: () => ({ meta: [{ title: "Assistant — DARKSPOT" }] }),
  component: AssistantRoute,
});

const parent = getRouteApi("/_authed/investigations/$investigationId");

function AssistantRoute() {
  const bundle = parent.useLoaderData();
  if (!bundle) return null;
  return <AssistantTab bundle={bundle} />;
}