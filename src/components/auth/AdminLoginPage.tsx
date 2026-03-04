import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, WifiOff, Clock, Shield } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

type AuthErrorType = 
  | 'INVALID_CREDENTIALS'
  | 'NETWORK_ERROR'
  | 'SESSION_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'UNKNOWN_ERROR';

interface AuthError {
  type: AuthErrorType;
  message: string;
}

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const loginMutation = useMutation(api.users.login);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { reason?: string } | null;
    if (state?.reason === 'unauthenticated') {
      setError({
        type: 'SESSION_EXPIRED',
        message: 'Sesi Anda telah berakhir. Silakan login kembali.'
      });
    }
    
    setIsInitialLoading(false);
  }, [location]);

  const getErrorFromException = (err: unknown): AuthError => {
    if (err instanceof Error) {
      const message = err.message.toLowerCase();
      
      if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return {
          type: 'NETWORK_ERROR',
          message: 'Tidak dapat terhubung. Silakan periksa koneksi Anda.'
        };
      }
      
      if (message.includes('invalid credentials') || message.includes('invalid') || message.includes('credentials')) {
        return {
          type: 'INVALID_CREDENTIALS',
          message: 'Kredensial admin tidak valid.'
        };
      }
      
      if (message.includes('permission') || message.includes('unauthorized') || message.includes('access denied')) {
        return {
          type: 'INSUFFICIENT_PERMISSIONS',
          message: 'Anda tidak memiliki hak akses admin.'
        };
      }
      
      return {
        type: 'UNKNOWN_ERROR',
        message: err.message || 'Terjadi kesalahan. Silakan coba lagi.'
      };
    }
    
    return {
      type: 'UNKNOWN_ERROR',
      message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
    };
  };

  const getErrorIcon = (type: AuthErrorType) => {
    switch (type) {
      case 'NETWORK_ERROR':
        return <WifiOff className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />;
      case 'SESSION_EXPIRED':
        return <Clock className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />;
      default:
        return <AlertCircle className="h-5 w-5 mr-2.5 mt-0.5 flex-shrink-0" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginMutation({
        identifier,
        password,
      });
      
      if (result.success && result.user) {
        // Debug: Log user data
        console.group('🔐 Admin Login Success');
        console.log('User:', result.user);
        console.log('Role:', result.user.role);
        console.log('Name:', result.user.name);
        console.groupEnd();
        
        if (result.user.role !== 'admin') {
          console.error('❌ Role mismatch: Expected "admin", got:', result.user.role);
          setError({
            type: 'INSUFFICIENT_PERMISSIONS',
            message: 'Login ini khusus untuk administrator.'
          });
          setIsLoading(false);
          return;
        }
        
        login(result.user);
        console.log('✅ Navigating to /admin');
        navigate('/admin', { replace: true });
      } else {
        setError({
          type: 'UNKNOWN_ERROR',
          message: 'Login gagal. Silakan coba lagi.'
        });
      }
    } catch (err) {
      const authError = getErrorFromException(err);
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#2e2e2e] via-[#171718] to-black flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Elegant background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Metallic shine effect - top */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-600/20 via-transparent to-transparent"></div>
        
        {/* Dark red gradient orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-red-950/30 to-black/20 rounded-full blur-3xl"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative w-full max-w-[480px] animate-fade-in mt-[-5vh]">
        {/* Main Card */}
        <div className="bg-gradient-to-b from-[#2e2e2e] via-[#131313] to-black backdrop-blur-xl rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_80px_rgba(139,0,0,0.2)] border border-red-900/40 overflow-hidden">
          {/* Decorative top bar - dark red gradient */}
          <div className="h-1.5 sm:h-2 bg-gradient-to-r from-red-900 via-red-700 to-red-900"></div>
          
          <div className="p-6 sm:p-8 md:p-10">
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8">
              {/* Logo Image */}
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#6b6b6b] to-[#141414] rounded-[20px] sm:rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_40px_rgba(139,0,0,0.3)] mb-4 sm:mb-6 relative group p-3 sm:p-4 border border-red-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent rounded-[20px] sm:rounded-[24px]"></div>
                <img 
                  src="/full-color-mark.png" 
                  alt="GolfScore Logo" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_2px_8px_rgba(139,0,0,0.4)]"
                />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-800/20 to-transparent rounded-[20px] sm:rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                Portal Admin
              </h1>
              <p className="text-gray-400 text-sm sm:text-base font-medium">
                Sistem Manajemen Turnamen
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Username Input */}
              <div>
                <label htmlFor="identifier" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-2.5">
                  <span>Username / Email / Nama</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-gray-600 bg-[#181919b3] border-2 border-[#2d2d2d] rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-800 focus:bg-black/50 transition-all duration-200 hover:border-gray-700"
                    placeholder="Masukkan username, email, atau nama"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-2.5">
                  <span>Kata Sandi</span>
                  <span className="text-red-500">*</span>
                </label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  placeholder="Masukkan kata sandi"
                  iconLeft={<Lock className="h-4 w-4 sm:h-5 sm:w-5 text-red-700 group-focus-within:text-red-600 transition-colors" />}
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-800 bg-gray-900 border-2 border-gray-700 rounded-md sm:rounded-lg focus:ring-2 focus:ring-red-900/50 transition-all cursor-pointer"
                  />
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
                    Ingat saya
                  </span>
                </label>
                <a 
                  href="#" 
                  className="text-xs sm:text-sm font-semibold text-red-700 hover:text-red-600 transition-colors"
                >
                  Lupa Kata Sandi?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-950/50 border-2 border-red-900/50 text-red-400 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl flex items-start animate-fade-in">
                  {getErrorIcon(error.type)}
                  <span className="text-xs sm:text-sm font-medium">{error.message}</span>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-[0_8px_24px_rgba(139,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(139,0,0,0.5)] active:shadow-[0_4px_16px_rgba(139,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                      Sedang login...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 sm:mt-8 text-center p-3 sm:p-4 bg-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-800">
              <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-400">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Akses khusus admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="flex items-center justify-center space-x-2">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              © 2026 GolfScore ID. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
