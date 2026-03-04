import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number | string;
  disabled?: boolean;
}

export interface SidebarProps {
  items: NavigationItem[];
  userRole: 'admin' | 'player';
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  items, 
  userRole, 
  className = '',
  isOpen = false,
  onClose
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (item: NavigationItem) => {
    if (!item.disabled) {
      navigate(item.path);
      // Close sidebar on mobile after navigation
      if (onClose) {
        onClose();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, item: NavigationItem) => {
    if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
      e.preventDefault();
      navigate(item.path);
      if (onClose) {
        onClose();
      }
    }
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-secondary-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          ${className}
        `}
        aria-label="Main navigation"
      >
        {/* Logo Header */}
        {/* <div className="h-16 flex items-center gap-3 px-6 border-b border-secondary-200">
          <img 
            src="/logo-app.png" 
            alt="GolfScore ID Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-primary-700">GolfScore ID</h1>
        </div> */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                transition-all duration-200 min-h-[44px]
                ${isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-secondary-700 hover:bg-secondary-50'
                }
                ${item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              `}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={item.disabled}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`
                    px-2 py-0.5 text-xs font-semibold rounded-full
                    ${isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-200 text-secondary-700'
                    }
                  `}
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-secondary-200">
        <div className="text-xs text-secondary-500 text-center">
          Logged in as <span className="font-medium capitalize">{userRole}</span>
        </div>
      </div>
    </aside>
    </>
  );
};
