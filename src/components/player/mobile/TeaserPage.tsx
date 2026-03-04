import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const TeaserPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-auto py-4 relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/Frame_1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Scaling wrapper */}
      <div className="w-full flex items-center justify-center px-4 relative z-10">
        <div
          className="relative"
          style={{
            width: "390px",
            maxWidth: "100%",
          }}
        >
          {/* Card Container */}
          <div className="w-full relative overflow-hidden px-8 py-8 flex flex-col items-center text-center">
            {/* Content - all relative z-10 */}
            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Titleist script brand */}
              {/* Titleist Logo */}
              <div className="mb-1">
                <img
                  src="/white-logo-2.png"
                  alt="Titleist"
                  className="h-20 object-contain"
                />
              </div>

              {/* Main Logo Circle */}
              <div className="mb-12 relative">
                <div className="w-40 h-40 ">
                  <img
                    src="/cropped_circle_image.png"
                    alt="Team Titleist Logo"
                    className="w-full h-full object-contain "
                  />
                </div>
              </div>

              {/* Team Titleist */}
              <div
                className="mb-3"
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "29px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  lineHeight: 1,
                }}
              >
                <span className="text-[#cc2222]">TEAM </span>
                <span className="text-white">TITLEIST</span>
              </div>

              {/* INVITATIONAL */}
              <div
                className="text-white mb-5"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "6px",
                }}
              >
                INVITATIONAL
              </div>

              {/* Divider + Indonesia + Divider */}
              <div className="w-full my-0.5 mb-2">
                <div
                  className="w-full h-0.5 mb-1"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #ffffff, transparent)",
                  }}
                />
                <div
                  className="text-white"
                  style={{
                    fontFamily: "Bebas Neue, sans-serif",
                    fontSize: "68px",
                    fontWeight: 400,
                    letterSpacing: "4px",
                    lineHeight: 1,
                    fontStyle: "italic",
                    transform: "skewX(-8deg)",
                  }}
                >
                  INDONESIA
                </div>
                <div
                  className="w-full h-0.5 mt-1"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #ffffff, transparent)",
                  }}
                />
              </div>

              {/* Date */}
              <div
                className="text-white my-4 mb-6"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                }}
              >
                A P R I L &nbsp; 2 0 2 6
              </div>

              {/* SEGERA HADIR */}
              <div
                className="text-white mb-4"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
              >
                SEGERA HADIR
              </div>

              {/* Description */}
              <p
                className="text-white/75 max-w-[300px] mb-5"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "15px",
                  fontWeight: 400,
                  lineHeight: 1.75,
                }}
              >
                Segera hadir Team Titleist Invitational Indonesia, turnamen golf
                khusus undangan – dimana anda dapat bermain golf, mencoba
                perlengkapan Titleist, bertemu dengan sesama pegolf, serta
                mendapatkan pengetahuan dan berbagi pengalaman dari spesialis
                produk dan ambassador Titleist
              </p>

              {/* Cek disini */}
              <p
                className="text-white mb-6"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "13px",
                  fontWeight: 800,
                  lineHeight: 1.75,
                }}
              >
                Cek disini untuk detail lebih lanjut.
              </p>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/player/landing")}
                className="mt-2 mb-5 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-2.5 px-8 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 group"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                <span>Lihat Selengkapnya</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeaserPage;
