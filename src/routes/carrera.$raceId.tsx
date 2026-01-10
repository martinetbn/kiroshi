import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/carrera/$raceId")({
  component: CarreraRaceLayout,
});

function CarreraRaceLayout() {
  return <Outlet />;
}
