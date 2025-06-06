import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '../../App';

const NotFound = () => {
  const navigate = useNavigate();
  const { setHideLayout } = useLayout();

  // Ocultar navbar y footer cuando se monte el componente
  useEffect(() => {
    setHideLayout(true);
    
    // Limpiar al desmontar el componente
    return () => {
      setHideLayout(false);
    };
  }, [setHideLayout]);

  const goHome = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

    return (
        <div className="min-h-screen bg-gradient-to-b from-custom-bg to-custom-bg/90 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                {/* Ilustración 404 */}
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-custom-primary/10 via-custom-secondary/10 to-custom-tertiary/10 rounded-3xl blur-3xl"></div>
                    <div className="relative bg-custom-card/60 backdrop-blur-sm rounded-3xl p-16 border border-custom-detail/10 shadow-custom-lg">
                        <div className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-custom-secondary to-custom-tertiary mb-4">
                            404
                        </div>
                        <div className="flex justify-center space-x-4 mb-8">
                            {/* Iconos decorativos */}
                            <div className="w-8 h-8 bg-custom-secondary rounded-full animate-bounce"></div>
                            <div className="w-8 h-8 bg-custom-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-8 h-8 bg-custom-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-custom-text mb-6">
                        ¡Oops! Página no encontrada
                    </h1>
                    <p className="text-xl text-custom-detail/80 mb-4 max-w-2xl mx-auto">
                        Parece que esta página se perdió en el universo de los mods.
                        No te preocupes, te ayudamos a encontrar el camino de vuelta.
                    </p>
                    <p className="text-lg text-custom-detail/60 max-w-xl mx-auto">
                        La página que buscas no existe o ha sido movida a otra ubicación.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                    <button
                        onClick={goHome}
                        className="inline-flex items-center justify-center px-8 py-4 bg-custom-secondary hover:bg-custom-secondary/80 text-custom-text font-medium rounded-custom shadow-custom-lg hover:shadow-custom transition-all duration-300 transform hover:scale-105"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h4m0 0h3a1 1 0 001-1V10M9 21h6" />
                        </svg>
                        Ir al inicio
                    </button>

                    <button
                        onClick={goBack}
                        className="inline-flex items-center justify-center px-8 py-4 border border-custom-tertiary text-custom-text bg-transparent hover:bg-custom-tertiary/10 font-medium rounded-custom shadow-custom-lg hover:shadow-custom transition-all duration-300 transform hover:scale-105"
                    >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver atrás
                    </button>
                </div>

                {/* Sugerencias útiles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-custom-card/40 backdrop-blur-sm rounded-2xl p-6 border border-custom-detail/10 shadow-custom hover:shadow-custom-lg transition-all duration-300 group">
                        <div className="flex items-center justify-center h-12 w-12 bg-custom-accent rounded-xl text-custom-text mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-custom-text mb-2">Explorar Mods</h3>
                        <p className="text-custom-detail/70 text-sm mb-4">Descubre nuestra colección de mods populares</p>
                        <button
                            onClick={() => navigate('/mods')}
                            className="text-custom-secondary hover:text-custom-secondary/80 font-medium transition-colors duration-200"
                        >
                            Ver mods →
                        </button>
                    </div>

                    <div className="bg-custom-card/40 backdrop-blur-sm rounded-2xl p-6 border border-custom-detail/10 shadow-custom hover:shadow-custom-lg transition-all duration-300 group">
                        <div className="flex items-center justify-center h-12 w-12 bg-custom-tertiary rounded-xl text-custom-text mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-custom-text mb-2">Contacto</h3>
                        <p className="text-custom-detail/70 text-sm mb-4">¿Necesitas ayuda? Contáctanos</p>
                        <button
                            onClick={() => navigate('/contacto')}
                            className="text-custom-secondary hover:text-custom-secondary/80 font-medium transition-colors duration-200"
                        >
                            Contactar →
                        </button>
                    </div>

                    <div className="bg-custom-card/40 backdrop-blur-sm rounded-2xl p-6 border border-custom-detail/10 shadow-custom hover:shadow-custom-lg transition-all duration-300 group">
                        <div className="flex items-center justify-center h-12 w-12 bg-custom-primary rounded-xl text-custom-text mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-custom-text mb-2">Juegos</h3>
                        <p className="text-custom-detail/70 text-sm mb-4">Explora los juegos disponibles</p>
                        <button
                            onClick={() => navigate('/juegos')}
                            className="text-custom-secondary hover:text-custom-secondary/80 font-medium transition-colors duration-200"
                        >
                            Ver juegos →
                        </button>
                    </div>
                </div>

                {/* Elementos decorativos de fondo */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-custom-secondary rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-custom-tertiary rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
    );
};

export default NotFound; 