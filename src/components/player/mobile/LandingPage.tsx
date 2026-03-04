import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const LandingPage: React.FC = () => {
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
          <div className="w-full relative overflow-hidden flex flex-col items-center text-center">
            {/* Content - all relative z-10 */}
            <div className="relative z-10 w-full flex flex-col items-center px-8 py-8">
              {/* Titleist Logo */}
              <div className="mb-6">
                <img
                  src="/ttiltlist-landing.png"
                  alt="Titleist"
                  className="h-24 object-contain"
                />
              </div>

              {/* Title Section with Dividers */}
              <div className="w-full mb-6">
                <div
                  className="w-full h-0.5 mb-4"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #ffffff, transparent)",
                  }}
                />
                <h1
                  className="text-white"
                  style={{
                    fontFamily: "Bebas Neue, sans-serif",
                    fontSize: "clamp(28px, 7vw, 68px)",
                    fontWeight: 400,
                    letterSpacing: "5px",
                    lineHeight: 1,
                    fontStyle: "italic",
                    transform: "skewX(-8deg)",
                    textShadow: "0 0 40px rgba(200,30,30,0.3)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  LOYALIST EXCLUSIVE
                </h1>
                <div
                  className="w-full h-0.5 mt-4"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #ffffff, transparent)",
                  }}
                />
              </div>

              {/* Event Details */}
              <div>
                <div className="text-center space-y-2">
                  <p
                    className="text-white"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "clamp(10px, 3vw, 13px)",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    TEAM TITLEIST INVITATIONAL 2026 INDONESIA
                  </p>
                  <p
                    className="text-white"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    SEDAYU INDO GOLF
                  </p>
                  <p
                    className="text-white"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    WEDNESDAY, 8<sup className="text-[10px]">th</sup> APRIL 2026
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Image - Outside content wrapper for full width */}
            <div className="relative z-10 w-full mb-6">
              <img
                src="/image-landing.jpeg"
                alt="Tournament Group Photo"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Content continues - all relative z-10 */}
            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Tournament Fee Section */}
              <div className="mb-6 w-full px-8">
                <h2
                  className="text-white mb-4 text-left"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    lineHeight: 1.8,
                  }}
                >
                  TIKET TURNAMEN - 5 Juta Rupiah,{" "}
                  <span className="font-medium"> termasuk:</span>
                </h2>

                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <span className="text-white text-lg font-bold flex-shrink-0">
                      •
                    </span>
                    <p
                      className="text-white"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: 1.8,
                      }}
                    >
                      Team Titleist Invitational Gift Pack, senilai lebih dari 6
                      Juta Rupiah berisikan TT merchandise khusus untuk peserta
                      turnamen.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-white text-lg font-bold flex-shrink-0">
                      •
                    </span>
                    <p
                      className="text-white"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: 1.8,
                      }}
                    >
                      Mencoba berbagai produk terakhir dari Titleist termasuk
                      SM11 Vokey Wedges dan Scotty Cameron Putter terbaru.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-white text-lg font-bold flex-shrink-0">
                      •
                    </span>
                    <p
                      className="text-white"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: 1.8,
                      }}
                    >
                      Belajar dan menambah wawasan golf anda bersama spesialis
                      dan ambassador Titleist.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-white text-lg font-bold flex-shrink-0">
                      •
                    </span>
                    <p
                      className="text-white"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: 1.8,
                      }}
                    >
                      Berbagai hadiah menarik, termasuk satu set penuh Titleist
                      Club, GT Driver dan Fairway, T Series Iron, SM 11 Vokey
                      terbaru, Scotty Cameron Putter dan lainnya.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-white text-lg font-bold flex-shrink-0">
                      •
                    </span>
                    <p
                      className="text-white"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "13px",
                        fontWeight: 400,
                        lineHeight: 1.8,
                      }}
                    >
                      Bermain 18 hole golf di Sedayu Indo Golf.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="px-8 mb-10 w-full flex justify-center">
                <button
                  onClick={() =>
                    navigate("/player/register", {
                      state: { fromLanding: true },
                    })
                  }
                  className="mt-4 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-2.5 px-8 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  <span>Daftar Sekarang</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
