import { useEffect, useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRace } from "../hooks/useRaces";
import { usePC, useGetNextPC, useCreateNextPC } from "../hooks/usePCs";
import {
  useReferencesByPC,
  useCreateReference,
  useUpdateReference,
  useDeleteReference,
  useToggleControlZone,
} from "../hooks/useReferences";
import { ContextMenu } from "./ContextMenu";
import { ConfirmDialog } from "./ConfirmDialog";
import type { EventType, ReferenceEntry } from "../types";

interface PCEditorProps {
  raceId: number;
  pcId: number;
}

const EVENT_TYPES: { type: EventType; label: string; description: string }[] = [
  { type: "LAR", label: "LAR", description: "Largada" },
  { type: "REF", label: "REF", description: "Referencia" },
  { type: "ADL", label: "ADL", description: "Adelanto" },
  { type: "ATR", label: "ATR", description: "Atraso" },
  { type: "CVT", label: "CVT", description: "Cambio Velocidad por Tiempo" },
  { type: "CVD", label: "CVD", description: "Cambio Velocidad por Distancia" },
  { type: "CVR", label: "CVR", description: "Cambio Velocidad por Referencia" },
];

const EXTRA_INPUT_CONFIG: Record<string, { label: string; placeholder: string; unit: string }> = {
  ADL: { label: "Segundos a Adelantar", placeholder: "Ej: 30", unit: "segundos" },
  ATR: { label: "Segundos a Atrasar", placeholder: "Ej: 15", unit: "segundos" },
  CVD: { label: "Distancia", placeholder: "Ej: 2.5", unit: "km" },
};

