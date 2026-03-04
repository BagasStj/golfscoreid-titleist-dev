import React, { useEffect, useRef } from 'react';
import { X, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { NavigationItem } from './Sidebar';
import { Button } from './Button';

export interface MobileMenuProps {
  items: NavigationItem[];
  userRole: 'admin' | 'player';
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  items,
  userRole,
  isOpen,
  onToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      menuRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);
  
  const handleNavigation = (item: NavigationItem) => {
    if (!item.disabled) {
      navigate(item.path);
      onToggle();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, item: NavigationItem) => {
    if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
      e.preventDefault();
      navigate(item.path);
      onToggle();
    }
  };
  
  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="md"
        icon={Menu}
        onClick={onToggle}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        className="lg:hidden !min-h-[44px] !min-w-[44px]"
      >
        <span className="sr-only">Menu</span>
      </Button>
      
      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onToggle}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div
            ref={menuRef}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl animate-slide-in"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">
                Navigation
              </h2>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={onToggle}
                aria-label="Close navigation menu"
                className="!min-h-[44px] !min-w-[44px] !p-2"
              >
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
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
            
            {/* Footer */}
            <div className="p-4 border-t border-secondary-200">
              <div className="text-xs text-secondary-500 text-center">
                Logged in as <span className="font-medium capitalize">{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
