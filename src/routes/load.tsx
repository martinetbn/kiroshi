import { createFileRoute } from "@tanstack/react-router";
import { LoadData } from "../components/LoadData";

export const Route = createFileRoute("/load")({
  component: Load,
});

function Load() {
  return <LoadData />;
}
