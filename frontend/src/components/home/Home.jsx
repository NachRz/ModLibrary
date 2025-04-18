import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Si hubiera un sistema real de autenticación, aquí obtendríamos el nombre del usuario
    if (token) {
      setUsername('Usuario');
    }
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
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-custom-text sm:text-5xl md:text-6xl">
            <span className="block">Bienvenido a</span>
            <span className="block text-custom-secondary">ModLibrary</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-custom-detail sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Tu biblioteca digital de Mods. Organiza, gestiona y disfruta de tu colección de Mods en un solo lugar.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-custom shadow-custom-lg">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-custom text-custom-text bg-custom-primary hover:bg-custom-primary-hover transition-all duration-300 transform hover:scale-105 md:py-4 md:text-lg md:px-10"
              >
                {isLoggedIn ? 'Mi Panel' : 'Iniciar sesión'}
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
    </div>
  );
};

export default Home; 