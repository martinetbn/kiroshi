import { createFileRoute } from "@tanstack/react-router";
import { RacesList } from "../components/RacesList";

export const Route = createFileRoute("/races/")({
  component: RacesList,
});
