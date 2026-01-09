import { createFileRoute } from "@tanstack/react-router";
import { RallyDashboard } from "../components/RallyDashboard";

export const Route = createFileRoute("/carrera")({
  component: Carrera,
});

function Carrera() {
  return <RallyDashboard />;
}
