import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { clearTokens, getAccessToken } from '../lib/api';
import type { User, Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setProfile(currentUser.profile || null);
        } else {
          // Token is invalid, clear it
          clearTokens();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = () => {
    // Redirect to Discord OAuth
    window.location.href = authService.getDiscordAuthUrl();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setProfile(currentUser.profile || null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
