import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

type AuthErrorType =
  | "INVALID_INPUT"
  | "EMAIL_NOT_FOUND"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

interface AuthError {
  type: AuthErrorType;
  message: string;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmailMutation = useMutation(api.users.validateEmailForReset);
  const resetPasswordMutation = useMutation(api.users.resetPassword);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError({
        type: "INVALID_INPUT",
        message: "Format email tidak valid",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate email exists in database
      await validateEmailMutation({
        email: email,
      });

      // If successful, email exists, move to password step
      setStep("password");
    } catch (err) {
      if (err instanceof Error) {
        const message = err.message.toLowerCase();

        if (message.includes("tidak terdaftar") || message.includes("not found")) {
          setError({
            type: "EMAIL_NOT_FOUND",
            message: "Email tidak terdaftar",
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password
    if (newPassword.length < 3) {
      setError({
        type: "INVALID_INPUT",
        message: "Password minimal 3 karakter",
      });
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setError({
        type: "INVALID_INPUT",
        message: "Password tidak cocok",
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordMutation({
        email: email,
        newPassword: newPassword,
      });

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/player/login", {
          state: {
            message: "Password berhasil direset! Silakan login dengan password baru Anda.",
          },
        });
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        const message = err.message.toLowerCase();

        if (message.includes("tidak terdaftar") || message.includes("not found")) {
          setError({
            type: "EMAIL_NOT_FOUND",
            message: "Email tidak terdaftar dalam sistem",
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

  return (
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

      <div className="relative w-full max-w-md animate-fade-in">
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
              <div className="inline-flex items-center justify-center w-20 h-20">
                <img
                  src="/ttiltlist-landing.png"
                  alt="GolfScore Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Lupa Password
              </h1>
              <p className="text-gray-400 text-sm">
                {step === "email"
                  ? "Masukkan email Anda untuk reset password"
                  : "Masukkan password baru Anda"}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-950/50 border-2 border-green-900/50 text-white px-4 py-3 rounded-xl flex items-start animate-fade-in">
                <CheckCircle className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Password berhasil direset!</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Anda akan diarahkan ke halaman login...
                  </p>
                </div>
              </div>
            )}

            {/* Email Form */}
            {step === "email" && !success && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      required
                      className="w-full pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-950/50 border-2 border-red-900/50 text-white px-4 py-3 rounded-xl flex items-start animate-fade-in">
                    <AlertCircle className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error.message}</span>
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
                        Memvalidasi...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Lanjutkan
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </form>
            )}

            {/* Password Form */}
            {step === "password" && !success && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"
                  >
                    <span>Password Baru</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <PasswordInput
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    placeholder="Masukkan password baru (minimal 3 karakter)"
                    iconLeft={
                      <Lock className="h-5 w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />
                    }
                    className="w-full pl-11 pr-12 py-3 text-sm text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"
                  >
                    <span>Konfirmasi Password</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    placeholder="Masukkan ulang password baru"
                    iconLeft={
                      <Lock className="h-5 w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />
                    }
                    className="w-full pl-11 pr-12 py-3 text-sm text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all hover:border-gray-700"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-950/50 border-2 border-red-900/50 text-white px-4 py-3 rounded-xl flex items-start animate-fade-in">
                    <AlertCircle className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error.message}</span>
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
                        Mereset Password...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Reset Password
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </form>
            )}

            {/* Login Link */}
            {!success && (
              <div className="mt-6 text-center p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-sm text-gray-400">
                  Ingat password Anda?{" "}
                  <Link
                    to="/player/login"
                    className="font-semibold text-red-700 hover:text-red-600 transition-colors"
                  >
                    Login di sini
                  </Link>
                </p>
              </div>
            )}
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
  );
}
