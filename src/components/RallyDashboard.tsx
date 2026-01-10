import { useEffect, useState } from "react";

export function RallyDashboard() {
  const [scale, setScale] = useState(1);

  // Highlighted row position: 0 = hidden, 1 = first data row, 2 = second, etc.
  const [highlightedRow, setHighlightedRow] = useState(3);

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
          <p className="absolute left-[188px] -translate-x-1/2 top-[29px] text-[36px] font-medium text-black/50">
            82
          </p>
          <p className="absolute left-[283px] -translate-x-1/2 top-[22px] text-[48px] font-bold text-black">
            80
          </p>
          <p className="absolute left-[378px] -translate-x-1/2 top-[29px] text-[36px] font-medium text-black/50">
            82
          </p>
          <p className="absolute left-[463px] -translate-x-1/2 top-[29px] text-[36px] font-medium text-black/50">
            78
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
            PC 8
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
          {[
            { time: "08:30:00:00", vel: "82", evt: "LAR", det: "-" },
            { time: "08:31:46:55", vel: "82", evt: "REF", det: "-" },
            { time: "08:33:52:27", vel: "82", evt: "REF", det: "-" },
            { time: "08:35:34:18", vel: "82", evt: "REF", det: "ZC" },
            { time: "08:38:00:00", vel: "82", evt: "REF", det: "-" },
            { time: "08:40:00:00", vel: "80", evt: "CVR", det: "-" },
            { time: "08:42:00:00", vel: "82", evt: "CVR", det: "-" },
          ].map((row, index) => (
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
          ))}
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
