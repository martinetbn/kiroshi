import { createFileRoute } from "@tanstack/react-router";
import { RallyDashboard } from "../components/RallyDashboard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <RallyDashboard />;
}
