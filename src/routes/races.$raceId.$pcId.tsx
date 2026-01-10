import { createFileRoute } from "@tanstack/react-router";
import { PCEditor } from "../components/PCEditor";

export const Route = createFileRoute("/races/$raceId/$pcId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { raceId, pcId } = Route.useParams();
  return <PCEditor raceId={Number(raceId)} pcId={Number(pcId)} />;
}
