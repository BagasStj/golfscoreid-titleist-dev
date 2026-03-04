import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bgColor: '#16a34a', // Green
      iconBgColor: '#15803d',
      icon: '✓',
    },
    error: {
      bgColor: '#dc2626', // Red
      iconBgColor: '#b91c1c',
      icon: '✕',
    },
    info: {
      bgColor: '#2563eb', // Blue
      iconBgColor: '#1d4ed8',
      icon: 'ℹ',
    },
    warning: {
      bgColor: '#f59e0b', // Amber
      iconBgColor: '#d97706',
      icon: '⚠',
    },
  }[type];

  return (
    <div
      style={{ backgroundColor: styles.bgColor }}
      className="text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md animate-slide-in"
      role="alert"
    >
      <div 
        style={{ backgroundColor: styles.iconBgColor }}
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      >
        <span className="text-lg font-bold">{styles.icon}</span>
      </div>
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
        aria-label="Close"
      >
        <span className="text-lg">✕</span>
      </button>
    </div>
  );
}
