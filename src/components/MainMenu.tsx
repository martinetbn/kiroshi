import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function MainMenu() {
  const [scale, setScale] = useState(1);

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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#ececec]">
      <div
        className="w-[1440px] h-[1024px] font-['Chivo_Mono',monospace] shrink-0 relative flex flex-col items-center justify-center overflow-hidden bg-[#ececec]"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Title */}
        <div className="absolute top-[60px] left-0 w-full text-center">
          <h1 className="text-[120px] font-black italic tracking-tighter text-black uppercase skew-x-[-10deg]">
            Kiroshi
          </h1>
        </div>

        {/* Menu Cards Container */}
        <div className="flex gap-[60px] items-center h-[600px] mt-[100px]">
          {/* Carga Card */}
          <Link
            to="/races"
            className="group relative w-[300px] h-full bg-[#3e61ff] -skew-x-[15deg] hover:bg-[#2d4ecc] hover:-translate-y-4 hover:shadow-[10px_10px_0px_rgba(0,0,0,0.2)] transition-all duration-300 overflow-hidden border-4 border-black"
          >
            <div className="absolute inset-0 skew-x-[15deg] flex flex-col items-center justify-center p-8">
              <span className="text-white text-[90px] font-bold leading-none">01</span>
              <span className="text-white text-[48px] font-bold uppercase italic tracking-tighter mt-4">
                Carga
              </span>
              <div className="w-[80px] h-[8px] bg-white mt-6 group-hover:w-[120px] transition-all" />
            </div>
            {/* Decorative stripe */}
            <div className="absolute top-0 right-0 w-[20px] h-full bg-black/10" />
          </Link>

          {/* Carrera Card */}
          <Link
            to="/carrera"
            className="group relative w-[300px] h-full bg-[#ef3c3c] -skew-x-[15deg] hover:bg-[#cc2e2e] hover:-translate-y-4 hover:shadow-[10px_10px_0px_rgba(0,0,0,0.2)] transition-all duration-300 overflow-hidden border-4 border-black"
          >
            <div className="absolute inset-0 skew-x-[15deg] flex flex-col items-center justify-center p-8">
              <span className="text-white text-[90px] font-bold leading-none">02</span>
              <span className="text-white text-[48px] font-bold uppercase italic tracking-tighter mt-4">
                Carrera
              </span>
              <div className="w-[80px] h-[8px] bg-white mt-6 group-hover:w-[120px] transition-all" />
            </div>
            {/* Decorative stripe */}
            <div className="absolute top-0 right-0 w-[20px] h-full bg-black/10" />
          </Link>

          {/* Análisis Card (Disabled) */}
          <div className="relative w-[300px] h-full bg-[#888888] -skew-x-[15deg] border-4 border-[#666] opacity-80 cursor-not-allowed">
            <div className="absolute inset-0 skew-x-[15deg] flex flex-col items-center justify-center p-8 select-none">
              <span className="text-[#cccccc] text-[90px] font-bold leading-none">03</span>
              <span className="text-[#cccccc] text-[48px] font-bold uppercase italic tracking-tighter mt-4">
                Análisis
              </span>
              <div className="w-[80px] h-[8px] bg-[#cccccc] mt-6" />
            </div>
            {/* Decorative stripe */}
            <div className="absolute top-0 right-0 w-[20px] h-full bg-black/10" />
          </div>
        </div>

        {/* Footer/Deco */}
        <div className="absolute bottom-[60px] text-black/40 text-[24px] font-bold italic tracking-wider">
          MARTIN ETCHEBARNE (etchebarne.net)
        </div>
      </div>
    </div>
  );
}
