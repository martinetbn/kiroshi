import { useEffect, useState } from "react";

export function LoadData() {
  const [scale, setScale] = useState(1);

  // Highlighted row position: 0 = hidden, 1 = first data row, 2 = second, etc.
  const [highlightedRow, setHighlightedRow] = useState(0);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1440;
      const scaleY = window.innerHeight / 1024;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Sample data for the route sheet table
  const routeSheetData = [
    { time: "00:02:24:12", speed: "50", event: "LAR", info: "-" },
    { time: "00:03:53:18", speed: "50", event: "REF", info: "-" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#ececec]">
      <div
        className="w-[1440px] h-[1024px] font-['Chivo_Mono',monospace] shrink-0 relative"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Left Panel */}
        <div className="absolute left-[40px] top-[40px] w-[620px] h-[944px] flex flex-col justify-between">
          {/* Event Name & PC */}
          <div className="flex gap-[20px] h-[166px]">
            {/* Event Name Box */}
            <div className="bg-[#3e61ff] w-[400px] h-full flex items-center justify-center">
              <p className="text-white text-[36px] font-semibold text-center leading-tight">
                Gran Premio<br />Uruguay 2025
              </p>
            </div>

            {/* PC Box */}
            <div className="w-[200px] h-full flex flex-col">
              <div className="bg-[#ef3c3c] h-[60px] flex items-center justify-center shrink-0">
                <span className="text-white text-[28px] font-semibold">PC</span>
              </div>
              <div className="flex-1 bg-[#ececec] h-[90px] flex items-center justify-center">
                <span className="text-black text-[80px] font-bold">1</span>
              </div>
              <div className="h-[6px] bg-[#ef3c3c] shrink-0" />
            </div>
          </div>

          {/* Time Display */}
          <div className="flex">
            {/* h */}
            <div className="w-[155px] flex flex-col">
              <div className="h-[120px] bg-[#3e61ff] flex items-center justify-center">
                <span className="text-white text-[80px] font-bold">h</span>
              </div>
              <div className="h-[140px] flex items-center justify-center bg-[#ececec]">
                <span className="text-black text-[100px] font-bold tracking-wider">00</span>
              </div>
              <div className="h-[6px] bg-[#3e61ff]" />
            </div>

            {/* m */}
            <div className="w-[155px] flex flex-col">
              <div className="h-[120px] bg-[#d9d9d9] flex items-center justify-center">
                <span className="text-black text-[80px] font-bold">m</span>
              </div>
              <div className="h-[140px] flex items-center justify-center bg-[#ececec]">
                <span className="text-black text-[100px] font-bold tracking-wider">04</span>
              </div>
              <div className="h-[6px] bg-[#d9d9d9]" />
            </div>

            {/* s */}
            <div className="w-[155px] flex flex-col">
              <div className="h-[120px] bg-[#d9d9d9] flex items-center justify-center">
                <span className="text-black text-[80px] font-bold">s</span>
              </div>
              <div className="h-[140px] flex items-center justify-center bg-[#ececec]">
                <span className="text-black text-[100px] font-bold tracking-wider">36</span>
              </div>
              <div className="h-[6px] bg-[#d9d9d9]" />
            </div>

            {/* cc */}
            <div className="w-[155px] flex flex-col">
              <div className="h-[120px] bg-[#ef3c3c] flex items-center justify-center">
                <span className="text-white text-[80px] font-bold">cc</span>
              </div>
              <div className="h-[140px] flex items-center justify-center bg-[#ececec]">
                <span className="text-black text-[100px] font-bold tracking-wider">11</span>
              </div>
              <div className="h-[6px] bg-[#ef3c3c]" />
            </div>
          </div>

          {/* Event & Speed */}
          <div className="flex gap-[20px]">
            {/* Event */}
            <div className="w-[300px]">
              <div className="bg-[#3e61ff] h-[60px] flex items-center justify-center">
                <span className="text-white text-[28px] font-semibold">Evento</span>
              </div>
              <div className="h-[150px] bg-[#ececec] flex items-center justify-center">
                <span className="text-black text-[80px] font-bold">REF</span>
              </div>
              <div className="h-[6px] bg-[#3e61ff]" />
            </div>

            {/* Speed */}
            <div className="w-[300px]">
              <div className="bg-[#ef3c3c] h-[60px] flex items-center justify-center">
                <span className="text-white text-[28px] font-semibold">KM/h</span>
              </div>
              <div className="h-[150px] bg-[#ececec] flex items-center justify-center">
                <span className="text-black text-[80px] font-bold">50</span>
              </div>
              <div className="h-[6px] bg-[#ef3c3c]" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-[20px]">
            <button className="w-[300px] h-[160px] bg-[#3e61ff] hover:bg-[#2d4ecc] text-white text-[32px] font-semibold transition-colors leading-tight">
              Guardar<br />Referencia
            </button>
            <button className="w-[300px] h-[160px] bg-[#ef3c3c] hover:bg-[#cc2e2e] text-white text-[32px] font-semibold transition-colors">
              Guardar PC
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
          <div className="bg-black h-[874px] text-white text-[28px] font-medium p-[30px] overflow-hidden leading-relaxed flex flex-col">
            {/* Header row */}
            <div className="flex gap-[30px] whitespace-nowrap py-[8px]">
              <span className="w-[200px]">hs:mn:sg:cc</span>
              <span className="w-[90px]">km/h</span>
              <span className="w-[100px]">Evento</span>
              <span className="w-[80px]">Info</span>
            </div>

            {/* Data rows */}
            {routeSheetData.map((row, index) => (
              <div
                key={index}
                className={`flex gap-[30px] whitespace-nowrap py-[8px] -mx-[30px] px-[30px] ${
                  highlightedRow === index + 1 ? "bg-[#3e61ff]" : ""
                }`}
              >
                <span className="w-[200px]">{row.time}</span>
                <span className="w-[90px]">{row.speed}</span>
                <span className="w-[100px]">{row.event}</span>
                <span className="w-[80px]">{row.info}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
