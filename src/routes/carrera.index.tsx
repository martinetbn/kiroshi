import { createFileRoute } from "@tanstack/react-router";
import { RacesListSelector } from "../components/RacesListSelector";

export const Route = createFileRoute("/carrera/")({
  component: RacesListSelector,
});
