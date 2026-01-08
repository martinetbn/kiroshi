import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-white">
      <h1 className="mb-8 text-4xl font-bold">Welcome to Kiroshi</h1>
      <p className="mb-8 text-gray-400">
        Tauri + React + Tailwind + TanStack Router + TanStack Query
      </p>

      <form
        className="flex flex-col items-center gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          type="text"
          placeholder="Enter a name..."
          className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold transition-colors hover:bg-blue-700"
        >
          Greet
        </button>
      </form>

      {greetMsg && (
        <p className="mt-8 text-xl text-green-400">{greetMsg}</p>
      )}
    </main>
  );
}
