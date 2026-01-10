import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/carrera")({
  component: CarreraLayout,
});

function CarreraLayout() {
  return <Outlet />;
}
