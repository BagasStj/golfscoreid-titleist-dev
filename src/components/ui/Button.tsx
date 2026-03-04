import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white focus:ring-red-500 active:scale-95 shadow-[0_4px_12px_rgba(139,0,0,0.4)] border border-red-900/40',
    secondary: 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 focus:ring-gray-500 active:scale-95 border border-gray-700/60',
    danger: 'bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white focus:ring-red-500 active:scale-95 shadow-[0_4px_12px_rgba(139,0,0,0.4)] border border-red-900/40',
    ghost: 'bg-transparent text-gray-300 hover:bg-gray-800/60 focus:ring-red-500 active:bg-gray-900/60',
    outline: 'bg-transparent border-2 border-gray-700/60 text-gray-300 hover:bg-gray-800/60 hover:border-red-900/60 focus:ring-red-500 active:bg-gray-900/60',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[36px]',
    md: 'px-4 py-2 text-base gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-lg gap-2.5 min-h-[52px]',
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" aria-hidden="true" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" aria-hidden="true" />}
        </>
      )}
    </button>
  );
};
