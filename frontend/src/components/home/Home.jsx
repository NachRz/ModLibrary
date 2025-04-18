import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-custom-bg">
      {/* Navbar */}
      <nav className="bg-custom-card border-b border-custom-detail/10 shadow-custom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-custom-text">ModLibrary</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogin}
                className="ml-4 px-6 py-2 rounded-custom text-sm font-medium text-custom-text bg-custom-primary hover:bg-custom-primary-hover transition-all duration-300 transform hover:scale-105"
              >
                {isLoggedIn ? 'Ir al Dashboard' : 'Iniciar Sesión'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-custom-text sm:text-5xl md:text-6xl">
            <span className="block">Bienvenido a</span>
            <span className="block text-custom-secondary">ModLibrary</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-custom-detail sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Tu biblioteca digital de juegos. Organiza, gestiona y disfruta de tu colección de videojuegos en un solo lugar.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-custom shadow-custom-lg">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-custom text-custom-text bg-custom-primary hover:bg-custom-primary-hover transition-all duration-300 transform hover:scale-105 md:py-4 md:text-lg md:px-10"
              >
                {isLoggedIn ? 'Continuar al Dashboard' : 'Comenzar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Feature 1 */}
          <div className="bg-custom-card rounded-custom p-6 border border-custom-detail/10 shadow-custom hover:shadow-custom-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center h-12 w-12 rounded-custom bg-custom-secondary text-custom-text">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-custom-text">Organización</h3>
            <p className="mt-2 text-base text-custom-detail">
              Mantén tu colección de juegos organizada y fácil de encontrar.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-custom-card rounded-custom p-6 border border-custom-detail/10 shadow-custom hover:shadow-custom-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center h-12 w-12 rounded-custom bg-custom-accent text-custom-text">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-custom-text">Gestión</h3>
            <p className="mt-2 text-base text-custom-detail">
              Añade, edita y elimina juegos de tu biblioteca con facilidad.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home; 