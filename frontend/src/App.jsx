import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import './assets/styles/context/notifications/Notification.css';
import AppRoutes from './routes';

// Rutas que no deben mostrar el navbar ni el footer
const noLayoutRoutes = ['/login', '/register', '/reset-password'];

function App() {
  const location = useLocation();
  const shouldShowLayout = !noLayoutRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="flex flex-col min-h-screen bg-custom-bg text-custom-text">
          {shouldShowLayout && <Navbar />}
          <main className="flex-grow">
            <AppRoutes />
          </main>
          {shouldShowLayout && <Footer />}
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App
