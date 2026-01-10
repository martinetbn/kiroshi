import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePC } from "../hooks/usePCs";
import { useReferencesByPC } from "../hooks/useReferences";
import { useRace } from "../hooks/useRaces";
import type { ReferenceEntry } from "../types";

interface RallyDashboardProps {
  raceId: number;
  pcId: number;
}

export function RallyDashboard({ raceId, pcId }: RallyDashboardProps) {
  const [scale, setScale] = useState(1);
  const navigate = useNavigate();

  // Load data
  const { data: _race } = useRace(raceId);
  const { data: pc } = usePC(pcId);
  const { data: references, isLoading } = useReferencesByPC(pcId);

  // Current reference index (0-based, used for highlighting and speed display)
  const [currentIndex, setCurrentIndex] = useState(0);

  // For highlighting rows (1-based)
  const highlightedRow = currentIndex + 1;

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1440;
      const scaleY = window.innerHeight / 1024;
      setScale(Math.min(scaleX, scaleY));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate({ to: "/carrera/$raceId", params: { raceId: String(raceId) } });
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setCurrentIndex((prev) => {
          const maxIndex = (references?.length ?? 1) - 1;
          return prev < maxIndex ? prev + 1 : prev;
        });
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, raceId, references?.length]);

  // Helper to format time
  const formatTime = (ref: ReferenceEntry) => {
    const h = String(ref.hours).padStart(2, "0");
    const m = String(ref.minutes).padStart(2, "0");
    const s = String(ref.seconds).padStart(2, "0");
    const c = String(ref.centiseconds).padStart(2, "0");
    return `${h}:${m}:${s}:${c}`;
  };

  // Get the reference data for display
  const referenceRows = references?.map((ref) => ({
    time: formatTime(ref),
    vel: String(ref.speed),
    evt: ref.event_type,
    det: ref.is_control_zone ? "ZC" : "-",
  })) || [];

  // Build list of speed changes (only when speed differs from previous)
  const speedChanges = references?.reduce<{ speed: number; startIndex: number }[]>(
    (acc, ref, index) => {
      if (index === 0 || ref.speed !== references[index - 1].speed) {
        acc.push({ speed: ref.speed, startIndex: index });
      }
      return acc;
    },
    []
  ) ?? [];

  // Find which speed change segment the current index belongs to
  const currentSpeedChangeIndex = speedChanges.findIndex((change, i) => {
    const nextChange = speedChanges[i + 1];
    return currentIndex >= change.startIndex &&
           (nextChange === undefined || currentIndex < nextChange.startIndex);
  });

  // Get speed at a specific speed change index
  const getSpeedChangeAt = (changeIndex: number): string | null => {
    if (changeIndex < 0 || changeIndex >= speedChanges.length) return null;
    return String(speedChanges[changeIndex].speed);
  };

  // Display speeds: 1 before, current, 2 after (based on speed changes, not references)
  const speedsBefore = getSpeedChangeAt(currentSpeedChangeIndex - 1);
  const speedCurrent = getSpeedChangeAt(currentSpeedChangeIndex);
  const speedAfter1 = getSpeedChangeAt(currentSpeedChangeIndex + 1);
  const speedAfter2 = getSpeedChangeAt(currentSpeedChangeIndex + 2);


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#ececec]">
      <div
        className="w-[1440px] h-[1024px] font-['Chivo_Mono',monospace] shrink-0"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Computadora Section - Top Left */}
        <div className="absolute left-0 top-0 w-[436px] h-[344px] text-center">
          <p className="absolute left-1/2 -translate-x-1/2 top-[34px] text-[36px] font-medium text-black">
            Computadora
          </p>
          <p className="absolute left-[74.5px] -translate-x-1/2 top-[127px] text-[128px] font-bold text-black">
            1
          </p>
          <p className="absolute left-[208.5px] -translate-x-1/2 top-[99px] text-[175px] font-bold text-[#3e61ff]">
            5
          </p>
          <p className="absolute left-[351.5px] -translate-x-1/2 top-[127px] text-[128px] font-bold text-[#ef3c3c]">
            3
          </p>
        </div>

        {/* Status Section - Top Center (Red) */}
        <div className="absolute left-[436px] top-0 w-[568px] h-[344px] bg-[#ef3c3c] text-center text-white overflow-hidden">
          <p className="absolute left-1/2 -translate-x-1/2 top-[32px] text-[48px] font-semibold">
            ATRASADO
          </p>
          <p className="absolute left-1/2 -translate-x-1/2 top-[90px] text-[175px] font-extrabold">
            10,1
          </p>
        </div>

        {/* Auto Section - Top Right */}
        <div className="absolute left-[1004px] top-0 w-[436px] h-[344px] text-center">
          <p className="absolute left-1/2 -translate-x-1/2 top-[34px] text-[36px] font-medium text-black">
            Auto
          </p>
          <p className="absolute left-[74.5px] -translate-x-1/2 top-[127px] text-[128px] font-bold text-black">
            1
          </p>
          <p className="absolute left-[208.5px] -translate-x-1/2 top-[99px] text-[175px] font-bold text-[#3e61ff]">
            5
          </p>
          <p className="absolute left-[353.5px] -translate-x-1/2 top-[127px] text-[128px] font-bold text-[#ef3c3c]">
            2
          </p>
        </div>

        {/* Speed Values Section */}
        <div className="absolute left-[436px] top-[344px] w-[568px] h-[102px] text-center">
          {/* Previous speed */}
          <p className="absolute left-[188px] -translate-x-1/2 top-[29px] text-[36px] font-medium text-black/30">
            {speedsBefore ?? ""}
          </p>
          {/* Current speed (highlighted) */}
          <p className="absolute left-[283px] -translate-x-1/2 top-[22px] text-[48px] font-bold text-black">
            {speedCurrent ?? "-"}
          </p>
          {/* Next speed */}
          <p className="absolute left-[378px] -translate-x-1/2 top-[29px] text-[36px] font-medium text-black/50">
            {speedAfter1 ?? ""}
          </p>
          {/* Speed after next */}
          <p className="absolute left-[463px] -translate-x-1/2 top-[29px] text-[36px] font-medium text-black/30">
            {speedAfter2 ?? ""}
          </p>
        </div>

        {/* Coefficient Bars */}
        <div className="absolute left-[436px] top-[446px] w-[284px] h-[66px] bg-[#ef3c3c]" />
        <div className="absolute left-[720px] top-[446px] w-[284px] h-[66px] bg-black" />
        <p className="absolute left-[588px] -translate-x-1/2 top-[457px] text-[36px] font-semibold text-white text-center">
          1052.32
        </p>
        <p className="absolute left-[860px] -translate-x-1/2 top-[457px] text-[36px] font-semibold text-white text-center">
          1051.75
        </p>

        {/* Distance Display */}
        <div className="absolute left-[436px] top-[512px] w-[568px] h-[233px] text-center text-black font-medium overflow-hidden">
          <p className="absolute left-[183px] -translate-x-1/2 top-[33px] text-[20px]">km</p>
          <p className="absolute left-[383px] -translate-x-1/2 top-[33px] text-[20px]">m</p>
          <p className="absolute left-[514px] -translate-x-1/2 top-[33px] text-[20px]">cm</p>
          <p className="absolute left-1/2 -translate-x-1/2 top-[57px] text-[110px]">+00000.0</p>
        </div>

        {/* PC Section */}
        <div className="absolute left-[436px] top-[745px] w-[568px] h-[102px] bg-black overflow-hidden">
          <p className="absolute left-1/2 -translate-x-1/2 top-[22px] text-[48px] font-bold text-white text-center">
            PC {pc?.pc_number ?? "-"}
          </p>
        </div>

        {/* Hora de carrera */}
        <div className="absolute left-[436px] top-[847px] w-[284px] h-[109px] flex flex-col gap-1 items-center justify-center text-black text-center overflow-hidden">
          <p className="text-[24px] font-medium">Hora de carrera</p>
          <p className="text-[36px] font-semibold">08:35:44</p>
        </div>

        {/* Proxima PC */}
        <div className="absolute left-[720px] top-[847px] w-[284px] h-[109px] flex flex-col gap-1 items-center justify-center text-black text-center overflow-hidden">
          <p className="text-[24px] font-medium">Proxima PC</p>
          <p className="text-[36px] font-semibold">42:26</p>
        </div>

        {/* CC Correction */}
        <div className="absolute left-[436px] top-[956px] w-[568px] h-[68px] bg-black overflow-hidden">
          <p className="absolute left-1/2 -translate-x-1/2 top-[15px] text-[32px] font-bold text-white text-center">
            -4 CC corrección
          </p>
        </div>

        {/* Left Table (HS:MN:SG:CC, VEL, EVT, DET) */}
        <div className="absolute left-0 top-[344px] w-[436px] h-[680px] bg-black text-white text-[20px] font-medium overflow-hidden flex flex-col pt-[22px] pb-[28px] px-[28px]">
          {/* Header row */}
          <div className="flex gap-[30px] whitespace-nowrap py-[8px]">
            <span className="w-[120px]">HS:MN:SG:CC</span>
            <span className="w-[40px]">VEL</span>
            <span className="w-[40px]">EVT</span>
            <span className="w-[40px]">DET</span>
          </div>

          {/* Data rows */}
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Cargando...</span>
            </div>
          ) : referenceRows.length > 0 ? (
            referenceRows.map((row, index) => (
              <div
                key={index}
                className={`flex gap-[30px] whitespace-nowrap py-[8px] -mx-[28px] px-[28px] ${
                  highlightedRow === index + 1 ? "bg-[#3e61ff]" : ""
                }`}
              >
                <span className="w-[120px]">{row.time}</span>
                <span className="w-[40px]">{row.vel}</span>
                <span className="w-[40px]">{row.evt}</span>
                <span className="w-[40px]">{row.det}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Sin referencias</span>
            </div>
          )}
        </div>

        {/* Right Table (MN:SG:CC, COEF, DIF CC, MTS) */}
        <div className="absolute left-[1004px] top-[344px] w-[436px] h-[680px] bg-black text-white text-[20px] font-medium overflow-hidden flex flex-col pt-[22px] pb-[28px] px-[28px]">
          {/* Header row */}
          <div className="flex gap-[18px] whitespace-nowrap py-[8px]">
            <span className="w-[90px]">MN:SG:CC</span>
            <span className="w-[70px]">COEF</span>
            <span className="w-[60px]">DIF CC</span>
            <span className="w-[50px]">MTS</span>
          </div>

          {/* Data rows */}
          {[
            { time: "30:00:00", coef: "-", dif: "-", mts: "-" },
            { time: "31:46:56", coef: "1051.56", dif: "-6.2", mts: "-1.2" },
            { time: "33:52:29", coef: "1051.75", dif: "-10.3", mts: "-3.6" },
          ].map((row, index) => (
            <div
              key={index}
              className="flex gap-[18px] whitespace-nowrap py-[8px]"
            >
              <span className="w-[90px]">{row.time}</span>
              <span className="w-[70px]">{row.coef}</span>
              <span className="w-[60px]">{row.dif}</span>
              <span className="w-[50px]">{row.mts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
