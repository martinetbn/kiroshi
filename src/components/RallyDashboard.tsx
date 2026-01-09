import { useEffect, useState } from "react";

export function RallyDashboard() {
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
          1052.61
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
            PC 33
          </p>
        </div>

        {/* Hora de carrera */}
        <div className="absolute left-[436px] top-[847px] w-[284px] h-[109px] flex flex-col gap-1 items-center justify-center text-black text-center overflow-hidden">
          <p className="text-[24px] font-medium">Hora de carrera</p>
          <p className="text-[36px] font-semibold">02:35:44</p>
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

        {/* Left Table (M/S/C, VEL, EVT) */}
        <div className="absolute left-0 top-[344px] w-[436px] h-[680px] bg-black text-white text-[24px] font-medium overflow-hidden">
          {/* Column dividers */}
          <div className="absolute left-[200px] top-[25px] w-px h-[629px] bg-[#d9d9d9]" />
          <div className="absolute left-[298px] top-[25px] w-px h-[629px] bg-[#d9d9d9]" />

          {/* Header row */}
          <p className="absolute left-[60px] top-[36px]">M/S/C</p>
          <p className="absolute left-[229px] top-[36px]">VEL</p>
          <p className="absolute left-[330px] top-[36px]">EVT</p>

          {/* Data rows */}
          <p className="absolute left-[60px] top-[86px]">30:00:00</p>
          <p className="absolute left-[229px] top-[86px]">82</p>
          <p className="absolute left-[332px] top-[86px]">LAR</p>

          <p className="absolute left-[60px] top-[126px]">31:46:55</p>
          <p className="absolute left-[229px] top-[126px]">82</p>
          <p className="absolute left-[332px] top-[128px]">-</p>

          <p className="absolute left-[60px] top-[166px]">33:52:27</p>
          <p className="absolute left-[229px] top-[166px]">82</p>
          <p className="absolute left-[332px] top-[166px]">-</p>

          <p className="absolute left-[60px] top-[206px]">35:34:18</p>
          <p className="absolute left-[229px] top-[206px]">82</p>
          <p className="absolute left-[332px] top-[206px]">-</p>

          {/* Highlighted row */}
          <div className="absolute left-[45px] top-[242px] w-[347px] h-[37px] bg-[#3e61ff]" />
          <p className="absolute left-[60px] top-[246px]">38:00:00</p>
          <p className="absolute left-[229px] top-[246px]">80</p>
          <p className="absolute left-[330px] top-[246px]">CVR</p>

          <p className="absolute left-[60px] top-[286px]">40:00:00</p>
          <p className="absolute left-[229px] top-[286px]">82</p>
          <p className="absolute left-[330px] top-[286px]">CVR</p>

          <p className="absolute left-[60px] top-[326px]">42:00:00</p>
          <p className="absolute left-[230px] top-[326px]">78</p>
          <p className="absolute left-[330px] top-[326px]">CVR</p>
        </div>

        {/* Right Table (M/S/C, COEF, CC) */}
        <div className="absolute left-[1004px] top-[344px] w-[436px] h-[680px] bg-black text-white text-[24px] font-medium text-center overflow-hidden">
          {/* Column dividers */}
          <div className="absolute left-[184px] top-[25px] w-px h-[629px] bg-[#d9d9d9]" />
          <div className="absolute left-[318px] top-[25px] w-px h-[629px] bg-[#d9d9d9]" />

          {/* Header row */}
          <p className="absolute left-[94px] -translate-x-1/2 top-[36px]">M/S/C</p>
          <p className="absolute left-[239px] -translate-x-1/2 top-[36px]">COEF</p>
          <p className="absolute left-[354.5px] -translate-x-1/2 top-[36px]">CC</p>

          {/* Data rows */}
          <p className="absolute left-[109px] -translate-x-1/2 top-[86px]">30:00:00</p>
          <p className="absolute left-[213.5px] -translate-x-1/2 top-[86px]">-</p>
          <p className="absolute left-[342.5px] -translate-x-1/2 top-[86px]">-</p>

          <p className="absolute left-[107px] -translate-x-1/2 top-[126px]">31:46:56</p>
          <p className="absolute left-[251.5px] -translate-x-1/2 top-[126px]">1051.56</p>
          <p className="absolute left-[360px] -translate-x-1/2 top-[126px]">-6.2</p>

          <p className="absolute left-[108px] -translate-x-1/2 top-[166px]">33:52:29</p>
          <p className="absolute left-[250.5px] -translate-x-1/2 top-[166px]">1051.75</p>
          <p className="absolute left-[365px] -translate-x-1/2 top-[166px]">-10.3</p>
        </div>
      </div>
    </div>
  );
}
