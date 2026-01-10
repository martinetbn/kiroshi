import { createFileRoute } from "@tanstack/react-router";
import { RallyDashboard } from "../components/RallyDashboard";

export const Route = createFileRoute("/carrera/$raceId/$pcId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { raceId, pcId } = Route.useParams();
  return <RallyDashboard raceId={Number(raceId)} pcId={Number(pcId)} />;
}
