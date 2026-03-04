import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Id } from '../../convex/_generated/dataModel';

interface User {
  _id: Id<"users">;
  email: string;
  username?: string;
  name: string;
  role: 'admin' | 'player';
  handicap?: number;
  phone?: string;
  nickname?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  workLocation?: string;
  shirtSize?: 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';
  gloveSize?: 'S' | 'M' | 'L' | 'XL' | '22' | '23' | '24' | '25' | '26';
  profilePhotoUrl?: string;
  drivers?: Array<{ brand: string; model: string }>;
  fairways?: Array<{ brand: string; model: string }>;
  hybrids?: Array<{ brand: string; model: string }>;
  utilityIrons?: Array<{ brand: string; model: string }>;
  irons?: Array<{ brand: string; model: string }>;
  wedges?: Array<{ brand: string; model: string }>;
  putters?: Array<{ brand: string; model: string }>;
  golfBalls?: Array<{ brand: string; model: string }>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPlayer: boolean;
  login: (userData: User) => void;
  logout: () => void;
  validateSession: () => boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'golfscore_user';
const SESSION_TIMESTAMP_KEY = 'golfscore_session_timestamp';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate if session is still valid
  const validateSession = (): boolean => {
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const sessionAge = Date.now() - parseInt(timestamp, 10);
    return sessionAge < SESSION_DURATION;
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        // Check if session is still valid
        if (validateSession()) {
          const parsedUser = JSON.parse(storedUser);
          
          // Validate that the user ID is from the correct table
          if (parsedUser._id && typeof parsedUser._id === 'string') {
            // Check if ID is from users table (Convex IDs contain table info)
            // If ID doesn't look valid or is from wrong table, clear it
            if (!parsedUser._id.includes('users') && parsedUser._id.includes('news_confirmations')) {
              console.warn('Invalid user ID detected (wrong table), clearing session');
              localStorage.removeItem(AUTH_STORAGE_KEY);
              localStorage.removeItem(SESSION_TIMESTAMP_KEY);
              setIsLoading(false);
              return;
            }
            setUser(parsedUser);
          } else {
            console.warn('Invalid user data structure, clearing session');
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(SESSION_TIMESTAMP_KEY);
          }
        } else {
          // Session expired, clear storage
          console.log('Session expired, clearing authentication');
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(SESSION_TIMESTAMP_KEY);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Periodically check session validity
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (!validateSession()) {
        console.log('Session expired during use, logging out');
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  const login = (userData: User) => {
    // Validate user data
    if (!userData || !userData._id || !userData.role) {
      console.error('Invalid user data provided to login');
      return;
    }

    // Additional validation: Check if ID is from correct table
    if (typeof userData._id === 'string' && userData._id.includes('news_confirmations')) {
      console.error('Invalid user ID: ID is from wrong table (news_confirmations)');
      alert('Terjadi kesalahan autentikasi. Silakan login ulang.');
      return;
    }

    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
    
    console.log('User logged in:', { 
      id: userData._id, 
      role: userData.role, 
      name: userData.name 
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    console.log('User logged out');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    
    console.log('User data updated:', updatedUser);
  };
  
  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';
  const isPlayer = user?.role === 'player';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isPlayer,
        login,
        logout,
        validateSession,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
