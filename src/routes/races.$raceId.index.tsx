import { createFileRoute } from "@tanstack/react-router";
import { PCList } from "../components/PCList";

export const Route = createFileRoute("/races/$raceId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { raceId } = Route.useParams();
  return <PCList raceId={Number(raceId)} />;
}
