'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole, LoginDto, RegisterDto, authApi, setAuthToken, getAuthToken } from '@/lib/api';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isUser: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const user = await authApi.getProfile();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token is invalid, clear it
          setAuthToken(null);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (data: LoginDto) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authApi.login(data);
      setAuthToken(response.access_token);
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterDto) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authApi.register(data);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authApi.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  // Clear error function
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Role checking functions
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!state.user || !state.user.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(state.user.role);
    }
    
    return state.user.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole(['ADMIN', 'SUPER_ADMIN']);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('SUPER_ADMIN');
  };

  const isUser = (): boolean => {
    return hasRole('USER');
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks
export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useIsAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin;
}

export function useIsSuperAdmin() {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin;
}

export function useIsUser() {
  const { isUser } = useAuth();
  return isUser;
}
