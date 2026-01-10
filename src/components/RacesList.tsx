import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRaces, useCreateRace, useUpdateRace, useDeleteRace } from "../hooks/useRaces";
import { ContextMenu } from "./ContextMenu";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputModal } from "./InputModal";
import type { Race } from "../types";

export function RacesList() {
  const [scale, setScale] = useState(1);
  const navigate = useNavigate();
  const { data: races, isLoading } = useRaces();
  const createRace = useCreateRace();
  const updateRace = useUpdateRace();
  const deleteRace = useDeleteRace();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [deletingRace, setDeletingRace] = useState<Race | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    race: Race;
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
        } else if (showCreateModal) {
          setShowCreateModal(false);
        } else if (editingRace) {
          setEditingRace(null);
        } else if (deletingRace) {
          setDeletingRace(null);
        } else {
          navigate({ to: "/" });
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
  }, [navigate, contextMenu, showCreateModal, editingRace, deletingRace]);

  const handleContextMenu = (e: React.MouseEvent, race: Race) => {
    e.preventDefault();
    // Calculate position relative to the scaled container
    const rect = (e.currentTarget as HTMLElement).closest('[data-scaled-container]')?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      setContextMenu({ x, y, race });
    }
  };

  const handleCreateRace = async (name: string) => {
    await createRace.mutateAsync(name);
    setShowCreateModal(false);
  };

  const handleUpdateRace = async (name: string) => {
    if (editingRace) {
      await updateRace.mutateAsync({ id: editingRace.id, name });
      setEditingRace(null);
    }
  };

  const handleDeleteRace = async () => {
    if (deletingRace) {
      await deleteRace.mutateAsync(deletingRace.id);
      setDeletingRace(null);
    }
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
            <h1 className="text-white text-[48px] font-bold">Carreras</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white hover:bg-gray-100 text-[#3e61ff] px-8 py-3 text-[24px] font-semibold rounded transition-colors"
            >
              Crear Carrera
            </button>
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
                  onClick={() => navigate({ to: "/races/$raceId", params: { raceId: String(race.id) } })}
                  onContextMenu={(e) => handleContextMenu(e, race)}
                  className="bg-white hover:bg-gray-50 border-4 border-[#3e61ff] p-[30px] cursor-pointer transition-colors"
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
                No hay carreras creadas
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#3e61ff] hover:bg-[#2d4ecc] text-white px-12 py-6 text-[28px] font-semibold rounded transition-colors"
              >
                Crear Primera Carrera
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
                onClick: () => setEditingRace(contextMenu.race),
              },
              {
                label: "Eliminar",
                onClick: () => setDeletingRace(contextMenu.race),
                danger: true,
              },
            ]}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <InputModal
            title="Crear Carrera"
            placeholder="Nombre de la carrera"
            onConfirm={handleCreateRace}
            onCancel={() => setShowCreateModal(false)}
          />
        )}

        {/* Edit Modal */}
        {editingRace && (
          <InputModal
            title="Editar Carrera"
            placeholder="Nombre de la carrera"
            initialValue={editingRace.name}
            onConfirm={handleUpdateRace}
            onCancel={() => setEditingRace(null)}
          />
        )}

        {/* Delete Confirmation */}
        {deletingRace && (
          <ConfirmDialog
            title="Eliminar Carrera"
            message={`¿Estás seguro de que quieres eliminar "${deletingRace.name}"? Esta acción eliminará todos los PCs y referencias asociados.`}
            confirmLabel="Eliminar"
            onConfirm={handleDeleteRace}
            onCancel={() => setDeletingRace(null)}
            danger
          />
        )}
      </div>
    </div>
  );
}
