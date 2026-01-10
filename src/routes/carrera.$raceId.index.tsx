import { createFileRoute } from "@tanstack/react-router";
import { PCListSelector } from "../components/PCListSelector";

export const Route = createFileRoute("/carrera/$raceId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { raceId } = Route.useParams();
  return <PCListSelector raceId={Number(raceId)} />;
}
