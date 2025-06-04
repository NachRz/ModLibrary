import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/components/home/Home.css'; // Ruta actualizada del archivo CSS

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

  const features = [
    {
      title: "Organización",
      description: "Mantén tu colección de mods organizada y fácil de encontrar con filtros avanzados y categorización inteligente.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      color: "bg-custom-secondary"
    },
    {
      title: "Gestión",
      description: "Añade, edita y elimina mods de tu biblioteca con facilidad. Mantén un seguimiento de sus versiones y actualizaciones.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: "bg-custom-accent"
    },
    {
      title: "Comunidad",
      description: "Comparte tus mods con otros usuarios, recibe valoraciones y descubre nuevas creaciones populares.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-custom-tertiary"
    }
  ];

  const stats = [
    { number: "10K+", label: "Mods disponibles" },
    { number: "500+", label: "Juegos compatibles" },
    { number: "50K+", label: "Usuarios activos" },
    { number: "1M+", label: "Descargas mensuales" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-custom-bg to-custom-bg/90">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-custom-primary/10 via-custom-secondary/10 to-custom-tertiary/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 relative z-1">
          <div className="text-center">
            <h1 className="text-5xl tracking-tight font-extrabold text-custom-text sm:text-6xl md:text-7xl">
              <span className="block mb-2">Tu biblioteca de</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-custom-secondary to-custom-tertiary">
                Mods Definitiva
              </span>
            </h1>
            <p className="mt-8 max-w-lg mx-auto text-lg text-custom-detail/90 sm:max-w-3xl leading-relaxed">
              Organiza, gestiona y comparte tus mods favoritos en un solo lugar. 
              Descubre nuevas creaciones y mantén tus juegos siempre actualizados con las mejores modificaciones.
            </p>
            <div className="mt-12 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                <button
                  onClick={handleLogin}
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-custom text-custom-text bg-custom-secondary hover:bg-custom-secondary/80 shadow-custom-lg hover:shadow-custom transition-all duration-300 transform hover:scale-105"
                >
                  {isLoggedIn ? 'Mi Panel' : 'Iniciar sesión'}
                </button>
                <button
                  onClick={() => navigate('/mods')}
                  className="flex items-center justify-center px-8 py-3 border border-custom-tertiary text-base font-medium rounded-custom text-custom-text bg-transparent hover:bg-custom-tertiary/10 shadow-custom-lg hover:shadow-custom transition-all duration-300 transform hover:scale-105"
                >
                  Explorar mods
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-custom-card/30 backdrop-blur-sm border-y border-custom-detail/10">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform transition-all duration-500 hover:scale-105">
                <span className="block text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-custom-secondary to-custom-accent">{stat.number}</span>
                <span className="block mt-2 text-custom-detail text-sm font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-custom-accent uppercase tracking-wider font-semibold">Funcionalidades</span>
          <h2 className="mt-2 text-3xl font-extrabold text-custom-text sm:text-4xl">
            <span className="block">Todo lo que necesitas para</span>
            <span className="block text-custom-secondary">gestionar tus mods</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-custom-detail/80">
            Una plataforma completa diseñada para todos los amantes de las modificaciones de juegos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-custom-card/60 backdrop-blur-sm rounded-2xl p-8 border border-custom-detail/10 shadow-custom hover:shadow-custom-lg transition-all duration-500 hover:transform hover:-translate-y-2 group w-full max-w-sm min-h-[320px] flex flex-col"
            >
              <div className={`flex items-center justify-center h-14 w-14 rounded-xl ${feature.color} text-custom-text mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-custom-text mb-3 group-hover:text-custom-secondary transition-colors duration-300">{feature.title}</h3>
              <p className="text-custom-detail/80 flex-grow">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-custom-primary to-custom-secondary/90 relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-10 w-60 h-60 bg-white rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '3s'}}></div>
          
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8 lg:py-24 relative z-10">
            <div className="text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-custom-text px-4 py-2 rounded-full text-sm font-medium mb-6">
                ¡Únete a más de 50.000 usuarios!
              </span>
              <h2 className="text-3xl font-extrabold text-custom-text sm:text-4xl">
                <span className="block">¿Listo para comenzar?</span>
                <span className="block mt-2">Únete a la comunidad hoy mismo</span>
              </h2>
              <p className="mt-6 text-lg text-custom-text/90 max-w-2xl mx-auto">
                Empieza a organizar tu colección de mods, comparte tus creaciones 
                y descubre un mundo de posibilidades para tus juegos favoritos.
              </p>
              <div className="mt-10">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-custom text-custom-primary bg-white hover:bg-gray-100 shadow-custom-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span>Crear cuenta gratuita</span>
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home; 