import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRace, useUpdateRace } from "../hooks/useRaces";
import { usePCsByRace, useCreatePC, useDeletePC } from "../hooks/usePCs";
import { ContextMenu } from "./ContextMenu";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputModal } from "./InputModal";
import type { PC } from "../types";

interface PCListProps {
  raceId: number;
}

export function PCList({ raceId }: PCListProps) {
  const [scale, setScale] = useState(1);
  const navigate = useNavigate();
  const { data: race } = useRace(raceId);
  const { data: pcs, isLoading } = usePCsByRace(raceId);
  const createPC = useCreatePC();
  const deletePC = useDeletePC();
  const updateRace = useUpdateRace();

  const [editingRaceName, setEditingRaceName] = useState(false);
  const [deletingPC, setDeletingPC] = useState<PC | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    pc: PC;
  } | null>(null);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1440;
      const scaleY = window.innerHeight / 1024;
      setScale(Math.min(scaleX, scaleY));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (contextMenu) {
          setContextMenu(null);
        } else if (editingRaceName) {
          setEditingRaceName(false);
        } else if (deletingPC) {
          setDeletingPC(null);
        } else {
          navigate({ to: "/races" });
        }
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, contextMenu, editingRaceName, deletingPC]);

  const handleContextMenu = (e: React.MouseEvent, pc: PC) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement)
      .closest("[data-scaled-container]")
      ?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      setContextMenu({ x, y, pc });
    }
  };

  const handleCreatePC = async () => {
    const newPC = await createPC.mutateAsync(raceId);
    navigate({
      to: "/races/$raceId/$pcId",
      params: { raceId: String(raceId), pcId: String(newPC.id) },
    });
  };

  const handleDeletePC = async () => {
    if (deletingPC) {
      await deletePC.mutateAsync(deletingPC.id);
      setDeletingPC(null);
    }
  };

  const handleUpdateRaceName = async (name: string) => {
    await updateRace.mutateAsync({ id: raceId, name });
    setEditingRaceName(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#ececec]">
      <div
        data-scaled-container
        className="w-[1440px] h-[1024px] font-['Chivo_Mono',monospace] shrink-0 relative"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Header */}
        <div className="absolute left-[40px] top-[40px] right-[40px]">
          <div className="bg-[#3e61ff] h-[100px] flex items-center justify-between px-[40px]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ to: "/races" })}
                className="text-white text-[32px] hover:opacity-80 transition-opacity"
              >
                &larr;
              </button>
              <h1
                onClick={() => setEditingRaceName(true)}
                className="text-white text-[48px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
                title="Click para editar nombre"
              >
                {race?.name || "Cargando..."}
              </h1>
            </div>
            <button
              onClick={handleCreatePC}
              className="bg-white hover:bg-gray-100 text-[#3e61ff] px-8 py-3 text-[24px] font-semibold rounded transition-colors"
            >
              Crear PC
            </button>
          </div>
        </div>

        {/* PC List */}
        <div className="absolute left-[40px] top-[160px] right-[40px] bottom-[40px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-[32px] text-gray-500">Cargando...</span>
            </div>
          ) : pcs && pcs.length > 0 ? (
            <div className="grid grid-cols-4 gap-[20px]">
              {pcs.map((pc) => (
                <div
                  key={pc.id}
                  onClick={() =>
                    navigate({
                      to: "/races/$raceId/$pcId",
                      params: { raceId: String(raceId), pcId: String(pc.id) },
                    })
                  }
                  onContextMenu={(e) => handleContextMenu(e, pc)}
                  className="bg-white hover:bg-gray-50 border-4 border-[#ef3c3c] p-[30px] cursor-pointer transition-colors flex flex-col items-center justify-center"
                >
                  <span className="text-[20px] text-[#ef3c3c] font-semibold mb-2">
                    PC
                  </span>
                  <span className="text-[64px] font-bold text-black">
                    {pc.pc_number}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <span className="text-[32px] text-gray-500">No hay PCs</span>
              <button
                onClick={handleCreatePC}
                className="bg-[#ef3c3c] hover:bg-[#cc2e2e] text-white px-12 py-6 text-[28px] font-semibold rounded transition-colors"
              >
                Crear Primer PC
              </button>
            </div>
          )}
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            scale={scale}
            items={[
              {
                label: "Editar",
                onClick: () =>
                  navigate({
                    to: "/races/$raceId/$pcId",
                    params: {
                      raceId: String(raceId),
                      pcId: String(contextMenu.pc.id),
                    },
                  }),
              },
              {
                label: "Eliminar",
                onClick: () => setDeletingPC(contextMenu.pc),
                danger: true,
              },
            ]}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Edit Race Name Modal */}
        {editingRaceName && race && (
          <InputModal
            title="Editar Carrera"
            placeholder="Nombre de la carrera"
            initialValue={race.name}
            onConfirm={handleUpdateRaceName}
            onCancel={() => setEditingRaceName(false)}
          />
        )}

        {/* Delete Confirmation */}
        {deletingPC && (
          <ConfirmDialog
            title="Eliminar PC"
            message={`¿Estás seguro de que quieres eliminar PC ${deletingPC.pc_number}? Esta acción eliminará todas las referencias asociadas.`}
            confirmLabel="Eliminar"
            onConfirm={handleDeletePC}
            onCancel={() => setDeletingPC(null)}
            danger
          />
        )}
      </div>
    </div>
  );
}