export function PCEditor({ raceId, pcId }: PCEditorProps) {
  const [scale, setScale] = useState(1);
  const navigate = useNavigate();
  const { data: race } = useRace(raceId);
  const { data: pc } = usePC(pcId);
  const { data: references, refetch: refetchReferences } = useReferencesByPC(pcId);
  const createReference = useCreateReference();
  const updateReference = useUpdateReference();
  const deleteReference = useDeleteReference();
  const toggleControlZone = useToggleControlZone();
  const getNextPC = useGetNextPC();
  const createNextPC = useCreateNextPC();

  // Form state - unified time input
  const [timeInput, setTimeInput] = useState("");
  const [eventType, setEventType] = useState<EventType>("REF");
  const [speedInput, setSpeedInput] = useState("50");
  const [extraValue, setExtraValue] = useState("");
  const timeInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [editingRef, setEditingRef] = useState<ReferenceEntry | null>(null);
  const [deletingRef, setDeletingRef] = useState<ReferenceEntry | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    ref: ReferenceEntry;
  } | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showExtraInputModal, setShowExtraInputModal] = useState(false);
  const [pendingEventType, setPendingEventType] = useState<EventType | null>(null);

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
        } else if (showEventModal) {
          setShowEventModal(false);
        } else if (showExtraInputModal) {
          setShowExtraInputModal(false);
          setPendingEventType(null);
        } else if (deletingRef) {
          setDeletingRef(null);
        } else {
          navigate({
            to: "/races/$raceId",
            params: { raceId: String(raceId) },
          });
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
  }, [navigate, raceId, contextMenu, showEventModal, showExtraInputModal, deletingRef]);

  // Set default event type based on references
  useEffect(() => {
    if (references && references.length === 0) {
      setEventType("LAR");
    } else if (!editingRef) {
      setEventType("REF");
    }
  }, [references, editingRef]);

  // Load reference data into form when editing
  useEffect(() => {
    if (editingRef) {
      const h = String(editingRef.hours).padStart(2, "0");
      const m = String(editingRef.minutes).padStart(2, "0");
      const s = String(editingRef.seconds).padStart(2, "0");
      const cc = String(editingRef.centiseconds).padStart(2, "0");
      setTimeInput(`${h}${m}${s}${cc}`);
      setEventType(editingRef.event_type as EventType);
      setSpeedInput(String(editingRef.speed));
      setExtraValue(editingRef.extra_value?.toString() || "");
    }
  }, [editingRef]);

  // Parse time input into components
  const parseTimeInput = (input: string) => {
    const padded = input.padEnd(8, "0");
    return {
      hours: parseInt(padded.slice(0, 2)) || 0,
      minutes: Math.min(59, parseInt(padded.slice(2, 4)) || 0),
      seconds: Math.min(59, parseInt(padded.slice(4, 6)) || 0),
      centiseconds: Math.min(99, parseInt(padded.slice(6, 8)) || 0),
    };
  };

  // Format time input for display
  const formatTimeDisplay = (input: string) => {
    const padded = input.padEnd(8, " ");
    const h = padded.slice(0, 2);
    const m = padded.slice(2, 4);
    const s = padded.slice(4, 6);
    const cc = padded.slice(6, 8);
    return `${h}:${m}:${s}:${cc}`.replace(/ /g, "_");
  };

  // Check if form is valid for saving
  const isFormValid = () => {
    if (timeInput.length !== 8) return false;
    const speed = parseInt(speedInput);
    if (isNaN(speed) || speed < 0) return false;
    if (needsExtraInput && !extraValue) return false;
    return true;
  };

  const resetForm = () => {
    setTimeInput("");
    setEventType(references && references.length === 0 ? "LAR" : "REF");
    // Keep the speed value for the next reference
    setExtraValue("");
    setEditingRef(null);
    timeInputRef.current?.focus();
  };

  const handleTimeInputChange = (value: string) => {
    // Only allow digits, max 8 characters
    const cleaned = value.replace(/\D/g, "").slice(0, 8);
    setTimeInput(cleaned);
  };

  const handleEventSelect = (type: EventType) => {
    if (EXTRA_INPUT_CONFIG[type]) {
      setPendingEventType(type);
      setShowEventModal(false);
      setShowExtraInputModal(true);
    } else {
      setEventType(type);
      setExtraValue("");
      setShowEventModal(false);
    }
  };

  const handleExtraInputConfirm = (value: string) => {
    if (pendingEventType) {
      setEventType(pendingEventType);
      setExtraValue(value);
      setPendingEventType(null);
    }
    setShowExtraInputModal(false);
  };

  const needsExtraInput = eventType === "ADL" || eventType === "ATR" || eventType === "CVD";

  // Speed can only be changed on first reference or speed change events
  const canEditSpeed =
    !references ||
    references.length === 0 ||
    eventType === "CVT" ||
    eventType === "CVD" ||
    eventType === "CVR";

  const handleContextMenu = (e: React.MouseEvent, ref: ReferenceEntry) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement)
      .closest("[data-scaled-container]")
      ?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      setContextMenu({ x, y, ref });
    }
  };

  const handleSaveReference = async () => {
    if (!isFormValid()) return;

    const { hours, minutes, seconds, centiseconds } = parseTimeInput(timeInput);
    const speed = parseInt(speedInput) || 0;
    const extra = extraValue ? parseFloat(extraValue) : undefined;

    if (editingRef) {
      await updateReference.mutateAsync({
        id: editingRef.id,
        hours,
        minutes,
        seconds,
        centiseconds,
        event_type: eventType,
        speed,
        extra_value: extra,
      });
    } else {
      await createReference.mutateAsync({
        pc_id: pcId,
        hours,
        minutes,
        seconds,
        centiseconds,
        event_type: eventType,
        speed,
        extra_value: extra,
      });
    }

    resetForm();
    refetchReferences();
  };

  const handleNextPC = async () => {
    // First, save current reference if form has valid data
    if (isFormValid()) {
      await handleSaveReference();
    }

    // Check if next PC exists
    const nextPC = await getNextPC.mutateAsync(pcId);

    if (nextPC) {
      navigate({
        to: "/races/$raceId/$pcId",
        params: { raceId: String(raceId), pcId: String(nextPC.id) },
      });
    } else {
      // Create new PC
      const newPC = await createNextPC.mutateAsync(pcId);
      navigate({
        to: "/races/$raceId/$pcId",
        params: { raceId: String(raceId), pcId: String(newPC.id) },
      });
    }
  };

  const handleDeleteReference = async () => {
    if (deletingRef) {
      await deleteReference.mutateAsync(deletingRef.id);
      setDeletingRef(null);
      refetchReferences();
    }
  };

  const handleToggleControlZone = async (ref: ReferenceEntry) => {
    await toggleControlZone.mutateAsync(ref.id);
    refetchReferences();
  };

  const formatTime = (h: number, m: number, s: number, cc: number) => {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(cc).padStart(2, "0")}`;
  };

  const formatInfo = (ref: ReferenceEntry) => {
    const parts: string[] = [];

    if (ref.event_type === "ADL" && ref.extra_value) {
      parts.push(`+${ref.extra_value}s`);
    } else if (ref.event_type === "ATR" && ref.extra_value) {
      parts.push(`-${ref.extra_value}s`);
    } else if (ref.event_type === "CVD" && ref.extra_value) {
      parts.push(`${ref.extra_value}km`);
    }

    if (ref.is_control_zone) {
      parts.push("ZC");
    }

    return parts.length > 0 ? parts.join(" ") : "-";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#ececec]">
      <div
        data-scaled-container
        className="w-[1440px] h-[1024px] font-['Chivo_Mono',monospace] shrink-0 relative"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Left Panel */}
        <div className="absolute left-[40px] top-[40px] w-[620px] h-[944px] flex flex-col justify-between">
          {/* Event Name & PC */}
          <div className="flex gap-[20px] h-[166px]">
            {/* Event Name Box */}
            <div
              onClick={() =>
                navigate({
                  to: "/races/$raceId",
                  params: { raceId: String(raceId) },
                })
              }
              className="bg-[#3e61ff] w-[400px] h-full flex items-center justify-center cursor-pointer hover:bg-[#2d4ecc] transition-colors"
            >
              <p className="text-white text-[36px] font-semibold text-center leading-tight">
                {race?.name || "Cargando..."}
              </p>
            </div>

            {/* PC Box */}
            <div
              onClick={() =>
                navigate({
                  to: "/races/$raceId",
                  params: { raceId: String(raceId) },
                })
              }
              className="w-[200px] h-full flex flex-col cursor-pointer group"
            >
              <div className="bg-[#ef3c3c] group-hover:bg-[#cc2e2e] h-[60px] flex items-center justify-center shrink-0 transition-colors">
                <span className="text-white text-[28px] font-semibold">PC</span>
              </div>
              <div className="flex-1 bg-[#ececec] h-[90px] flex items-center justify-center">
                <span className="text-black text-[80px] font-bold">
                  {pc?.pc_number || "-"}
                </span>
              </div>
              <div className="h-[6px] bg-[#ef3c3c] group-hover:bg-[#cc2e2e] shrink-0 transition-colors" />
            </div>
          </div>

          {/* Time Display - Unified Input */}
          <div className="flex flex-col">
            {/* Labels */}
            <div className="flex">
              <div className="w-[155px] h-[80px] bg-[#3e61ff] flex items-center justify-center">
                <span className="text-white text-[48px] font-bold">h</span>
              </div>
              <div className="w-[155px] h-[80px] bg-[#d9d9d9] flex items-center justify-center">
                <span className="text-black text-[48px] font-bold">m</span>
              </div>
              <div className="w-[155px] h-[80px] bg-[#d9d9d9] flex items-center justify-center">
                <span className="text-black text-[48px] font-bold">s</span>
              </div>
              <div className="w-[155px] h-[80px] bg-[#ef3c3c] flex items-center justify-center">
                <span className="text-white text-[48px] font-bold">cc</span>
              </div>
            </div>
            {/* Unified time display */}
            <div className="h-[140px] bg-[#ececec] flex items-center justify-center">
              <span className="text-black text-[80px] font-bold tracking-[0.1em]">
                {formatTimeDisplay(timeInput)}
              </span>
            </div>
            {/* Hidden input for typing */}
            <input
              ref={timeInputRef}
              type="text"
              value={timeInput}
              onChange={(e) => handleTimeInputChange(e.target.value)}
              className="sr-only"
              autoFocus
            />
            {/* Color bar */}
            <div className="flex">
              <div className="w-[155px] h-[6px] bg-[#3e61ff]" />
              <div className="w-[155px] h-[6px] bg-[#d9d9d9]" />
              <div className="w-[155px] h-[6px] bg-[#d9d9d9]" />
              <div className="w-[155px] h-[6px] bg-[#ef3c3c]" />
            </div>
            {/* Click area to focus input */}
            <div
              onClick={() => timeInputRef.current?.focus()}
              className="absolute top-[246px] left-[40px] w-[620px] h-[226px] cursor-text"
            />
          </div>

          {/* Event & Speed */}
          <div className="flex gap-[20px]">
            {/* Event */}
            <div className="w-[300px]">
              <div className="bg-[#3e61ff] h-[60px] flex items-center justify-center">
                <span className="text-white text-[28px] font-semibold">Evento</span>
              </div>
              <div
                onClick={() => setShowEventModal(true)}
                className="h-[150px] bg-[#ececec] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <span className="text-black text-[64px] font-bold">{eventType}</span>
                {needsExtraInput && extraValue && (
                  <span className="text-[#ef3c3c] text-[24px] font-semibold">
                    {eventType === "CVD" ? `${extraValue} km` : `${extraValue} seg`}
                  </span>
                )}
              </div>
              <div className="h-[6px] bg-[#3e61ff]" />
            </div>

            {/* Speed */}
            <div className="w-[300px]">
              <div className={`h-[60px] flex items-center justify-center ${canEditSpeed ? "bg-[#ef3c3c]" : "bg-gray-400"}`}>
                <span className="text-white text-[28px] font-semibold">KM/h</span>
              </div>
              <div className={`h-[150px] flex items-center justify-center ${canEditSpeed ? "bg-[#ececec]" : "bg-gray-200"}`}>
                <input
                  type="text"
                  value={speedInput}
                  onChange={(e) => {
                    if (!canEditSpeed) return;
                    const val = e.target.value.replace(/\D/g, "");
                    setSpeedInput(val);
                  }}
                  disabled={!canEditSpeed}
                  placeholder="50"
                  className={`w-full h-full text-center text-[80px] font-bold bg-transparent outline-none ${
                    canEditSpeed ? "text-black" : "text-gray-500 cursor-not-allowed"
                  }`}
                />
              </div>
              <div className={`h-[6px] ${canEditSpeed ? "bg-[#ef3c3c]" : "bg-gray-400"}`} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-[20px]">
            <button
              onClick={handleSaveReference}
              disabled={!isFormValid()}
              className={`w-[300px] h-[160px] text-white text-[32px] font-semibold transition-colors leading-tight whitespace-pre-line ${
                isFormValid()
                  ? "bg-[#3e61ff] hover:bg-[#2d4ecc]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {editingRef ? "Actualizar\nReferencia" : "Guardar\nReferencia"}
            </button>
            <button
              onClick={handleNextPC}
              className="w-[300px] h-[160px] bg-[#ef3c3c] hover:bg-[#cc2e2e] text-white text-[32px] font-semibold transition-colors"
            >
              Proximo PC
            </button>
          </div>
        </div>

        {/* Right Panel - Route Sheet */}
        <div className="absolute right-[40px] top-[40px] w-[700px] h-[944px]">
          {/* Header */}
          <div className="bg-[#ef3c3c] h-[70px] flex items-center justify-center">
            <span className="text-white text-[32px] font-semibold">Hoja de Ruta</span>
          </div>

          {/* Table */}
          <div className="bg-black h-[874px] text-white text-[28px] font-medium p-[30px] overflow-y-auto leading-relaxed flex flex-col">
            {/* Header row */}
            <div className="flex gap-[30px] whitespace-nowrap py-[8px]">
              <span className="w-[200px]">hs:mn:sg:cc</span>
              <span className="w-[90px]">km/h</span>
              <span className="w-[100px]">Evento</span>
              <span className="w-[120px]">Info</span>
            </div>

            {/* Data rows */}
            {references?.map((ref, index) => (
              <div
                key={ref.id}
                onClick={() => setHighlightedRow(highlightedRow === index ? null : index)}
                onContextMenu={(e) => handleContextMenu(e, ref)}
                className={`flex gap-[30px] whitespace-nowrap py-[8px] -mx-[30px] px-[30px] cursor-pointer ${
                  highlightedRow === index ? "bg-[#3e61ff]" : "hover:bg-[#333]"
                }`}
              >
                <span className="w-[200px]">
                  {formatTime(ref.hours, ref.minutes, ref.seconds, ref.centiseconds)}
                </span>
                <span className="w-[90px]">{ref.speed}</span>
                <span className="w-[100px]">{ref.event_type}</span>
                <span className="w-[120px]">{formatInfo(ref)}</span>
              </div>
            ))}

            {(!references || references.length === 0) && (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                No hay referencias
              </div>
            )}
          </div>
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
                onClick: () => setEditingRef(contextMenu.ref),
              },
              {
                label: "Eliminar",
                onClick: () => setDeletingRef(contextMenu.ref),
                danger: true,
              },
              {
                label: contextMenu.ref.is_control_zone
                  ? "Quitar Zona de Control"
                  : "Marcar como Zona de Control",
                onClick: () => handleToggleControlZone(contextMenu.ref),
              },
            ]}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Delete Confirmation */}
        {deletingRef && (
          <ConfirmDialog
            title="Eliminar Referencia"
            message={`¿Estás seguro de que quieres eliminar esta referencia (${deletingRef.event_type})?`}
            confirmLabel="Eliminar"
            onConfirm={handleDeleteReference}
            onCancel={() => setDeletingRef(null)}
            danger
          />
        )}

        {/* Event Selection Modal */}
        {showEventModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[600px] shadow-2xl">
              <div className="bg-[#3e61ff] h-[80px] flex items-center justify-center">
                <span className="text-white text-[36px] font-bold">Seleccionar Evento</span>
              </div>
              <div className="p-[20px] flex flex-col gap-[10px]">
                {EVENT_TYPES.map((event) => (
                  <button
                    key={event.type}
                    onClick={() => handleEventSelect(event.type)}
                    className={`w-full py-[20px] px-[30px] flex items-center justify-between text-left transition-colors ${
                      eventType === event.type
                        ? "bg-[#3e61ff] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-black"
                    }`}
                  >
                    <span className="text-[36px] font-bold">{event.label}</span>
                    <span className={`text-[20px] ${eventType === event.type ? "text-white/80" : "text-gray-500"}`}>
                      {event.description}
                    </span>
                  </button>
                ))}
              </div>
              <div className="p-[20px] pt-0">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="w-full py-[20px] bg-gray-300 hover:bg-gray-400 text-black text-[28px] font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extra Input Modal */}
        {showExtraInputModal && pendingEventType && EXTRA_INPUT_CONFIG[pendingEventType] && (
          <ExtraInputModal
            config={EXTRA_INPUT_CONFIG[pendingEventType]}
            eventType={pendingEventType}
            onConfirm={handleExtraInputConfirm}
            onCancel={() => {
              setShowExtraInputModal(false);
              setPendingEventType(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Extra Input Modal Component
function ExtraInputModal({
  config,
  eventType,
  onConfirm,
  onCancel,
}: {
  config: { label: string; placeholder: string; unit: string };
  eventType: EventType;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (value.trim()) {
      onConfirm(value);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] shadow-2xl overflow-hidden">
        <div className="bg-[#ef3c3c] h-[80px] flex items-center justify-center">
          <span className="text-white text-[36px] font-bold">{eventType}</span>
        </div>
        <div className="p-[30px]">
          <p className="text-[24px] text-gray-600 mb-[20px] text-center">{config.label}</p>
          <div className="flex items-center gap-[15px]">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") onCancel();
              }}
              placeholder={config.placeholder}
              className="flex-1 min-w-0 h-[80px] text-center text-[48px] font-bold border-4 border-[#ef3c3c] outline-none box-border"
            />
            <span className="text-[28px] font-semibold text-gray-500 shrink-0">{config.unit}</span>
          </div>
        </div>
        <div className="p-[30px] pt-0 flex gap-[20px]">
          <button
            onClick={onCancel}
            className="flex-1 py-[20px] bg-gray-300 hover:bg-gray-400 text-black text-[28px] font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`flex-1 py-[20px] text-white text-[28px] font-semibold transition-colors ${
              value.trim() ? "bg-[#3e61ff] hover:bg-[#2d4ecc]" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
