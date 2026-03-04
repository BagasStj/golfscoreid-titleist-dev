import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  X,
  Info,
  Calendar,
} from "lucide-react";
import ClubSetsSelectorSimple from "../shared/ClubSetsSelectorSimple";
import { PasswordInput } from "@/components/ui/password-input";
import { RegistrationLoadingSkeleton } from "@/components/ui/loading-skeleton";

interface ClubEntry {
  brand: string;
  model: string;
}

type AuthErrorType =
  | "INVALID_INPUT"
  | "EMAIL_EXISTS"
  | "USERNAME_EXISTS"
  | "NETWORK_ERROR"
  | "UPLOAD_ERROR"
  | "UNKNOWN_ERROR";

interface AuthError {
  type: AuthErrorType;
  message: string;
}

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "shirt" | "glove";
}

const SizeGuideModal = ({ isOpen, onClose, type }: SizeGuideModalProps) => {
  if (!isOpen) return null;

  const shirtGuide = {
    S: { chest: "86-91 cm", length: "68-70 cm" },
    M: { chest: "91-96 cm", length: "70-72 cm" },
    L: { chest: "96-101 cm", length: "72-74 cm" },
    XL: { chest: "101-106 cm", length: "74-76 cm" },
    "2XL": { chest: "106-111 cm", length: "76-78 cm" },
    "3XL": { chest: "111-116 cm", length: "78-80 cm" },
  };

  const gloveGuide = {
    "22": { hand: "22 cm", description: "Ukuran 22" },
    "23": { hand: "23 cm", description: "Ukuran 23" },
    "24": { hand: "24 cm", description: "Ukuran 24" },
    "25": { hand: "25 cm", description: "Ukuran 25" },
    "26": { hand: "26 cm", description: "Ukuran 26" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#212121] to-black rounded-2xl shadow-2xl max-w-md w-full border border-red-900/40 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-900 via-red-700 to-red-900"></div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">
              Size Guide for {type === "shirt" ? "Shirt" : "Glove"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {type === "shirt"
              ? Object.entries(shirtGuide).map(([size, measurements]) => (
                  <div
                    key={size}
                    className="bg-[#212121] rounded-lg p-3 border border-[#444444]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-500 text-lg">
                        {size}
                      </span>
                      <div className="text-right text-sm">
                        <div className="text-gray-300">
                          Chest: {measurements.chest}
                        </div>
                        <div className="text-gray-400">
                          Length: {measurements.length}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : Object.entries(gloveGuide).map(([size, info]) => (
                  <div
                    key={size}
                    className="bg-[#212121] rounded-lg p-3 border border-[#444444]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-500 text-lg">
                        {size}
                      </span>
                      <div className="text-right text-sm">
                        <div className="text-gray-300">Hand: {info.hand}</div>
                        <div className="text-gray-400">{info.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <div className="mt-4 p-3 bg-red-950/30 rounded-lg border border-red-900/50">
            <p className="text-gray-400 text-sm mt-1">
              💡 Tip: Ukur{" "}
              {type === "shirt" ? "lingkar dada" : "lingkar tangan"} Anda untuk
              hasil yang akurat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DisclaimerModalProps {
  isOpen: boolean;
  onNavigateToLogin: () => void;
}

const DisclaimerModal = ({
  isOpen,
  onNavigateToLogin,
}: DisclaimerModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#1a1a1a] to-black rounded-3xl shadow-2xl max-w-lg w-full border border-red-900/50 overflow-hidden transform animate-scale-in">
        {/* Decorative top bar */}
        <div className="h-2 bg-gradient-to-r from-red-900 via-red-600 to-red-900"></div>

        <div className="p-8 relative">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-900/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-900 to-red-700 p-4 rounded-2xl shadow-xl">
                <Info className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
            Informasi Pendaftaran
          </h2>

          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-6"></div>

          {/* Content */}
          <div className="space-y-4 text-center">
            <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 rounded-xl p-5 border border-red-900/30 backdrop-blur-sm">
              <p className="text-gray-200 text-sm leading-relaxed">
                <span className="text-white font-semibold">
                  Pendaftaran Anda telah kami terima.
                </span>{" "}
                Panitia akan melakukan proses{" "}
                <span className="text-white font-semibold">verifikasi</span>{" "}
                terlebih dahulu. Informasi terkait{" "}
                <span className="text-white font-semibold">
                  konfirmasi keikutsertaan
                </span>{" "}
                dan <span className="text-white font-semibold">pembayaran</span>{" "}
                akan disampaikan melalui{" "}
                <span className="text-white font-semibold">
                  pemberitahuan resmi
                </span>{" "}
                selanjutnya.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="h-1 w-8 bg-gradient-to-r from-transparent to-red-900/50 rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse"></div>
              <div className="h-1 w-8 bg-gradient-to-l from-transparent to-red-900/50 rounded-full"></div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onNavigateToLogin}
            className="w-full mt-8 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Saya Mengerti
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

interface WelcomeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeInfoModal = ({ isOpen, onClose }: WelcomeInfoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-[#2e2e2e] via-[#1a1a1a] to-black rounded-3xl shadow-2xl max-w-lg w-full border border-red-900/50 overflow-hidden transform animate-scale-in">
        {/* Decorative top bar */}
        <div className="h-2 bg-gradient-to-r from-red-900 via-red-600 to-red-900"></div>

        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-900/20 rounded-full blur-3xl -z-10"></div>

        <div className="p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-900/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-900 to-red-700 p-4 rounded-2xl shadow-xl">
                <Info className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
            Pemberitahuan Penting
          </h2>

          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-6"></div>

          {/* Content */}
          <div className="space-y-4 text-center">
            <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 rounded-xl p-5 border border-red-900/30 backdrop-blur-sm">
              <p className="text-gray-200 text-sm leading-relaxed">
                Terima kasih atas minat Anda untuk mengikuti turnamen ini.
                Setiap pendaftaran akan melalui proses{" "}
                <span className="text-white font-semibold">verifikasi</span>{" "}
                terlebih dahulu, dan{" "}
                <span className="text-white font-semibold">
                  konfirmasi keikutsertaan
                </span>{" "}
                beserta{" "}
                <span className="text-white font-semibold">
                  informasi pembayaran
                </span>{" "}
                akan disampaikan oleh panitia setelahnya.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="h-1 w-8 bg-gradient-to-r from-transparent to-red-900/50 rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse"></div>
              <div className="h-1 w-8 bg-gradient-to-l from-transparent to-red-900/50 rounded-full"></div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full mt-8 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Saya Mengerti
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PlayerRegistrationPage() {
  const location = useLocation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    nickname: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "",
    shirtSize: "" as "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "",
    gloveSize: "" as "22" | "23" | "24" | "25" | "26" | "",
    drivers: [] as ClubEntry[],
    fairways: [] as ClubEntry[],
    hybrids: [] as ClubEntry[],
    irons: [] as ClubEntry[],
    wedges: [] as ClubEntry[],
    putters: [] as ClubEntry[],
    golfBalls: [] as ClubEntry[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState<"shirt" | "glove" | null>(
    null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const registerMutation = useMutation(api.users.register);
  const navigate = useNavigate();

  // Scroll to top on mount and show welcome modal when coming from landing page
  useEffect(() => {
    const initializePage = async () => {
      window.scrollTo(0, 0);

      // Simulate minimum loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const fromLanding = location.state?.fromLanding;
      if (fromLanding) {
        setShowWelcomeModal(true);
      }

      setIsInitialLoading(false);
    };

    initializePage();
  }, [location]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Update dateOfBirth when day, month, or year changes
      if (
        name === "birthDay" ||
        name === "birthMonth" ||
        name === "birthYear"
      ) {
        const day = name === "birthDay" ? value : prev.birthDay;
        const month = name === "birthMonth" ? value : prev.birthMonth;
        const year = name === "birthYear" ? value : prev.birthYear;

        if (day && month && year) {
          newData.dateOfBirth = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          console.log("✅ Date of Birth updated:", newData.dateOfBirth);
        }
      }

      return newData;
    });
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    // Check all required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.nickname ||
      !formData.gender ||
      !formData.shirtSize ||
      !formData.gloveSize
    ) {
      setError({
        type: "INVALID_INPUT",
        message: "Harap lengkapi semua kolom yang wajib diisi",
      });
      return false;
    }

    // Validate password (minimum 3 characters only)
    if (formData.password.length < 3) {
      setError({
        type: "INVALID_INPUT",
        message: "Password minimal 3 karakter",
      });
      return false;
    }

    // Validate club sets
    if (
      !formData.drivers[0]?.brand ||
      !formData.drivers[0]?.model ||
      !formData.fairways[0]?.brand ||
      !formData.fairways[0]?.model ||
      !formData.hybrids[0]?.brand ||
      !formData.hybrids[0]?.model ||
      !formData.irons[0]?.brand ||
      !formData.irons[0]?.model ||
      !formData.wedges[0]?.brand ||
      !formData.wedges[0]?.model ||
      !formData.putters[0]?.brand ||
      !formData.putters[0]?.model ||
      !formData.golfBalls[0]?.brand ||
      !formData.golfBalls[0]?.model
    ) {
      setError({
        type: "INVALID_INPUT",
        message: "Harap lengkapi semua informasi club sets",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError({
        type: "INVALID_INPUT",
        message: "Format email tidak valid",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError(null);
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Username = nama lengkap
      const username = formData.name;

      // Debug: Log data before sending
      console.group("📤 Sending Registration Data");
      console.log("dateOfBirth:", formData.dateOfBirth);
      console.log("golfBalls:", formData.golfBalls);
      console.log("All formData:", formData);
      console.groupEnd();

      // Register user
      setUploadProgress(50);
      const result = await registerMutation({
        name: formData.name,
        email: formData.email,
        username: username,
        password: formData.password,
        phone: formData.phone || undefined,
        nickname: formData.nickname || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        shirtSize: formData.shirtSize || undefined,
        gloveSize: formData.gloveSize || undefined,
        drivers: formData.drivers.length > 0 ? formData.drivers : undefined,
        fairways: formData.fairways.length > 0 ? formData.fairways : undefined,
        hybrids: formData.hybrids.length > 0 ? formData.hybrids : undefined,
        irons: formData.irons.length > 0 ? formData.irons : undefined,
        wedges: formData.wedges.length > 0 ? formData.wedges : undefined,
        putters: formData.putters.length > 0 ? formData.putters : undefined,
        golfBalls:
          formData.golfBalls.length > 0 ? formData.golfBalls : undefined,
        role: "player",
      });

      setUploadProgress(100);

      if (result.success) {
        setUploadProgress(100);
        // Tampilkan disclaimer setelah registrasi berhasil
        setShowDisclaimerModal(true);
      }
    } catch (err) {
      setUploadProgress(0);
      if (err instanceof Error) {
        const message = err.message.toLowerCase();

        if (message.includes("nickname already")) {
          setError({
            type: "INVALID_INPUT",
            message: "Nama alias sudah digunakan, coba yang lain",
          });
        } else if (message.includes("email already")) {
          setError({
            type: "EMAIL_EXISTS",
            message: "Email sudah terdaftar",
          });
        } else if (message.includes("network") || message.includes("fetch")) {
          setError({
            type: "NETWORK_ERROR",
            message: "Masalah koneksi. Coba lagi.",
          });
        } else {
          setError({
            type: "UNKNOWN_ERROR",
            message: err.message || "Terjadi kesalahan. Coba lagi.",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return <RegistrationLoadingSkeleton />;
  }

  return (
    <>
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onNavigateToLogin={() => {
          setShowDisclaimerModal(false);
          navigate("/player/login", {
            state: {
              message: "Registrasi berhasil! Silakan login dengan akun Anda.",
            },
          });
        }}
      />

      <WelcomeInfoModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      <SizeGuideModal
        isOpen={showSizeGuide !== null}
        onClose={() => setShowSizeGuide(null)}
        type={showSizeGuide || "shirt"}
      />

      <div className="min-h-screen w-full bg-gradient-to-b from-[#2e2e2e] via-[#111827] to-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-600/20 via-transparent to-transparent"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative w-full max-w-2xl animate-fade-in my-8 mt-[10px]">
          {/* Back button */}
          {/* <Link
            to="/player/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Kembali ke Login</span>
          </Link> */}

          {/* Main Card */}
          <div className="bg-gradient-to-b from-[#2e2e2e] via-[#131313] to-black backdrop-blur-xl rounded-3xl shadow-2xl border border-red-900/40 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-red-900 via-red-700 to-red-900"></div>

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20  ">
                  <img
                    src="/ttiltlist-landing.png"
                    alt="GolfScore Logo"
                    className="w-full h-full object-contain "
                  />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Registrasi Pemain
                </h1>
                <p className="text-gray-400 text-sm">
                  Lengkapi informasi Anda untuk bergabung
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"
                  >
                    <span>Nama Lengkap</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700"
                      placeholder="Masukkan nama lengkap Anda"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"
                  >
                    <span>Email</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"
                  >
                    <span>Password</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Masukkan password (minimal 3 karakter)"
                    iconLeft={
                      <Lock className="h-5 w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />
                    }
                    className="w-full pl-11 pr-12 py-3 text-sm text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"
                  >
                    <span>Nomor Telepon</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                {/* Nickname */}
                <div>
                  <label
                    htmlFor="nickname"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"
                  >
                    <span>Nama Alias</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Nama yang ingin tercetak dalam merchandise
                  </p>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <input
                      id="nickname"
                      name="nickname"
                      type="text"
                      placeholder="...."
                      value={formData.nickname}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-11 pr-4 py-3 text-sm text-white bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="h-4 w-4 text-red-700" />
                    <span>Tanggal Lahir</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Day */}
                    <div>
                      <select
                        name="birthDay"
                        value={formData.birthDay}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 text-sm text-white bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#1a1a1a]">
                          Tanggal
                        </option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <option
                              key={day}
                              value={day}
                              className="bg-[#1a1a1a]"
                            >
                              {day}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* Month */}
                    <div>
                      <select
                        name="birthMonth"
                        value={formData.birthMonth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 text-sm text-white bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#1a1a1a]">
                          Bulan
                        </option>
                        <option value="1" className="bg-[#1a1a1a]">
                          Januari
                        </option>
                        <option value="2" className="bg-[#1a1a1a]">
                          Februari
                        </option>
                        <option value="3" className="bg-[#1a1a1a]">
                          Maret
                        </option>
                        <option value="4" className="bg-[#1a1a1a]">
                          April
                        </option>
                        <option value="5" className="bg-[#1a1a1a]">
                          Mei
                        </option>
                        <option value="6" className="bg-[#1a1a1a]">
                          Juni
                        </option>
                        <option value="7" className="bg-[#1a1a1a]">
                          Juli
                        </option>
                        <option value="8" className="bg-[#1a1a1a]">
                          Agustus
                        </option>
                        <option value="9" className="bg-[#1a1a1a]">
                          September
                        </option>
                        <option value="10" className="bg-[#1a1a1a]">
                          Oktober
                        </option>
                        <option value="11" className="bg-[#1a1a1a]">
                          November
                        </option>
                        <option value="12" className="bg-[#1a1a1a]">
                          Desember
                        </option>
                      </select>
                    </div>

                    {/* Year */}
                    <div>
                      <select
                        name="birthYear"
                        value={formData.birthYear}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 text-sm text-white bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#1a1a1a]">
                          Tahun
                        </option>
                        {Array.from(
                          { length: 100 },
                          (_, i) => new Date().getFullYear() - i,
                        ).map((year) => (
                          <option
                            key={year}
                            value={year}
                            className="bg-[#1a1a1a]"
                          >
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formData.birthDay &&
                    formData.birthMonth &&
                    formData.birthYear && (
                      <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Tanggal lahir: {formData.birthDay}{" "}
                        {
                          [
                            "",
                            "Januari",
                            "Februari",
                            "Maret",
                            "April",
                            "Mei",
                            "Juni",
                            "Juli",
                            "Agustus",
                            "September",
                            "Oktober",
                            "November",
                            "Desember",
                          ][parseInt(formData.birthMonth)]
                        }{" "}
                        {formData.birthYear}
                      </p>
                    )}
                </div>

                {/* Gender */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <span>Jenis Kelamin</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, gender: "male" }))
                      }
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                        formData.gender === "male"
                          ? "bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700"
                          : "bg-[#181919b3] text-gray-400 border-2 border-[#2d2d2d] hover:border-gray-700"
                      }`}
                    >
                      Pria
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, gender: "female" }))
                      }
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                        formData.gender === "female"
                          ? "bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700"
                          : "bg-[#181919b3] text-gray-400 border-2 border-[#2d2d2d] hover:border-gray-700"
                      }`}
                    >
                      Wanita
                    </button>
                  </div>
                </div>

                {/* Shirt Size & Glove Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        Ukuran Baju
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["S", "M", "L", "XL", "2XL", "3XL"] as const).map(
                        (size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                shirtSize: size,
                              }))
                            }
                            className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                              formData.shirtSize === size
                                ? "bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700 shadow-lg"
                                : "bg-[#181919b3] text-gray-400 border-2 border-[#2d2d2d] hover:border-gray-700"
                            }`}
                          >
                            {size}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-gray-300 mb-2">
                      <span className="flex items-center gap-2">
                        Ukuran Sarung Tangan
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(["22", "23", "24", "25", "26"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              gloveSize: size,
                            }))
                          }
                          className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                            formData.gloveSize === size
                              ? "bg-gradient-to-r from-red-900 to-red-800 text-white border-2 border-red-700 shadow-lg"
                              : "bg-[#181919b3] text-gray-400 border-2 border-[#2d2d2d] hover:border-gray-700"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Club Sets Selector */}
                <ClubSetsSelectorSimple
                  drivers={formData.drivers}
                  fairways={formData.fairways}
                  hybrids={formData.hybrids}
                  irons={formData.irons}
                  wedges={formData.wedges}
                  putters={formData.putters}
                  golfBalls={formData.golfBalls}
                  onChange={(category, clubs) => {
                    setFormData((prev) => ({ ...prev, [category]: clubs }));
                  }}
                />

                {/* Error Message */}
                {error && (
                  <div className="bg-red-950/50 border-2 border-red-900/50 text-white px-4 py-3 rounded-xl flex items-start animate-fade-in">
                    <AlertCircle className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error.message}</span>
                  </div>
                )}

                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Memproses...
                      </span>
                      <span className="text-sm font-semibold text-red-500">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-900 to-red-700 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {uploadProgress === 100
                          ? "Menyelesaikan..."
                          : "Mendaftar..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Daftar Sekarang
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-sm text-gray-400">
                  Sudah punya akun?{" "}
                  <Link
                    to="/player/login"
                    className="font-semibold text-red-700 hover:text-red-600 transition-colors"
                  >
                    Login di sini
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600 font-medium">
              © 2024 GolfScoreID. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
