import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRaces } from "../hooks/useRaces";

export function RacesListSelector() {
  const [scale, setScale] = useState(1);
  const navigate = useNavigate();
  const { data: races, isLoading } = useRaces();

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1440;
      const scaleY = window.innerHeight / 1024;
      setScale(Math.min(scaleX, scaleY));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate({ to: "/" });
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#ececec]">
      <div
        data-scaled-container
        className="w-[1440px] h-[1024px] font-['Chivo_Mono',monospace] shrink-0 relative"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Header */}
        <div className="absolute left-[40px] top-[40px] right-[40px]">
          <div className="bg-[#ef3c3c] h-[100px] flex items-center justify-between px-[40px]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ to: "/" })}
                className="text-white text-[32px] hover:opacity-80 transition-opacity"
              >
                &larr;
              </button>
              <h1 className="text-white text-[48px] font-bold">Seleccionar Carrera</h1>
            </div>
          </div>
        </div>

        {/* Races List */}
        <div className="absolute left-[40px] top-[160px] right-[40px] bottom-[40px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-[32px] text-gray-500">Cargando...</span>
            </div>
          ) : races && races.length > 0 ? (
            <div className="grid grid-cols-2 gap-[20px]">
              {races.map((race) => (
                <div
                  key={race.id}
                  onClick={() => navigate({ to: "/carrera/$raceId", params: { raceId: String(race.id) } })}
                  className="bg-white hover:bg-gray-50 border-4 border-[#ef3c3c] p-[30px] cursor-pointer transition-colors"
                >
                  <h2 className="text-[32px] font-bold text-black mb-2">
                    {race.name}
                  </h2>
                  <p className="text-[18px] text-gray-500">
                    Creada: {new Date(race.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <span className="text-[32px] text-gray-500">
                No hay carreras disponibles
              </span>
              <p className="text-[20px] text-gray-400">
                Crea carreras en el modo Carga para poder seleccionarlas aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
