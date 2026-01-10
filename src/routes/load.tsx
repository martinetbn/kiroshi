import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/load")({
  beforeLoad: () => {
    throw redirect({ to: "/races" });
  },
});
