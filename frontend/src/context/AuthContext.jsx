import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/api/authService';
import apiClient from '../services/api/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario es admin
  const checkAdminStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await apiClient.get('/user/is-admin');
        setIsAdmin(response.data.is_admin);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error al verificar estado de admin:', error);
      setIsAdmin(false);
    }
  };

  // Inicializar el contexto
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        await checkAdminStatus();
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Función para hacer login
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      await checkAdminStatus();
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Función para hacer logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error al hacer logout:', error);
      // Limpiar estado de todos modos
      setUser(null);
      setIsAdmin(false);
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
    checkAdminStatus,
    isAuthenticated: authService.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 