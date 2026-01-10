import { Link } from "@tanstack/react-router";

export function MainMenu() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] font-['Chivo_Mono',monospace]">
      <h1 className="text-[72px] font-bold text-white mb-16">Kiroshi</h1>

      <div className="flex flex-col gap-6 w-[400px]">
        <Link to="/load">
          <button className="w-full h-[80px] bg-[#3e61ff] hover:bg-[#2d4ecc] text-white text-[32px] font-semibold transition-colors">
            Carga
          </button>
        </Link>

        <Link to="/carrera">
          <button className="w-full h-[80px] bg-[#ef3c3c] hover:bg-[#cc2e2e] text-white text-[32px] font-semibold transition-colors">
            Carrera
          </button>
        </Link>

        <button
          className="h-[80px] bg-[#3e61ff] hover:bg-[#2d4ecc] text-white text-[32px] font-semibold transition-colors"
          disabled
        >
          Análisis
        </button>
      </div>
    </div>
  );
}
