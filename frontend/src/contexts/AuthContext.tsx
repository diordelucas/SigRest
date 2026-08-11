import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';

export type UserRole = 'ADMIN' | 'OPERADOR';

export interface AuthenticatedUser {
  name: string;
  email: string;
  role: UserRole;
}

interface LoginResponse {
  token: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  signed: boolean;
  currentUser: AuthenticatedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@sigrest:token');
    const storageUser = localStorage.getItem('@sigrest:user');
    if (token && storageUser) {
      setCurrentUser(JSON.parse(storageUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/user/login', { email, password });
    const { token, name, email: userEmail, role } = response.data;
    const user: AuthenticatedUser = { name, email: userEmail, role };
    localStorage.setItem('@sigrest:token', token);
    localStorage.setItem('@sigrest:user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const signOut = () => {
    localStorage.removeItem('@sigrest:token');
    localStorage.removeItem('@sigrest:user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!currentUser, currentUser, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider');
  }
  return context;
}
