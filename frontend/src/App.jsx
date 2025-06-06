import React, { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import './assets/styles/context/notifications/Notification.css';
import AppRoutes from './routes';

// Contexto para controlar el layout
const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// Rutas que no deben mostrar el navbar ni el footer
const noLayoutRoutes = ['/login', '/register', '/reset-password'];

function App() {
  const location = useLocation();
  const [hideLayout, setHideLayout] = useState(false);
  
  const shouldShowLayout = !noLayoutRoutes.includes(location.pathname) && !hideLayout;

  return (
    <AuthProvider>
      <NotificationProvider>
        <LayoutContext.Provider value={{ hideLayout, setHideLayout }}>
          <div className="flex flex-col min-h-screen bg-custom-bg text-custom-text">
            {shouldShowLayout && <Navbar />}
            <main className="flex-grow">
              <AppRoutes />
            </main>
            {shouldShowLayout && <Footer />}
          </div>
        </LayoutContext.Provider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App
