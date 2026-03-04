import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: XCircle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-950/60',
      buttonBg: 'bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800',
      borderColor: 'border-red-900/40',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-950/60',
      buttonBg: 'bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-900 hover:from-yellow-800 hover:via-yellow-700 hover:to-yellow-800',
      borderColor: 'border-yellow-900/40',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-950/60',
      buttonBg: 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 hover:from-blue-800 hover:via-blue-700 hover:to-blue-800',
      borderColor: 'border-blue-900/40',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-950/60',
      buttonBg: 'bg-gradient-to-r from-green-900 via-green-800 to-green-900 hover:from-green-800 hover:via-green-700 hover:to-green-800',
      borderColor: 'border-green-900/40',
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-gray-800/60 max-w-lg w-full transform transition-all animate-scaleIn"
        style={{
          animation: 'scaleIn 0.2s ease-out'
        }}
      >
        {/* Decorative Top Bar */}
        <div className={`h-2 rounded-t-2xl ${
          variant === 'danger' ? 'bg-gradient-to-r from-red-900 to-red-800' :
          variant === 'warning' ? 'bg-gradient-to-r from-yellow-900 to-yellow-800' :
          variant === 'success' ? 'bg-gradient-to-r from-green-900 to-green-800' :
          'bg-gradient-to-r from-blue-900 to-blue-800'
        }`} />

        {/* Icon Header */}
        <div className="p-8 text-center">
          <div className={`mx-auto w-20 h-20 ${style.iconBg} rounded-2xl flex items-center justify-center mb-5 shadow-lg transform hover:scale-105 transition-transform border ${style.borderColor}`}>
            <Icon className={`w-10 h-10 ${style.iconColor}`} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-400 leading-relaxed text-base">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 bg-gray-900/60 rounded-b-2xl flex items-center justify-center gap-4 border-t border-gray-800/60">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-8 py-3 text-gray-300 bg-gray-800/60 hover:bg-gray-700/60 border-2 border-gray-700/60 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-8 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border ${style.borderColor} ${style.buttonBg}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
