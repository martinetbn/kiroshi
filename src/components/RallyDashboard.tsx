import { useEffect, useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import { usePC } from "../hooks/usePCs";
import { useReferencesByPC } from "../hooks/useReferences";
import { useRace } from "../hooks/useRaces";
import {
  getPreference,
  setPreference,
  toggleRaceTimer,
  setRaceSpeed,
  adjustCorrectionFactor,
  adjustOdometer,
  resetOdometer,
  fullResetRaceTimer,
  setRaceClockStart,
  getNextPc,
  getReferencesByPc,
} from "../api/tauri";
import type { ReferenceEntry, RaceTimerState } from "../types";

interface RecordedSnapshot {
  referenceIndex: number;
  recordedCentiseconds: number; // Corrected race clock when recorded
  expectedCentiseconds: number; // Expected time from reference
  diffCentiseconds: number; // Difference (positive = early/ahead, negative = late/behind)
  diffMeters: number; // Difference in meters based on speed
  recommendedFactor: number | null; // Calculated factor if odometer available
  rawMeters: number; // Raw meters at recording time
  odometerMeters: number; // Odometer reading at recording time
}

const ODOMETER_DISTANCE_KEY = "odometer_distance";

interface RallyDashboardProps {
  raceId: number;
  pcId: number;
}

type OdometerDistance = "100m" | "50m" | "25m";

export function RallyDashboard({ raceId, pcId }: RallyDashboardProps) {
  const [scale, setScale] = useState(1);
  const navigate = useNavigate();
  const [odometerDistance, setOdometerDistance] = useState<OdometerDistance>("100m");
  const [showDistanceModal, setShowDistanceModal] = useState(false);

  // Race timer state from Rust
  const [timerState, setTimerState] = useState<RaceTimerState>({
    raw_meters: 0,
    corrected_meters: 0,
    correction_factor: 1042.0,
    current_speed: 0,
    is_running: false,
    diff_snapshot: 0,
    odometer_meters: 0,
    race_clock_centiseconds: 0,
  });

  // Load data
  const { data: _race } = useRace(raceId);
  const { data: pc } = usePC(pcId);
  const { data: references, isLoading } = useReferencesByPC(pcId);

  // Current reference index (0-based, used for highlighting and speed display)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Next PC LAR time in centiseconds (null if no next PC)
  const [nextPcLarCentiseconds, setNextPcLarCentiseconds] = useState<number | null>(null);

  // Clock correction in centiseconds (positive = ahead, negative = behind)
  const [clockCorrectionCs, setClockCorrectionCs] = useState(0);

  // Recorded reference snapshots
  const [recordedSnapshots, setRecordedSnapshots] = useState<RecordedSnapshot[]>([]);

  // Refs to access current values in event handlers (avoid stale closures)
  const timerStateRef = useRef(timerState);
  const clockCorrectionCsRef = useRef(clockCorrectionCs);
  const currentIndexRef = useRef(currentIndex);

  // Keep refs in sync with state
  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  useEffect(() => {
    clockCorrectionCsRef.current = clockCorrectionCs;
  }, [clockCorrectionCs]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // For highlighting rows (1-based)
  const highlightedRow = currentIndex + 1;

  // Track if initial setup is complete (use state to trigger re-render)
  const [isInitialized, setIsInitialized] = useState(false);

  // Load odometer distance preference on mount
  useEffect(() => {
    getPreference(ODOMETER_DISTANCE_KEY).then((value) => {
      if (value === "100m" || value === "50m" || value === "25m") {
        setOdometerDistance(value);
      }
    });

    // Reset timer state when entering race mode, then mark as initialized
    setIsInitialized(false);
    fullResetRaceTimer().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Fetch next PC's LAR time on mount
  useEffect(() => {
    getNextPc(pcId).then((nextPc) => {
      if (nextPc) {
        getReferencesByPc(nextPc.id).then((refs) => {
          const larRef = refs.find((ref) => ref.event_type === "LAR");
          if (larRef) {
            const centiseconds =
              larRef.hours * 360000 +
              larRef.minutes * 6000 +
              larRef.seconds * 100 +
              larRef.centiseconds;
            setNextPcLarCentiseconds(centiseconds);
          }
        });
      }
    });
  }, [pcId]);

  // Listen to race timer updates from Rust
  useEffect(() => {
    const unlisten = listen<RaceTimerState>("race-timer-update", (event) => {
      setTimerState(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

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

  // Get numeric current speed for Rust
  const currentSpeedNum = currentSpeedChangeIndex >= 0 && currentSpeedChangeIndex < speedChanges.length
    ? speedChanges[currentSpeedChangeIndex].speed
    : 0;

  // Update Rust with current speed when it changes or after initialization
  useEffect(() => {
    if (isInitialized) {
      setRaceSpeed(currentSpeedNum);
    }
  }, [currentSpeedNum, isInitialized]);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1440;
      const scaleY = window.innerHeight / 1024;
      setScale(Math.min(scaleX, scaleY));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDistanceModal) {
          setShowDistanceModal(false);
        } else {
          navigate({ to: "/carrera/$raceId", params: { raceId: String(raceId) } });
        }
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setCurrentIndex((prev) => {
          const maxIndex = (references?.length ?? 1) - 1;
          return prev < maxIndex ? prev + 1 : prev;
        });
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "a" || e.key === "A") {
        const increment = odometerDistance === "100m" ? 100 : odometerDistance === "50m" ? 50 : 25;
        adjustOdometer(increment);
      } else if (e.key === "c" || e.key === "C") {
        resetOdometer();
      } else if (e.key === "Enter") {
        // When starting the race, set the race clock to start from LAR time
        // Enter only works once to start the race, not to pause it
        if (!timerState.is_running) {
          // Find the LAR reference (race start)
          const larRef = references?.find((ref) => ref.event_type === "LAR");
          if (larRef) {
            // Convert LAR time to centiseconds
            const centiseconds =
              larRef.hours * 360000 +
              larRef.minutes * 6000 +
              larRef.seconds * 100 +
              larRef.centiseconds;
            setRaceClockStart(centiseconds);

            // Record the LAR as the first reference (no comparison data)
            const snapshot: RecordedSnapshot = {
              referenceIndex: currentIndex,
              recordedCentiseconds: centiseconds,
              expectedCentiseconds: centiseconds,
              diffCentiseconds: 0,
              diffMeters: 0,
              recommendedFactor: null, // No comparison for first reference
              rawMeters: 0,
              odometerMeters: 0,
            };
            setRecordedSnapshots([snapshot]);

            // Advance to the next reference
            setCurrentIndex((prev) => {
              const maxIndex = (references?.length ?? 1) - 1;
              return prev < maxIndex ? prev + 1 : prev;
            });

            // Start the race timer
            toggleRaceTimer();
          }
        }
      } else if (e.key === "1") {
        adjustCorrectionFactor(-0.01);
      } else if (e.key === "2") {
        adjustCorrectionFactor(0.01);
      } else if (e.key === "3") {
        adjustCorrectionFactor(-1);
      } else if (e.key === "4") {
        adjustCorrectionFactor(1);
      } else if (e.key === "q" || e.key === "Q") {
        adjustCorrectionFactor(-10);
      } else if (e.key === "w" || e.key === "W") {
        adjustCorrectionFactor(10);
      } else if (e.key === "e" || e.key === "E") {
        adjustCorrectionFactor(-100);
      } else if (e.key === "r" || e.key === "R") {
        adjustCorrectionFactor(100);
      } else if (e.key === "j" || e.key === "J") {
        setClockCorrectionCs((prev) => prev - 1);
      } else if (e.key === "k" || e.key === "K") {
        setClockCorrectionCs((prev) => prev + 1);
      } else if (e.key === " ") {
        e.preventDefault(); // Prevent page scroll
        recordReference();
      } else if (e.key === "b" || e.key === "B") {
        // Delete last taken reference (but not the LAR)
        if (recordedSnapshots.length > 1) {
          const lastSnapshot = recordedSnapshots[recordedSnapshots.length - 1];
          setRecordedSnapshots((prev) => prev.slice(0, -1));
          // Move back to the deleted reference's index
          setCurrentIndex(lastSnapshot.referenceIndex);
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
  }, [navigate, raceId, references, showDistanceModal, odometerDistance, timerState.is_running, recordedSnapshots]);

  // Helper to format time
  const formatTime = (ref: ReferenceEntry) => {
    const h = String(ref.hours).padStart(2, "0");
    const m = String(ref.minutes).padStart(2, "0");
    const s = String(ref.seconds).padStart(2, "0");
    const c = String(ref.centiseconds).padStart(2, "0");
    return `${h}:${m}:${s}:${c}`;
  };

  // Helper to convert reference time to centiseconds
  const refToCentiseconds = (ref: ReferenceEntry): number => {
    return ref.hours * 360000 + ref.minutes * 6000 + ref.seconds * 100 + ref.centiseconds;
  };

  // Record a reference snapshot (uses refs for current values)
  const recordReference = () => {
    const idx = currentIndexRef.current;
    if (!references || idx >= references.length) return;

    const currentRef = references[idx];
    const expectedCs = refToCentiseconds(currentRef);
    const currentTimer = timerStateRef.current;
    const currentCorrection = clockCorrectionCsRef.current;
    const recordedCs = currentTimer.race_clock_centiseconds + currentCorrection;
    // Difference: positive = early (arrived before expected), negative = late
    const diffCs = expectedCs - recordedCs;

    // Calculate difference in meters based on current speed
    // speed is in km/h, convert to m/cs: (speed / 3.6) / 100 = speed / 360
    const diffMts = (currentRef.speed / 360) * diffCs;

    // Calculate recommended factor: (COMPUTADORA raw / AUTO odometer) * 1000
    let recommendedFactor: number | null = null;
    if (currentTimer.odometer_meters > 0 && currentTimer.raw_meters > 0) {
      recommendedFactor = (currentTimer.raw_meters / currentTimer.odometer_meters) * 1000;
    }

    const snapshot: RecordedSnapshot = {
      referenceIndex: idx,
      recordedCentiseconds: recordedCs,
      expectedCentiseconds: expectedCs,
      diffCentiseconds: diffCs,
      diffMeters: diffMts,
      recommendedFactor,
      rawMeters: currentTimer.raw_meters,
      odometerMeters: currentTimer.odometer_meters,
    };

    setRecordedSnapshots((prev) => [...prev, snapshot]);

    // Auto-advance to next reference
    setCurrentIndex((prev) => {
      const maxIndex = (references?.length ?? 1) - 1;
      return prev < maxIndex ? prev + 1 : prev;
    });
  };

  // Get the reference data for display
  const referenceRows = references?.map((ref) => ({
    time: formatTime(ref),
    vel: String(ref.speed),
    evt: ref.event_type,
    det: ref.is_control_zone ? "ZC" : "-",
  })) || [];

  // Extract values from timer state for display
  const { corrected_meters, correction_factor, diff_snapshot, odometer_meters, race_clock_centiseconds } = timerState;

  // Format race clock (centiseconds to HH:MM:SS)
  const formatRaceClock = (totalCentiseconds: number): string => {
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Format countdown to next PC (centiseconds to MM:SS)
  const formatCountdown = (): string => {
    if (nextPcLarCentiseconds === null) return "--:--";
    const correctedClock = race_clock_centiseconds + clockCorrectionCs;
    const remainingCentiseconds = nextPcLarCentiseconds - correctedClock;
    if (remainingCentiseconds <= 0) return "00:00";
    const totalSeconds = Math.floor(remainingCentiseconds / 100);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#ececec]">
      <div
        className="w-[1440px] h-[1024px] font-['Chivo_Mono',monospace] shrink-0"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Computadora Section - Top Left */}
        <div className="absolute left-0 top-0 w-[436px] h-[344px] text-center">
          <p className="absolute left-1/2 -translate-x-1/2 top-[34px] text-[36px] font-medium text-black">
            COMPUTADORA
          </p>
          <p className="absolute left-[74.5px] -translate-x-1/2 top-[127px] text-[128px] font-bold text-black">
            {Math.floor(corrected_meters / 1000) % 10}
          </p>
          <p className="absolute left-[208.5px] -translate-x-1/2 top-[99px] text-[175px] font-bold text-[#3e61ff]">
            {Math.floor(corrected_meters / 100) % 10}
          </p>
          <p className="absolute left-[351.5px] -translate-x-1/2 top-[127px] text-[128px] font-bold text-[#ef3c3c]">
            {Math.floor(corrected_meters / 10) % 10}
          </p>
        </div>

        {/* Status Section - Top Center */}
        {(() => {
          const status = diff_snapshot < -0.3 ? "ATRASADO" : diff_snapshot > 0.3 ? "ADELANTADO" : "PERFECTO";
          const displayValue = Math.abs(diff_snapshot).toFixed(1).replace(".", ",");
          return (
            <div className="absolute left-[436px] top-0 w-[568px] h-[344px] bg-[#ef3c3c] text-center text-white overflow-hidden">
              <p className="absolute left-1/2 -translate-x-1/2 top-[32px] text-[48px] font-semibold">
                {status}
              </p>
              <p className="absolute left-1/2 -translate-x-1/2 top-[90px] text-[175px] font-extrabold">
                {displayValue}
              </p>
            </div>
          );
        })()}

        {/* Auto Section - Top Right */}
        <div className="absolute left-[1004px] top-0 w-[436px] h-[344px] text-center">
          <p className="absolute left-1/2 -translate-x-1/2 top-[34px] text-[36px] font-medium text-black">
            AUTO
          </p>
          <button
            onClick={() => setShowDistanceModal(true)}
            className="absolute left-[calc(50%+58px)] top-[44px] text-[20px] font-medium text-[#3e61ff] hover:text-[#2d4ecc] cursor-pointer bg-transparent border-none underline"
          >
            {odometerDistance}
          </button>
          <p className="absolute left-[74.5px] -translate-x-1/2 top-[127px] text-[128px] font-bold text-black">
            {Math.floor(odometer_meters / 1000) % 10}
          </p>
          <p className="absolute left-[208.5px] -translate-x-1/2 top-[99px] text-[175px] font-bold text-[#3e61ff]">
            {Math.floor(odometer_meters / 100) % 10}
          </p>
          <p className="absolute left-[353.5px] -translate-x-1/2 top-[127px] text-[128px] font-bold text-[#ef3c3c]">
            {Math.floor(odometer_meters / 10) % 10}
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
          {correction_factor.toFixed(2)}
        </p>
        <p className="absolute left-[860px] -translate-x-1/2 top-[457px] text-[36px] font-semibold text-white text-center">
          {(() => {
            // Find the latest snapshot with a recommended factor
            for (let i = recordedSnapshots.length - 1; i >= 0; i--) {
              if (recordedSnapshots[i].recommendedFactor !== null) {
                return recordedSnapshots[i].recommendedFactor!.toFixed(2);
              }
            }
            return "--";
          })()}
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
          <p className="text-[36px] font-semibold">{formatRaceClock(race_clock_centiseconds + clockCorrectionCs)}</p>
        </div>

        {/* Proxima PC */}
        <div className="absolute left-[720px] top-[847px] w-[284px] h-[109px] flex flex-col gap-1 items-center justify-center text-black text-center overflow-hidden">
          <p className="text-[24px] font-medium">Proxima PC</p>
          <p className="text-[36px] font-semibold">{formatCountdown()}</p>
        </div>

        {/* CC Correction */}
        <div className="absolute left-[436px] top-[956px] w-[568px] h-[68px] bg-black overflow-hidden">
          <p className="absolute left-1/2 -translate-x-1/2 top-[15px] text-[32px] font-bold text-white text-center">
            {clockCorrectionCs >= 0 ? "+" : ""}{clockCorrectionCs} CC corrección
          </p>
        </div>

        {/* Left Table (HH:MM:SS:CC, VEL, EVT, DET) */}
        <div className="absolute left-0 top-[344px] w-[436px] h-[680px] bg-black text-white text-[20px] font-medium overflow-hidden flex flex-col pt-[22px] pb-[28px] px-[28px]">
          {/* Header row */}
          <div className="flex gap-[30px] whitespace-nowrap py-[8px]">
            <span className="w-[120px]">HH:MM:SS:CC</span>
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

        {/* Right Table (MM:SS:CC, COEF, DIF, MTS) */}
        <div className="absolute left-[1004px] top-[344px] w-[436px] h-[680px] bg-black text-white text-[20px] font-medium overflow-hidden flex flex-col pt-[22px] pb-[28px] px-[28px]">
          {/* Header row */}
          <div className="flex gap-[18px] whitespace-nowrap py-[8px]">
            <span className="w-[90px]">MM:SS:CC</span>
            <span className="w-[70px]">COEF</span>
            <span className="w-[60px]">CC</span>
            <span className="w-[50px]">MTS</span>
          </div>

          {/* Data rows */}
          {recordedSnapshots.length > 0 ? (
            recordedSnapshots.map((snapshot, index) => {
              // Format recorded time as MM:SS:CC
              const totalSeconds = Math.floor(snapshot.recordedCentiseconds / 100);
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = totalSeconds % 60;
              const centis = snapshot.recordedCentiseconds % 100;
              const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(centis).padStart(2, "0")}`;

              // First reference (LAR) shows dashes for comparison columns
              const isFirstReference = index === 0;

              // Format factor
              const coefStr = isFirstReference
                ? "-"
                : snapshot.recommendedFactor !== null
                  ? snapshot.recommendedFactor.toFixed(2)
                  : "-";

              // Format diff centiseconds (with sign)
              const diffCsStr = isFirstReference
                ? "-"
                : snapshot.diffCentiseconds >= 0
                  ? `+${snapshot.diffCentiseconds.toFixed(0)}`
                  : snapshot.diffCentiseconds.toFixed(0);

              // Format diff meters (with sign, 1 decimal)
              const diffMtsStr = isFirstReference
                ? "-"
                : snapshot.diffMeters >= 0
                  ? `+${snapshot.diffMeters.toFixed(1)}`
                  : snapshot.diffMeters.toFixed(1);

              return (
                <div
                  key={index}
                  className="flex gap-[18px] whitespace-nowrap py-[8px]"
                >
                  <span className="w-[90px]">{timeStr}</span>
                  <span className="w-[70px]">{coefStr}</span>
                  <span className="w-[60px]">{diffCsStr}</span>
                  <span className="w-[50px]">{diffMtsStr}</span>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Presiona Space para registrar</span>
            </div>
          )}
        </div>
      </div>

      {/* Distance Selection Modal */}
      {showDistanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[300px] overflow-hidden">
            <div className="bg-[#3e61ff] px-6 py-4">
              <h2 className="text-white text-[24px] font-semibold">Distancia</h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {(["100m", "50m", "25m"] as OdometerDistance[]).map((distance) => (
                <button
                  key={distance}
                  onClick={() => {
                    setOdometerDistance(distance);
                    setPreference(ODOMETER_DISTANCE_KEY, distance);
                    setShowDistanceModal(false);
                  }}
                  className={`w-full px-4 py-3 text-[18px] font-medium rounded transition-colors ${
                    odometerDistance === distance
                      ? "bg-[#3e61ff] text-white"
                      : "bg-[#e0e0e0] hover:bg-[#d0d0d0] text-black"
                  }`}
                >
                  {distance}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowDistanceModal(false)}
                className="w-full px-4 py-3 bg-[#d9d9d9] hover:bg-[#c0c0c0] text-black text-[18px] font-medium rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
