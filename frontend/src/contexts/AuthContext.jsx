import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadStorageData() {
      const storageUser = localStorage.getItem('@sigrest:user');
      if (storageUser) {
        setCurrentUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  const signIn = async (email, password) => {
    const response = await api.post('/user/login', { email, password });
    const user = response.data;
    setCurrentUser(user);
    localStorage.setItem('@sigrest:user', JSON.stringify(user));
  };

  const signOut = () => {
    localStorage.removeItem('@sigrest:user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!currentUser, currentUser, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
