import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/races/$raceId")({
  component: RaceIdLayout,
});

function RaceIdLayout() {
  return <Outlet />;
}
