import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { user, isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated();

  const renderLoggedOutLinks = () => (
    <>
      {/* Enlaces informativos */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-custom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-custom-text">Información</h3>
        </div>
        <ul className="space-y-3">
          <li>
            <a href="/about" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Acerca de nosotros
            </a>
          </li>
          <li>
            <a href="/terms" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Términos y condiciones
            </a>
          </li>
          <li>
            <a href="/privacy" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Política de privacidad
            </a>
          </li>
          <li>
            <a href="/contacto" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Contacto
            </a>
          </li>
        </ul>
          </div>

      {/* Enlaces de navegación pública */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-custom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="text-lg font-semibold text-custom-text">Navegación</h3>
        </div>
        <ul className="space-y-3">
          <li>
            <a href="/" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
                  Inicio
                </a>
              </li>
              <li>
            <a href="/register" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Crear cuenta
                </a>
              </li>
              <li>
            <a href="/login" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Iniciar sesión
                </a>
              </li>
            </ul>
          </div>

      {/* Redes sociales y contacto */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-custom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <h3 className="text-lg font-semibold text-custom-text">Síguenos</h3>
        </div>
        <ul className="space-y-3">
          <li>
            <a href="#" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 flex items-center group hover:bg-custom-detail/5 rounded-lg p-2 -m-2">
              <svg className="h-5 w-5 mr-3 text-custom-detail group-hover:text-custom-primary transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
              @modlibrary
            </a>
          </li>
          <li>
            <a href="mailto:contacto@modlibrary.com" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 flex items-center group hover:bg-custom-detail/5 rounded-lg p-2 -m-2">
              <svg className="h-5 w-5 mr-3 text-custom-detail group-hover:text-custom-primary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              contacto@modlibrary.com
            </a>
          </li>
        </ul>
      </div>
    </>
  );

  const renderLoggedInLinks = () => (
    <>
      {/* Perfil y cuenta */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-custom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-lg font-semibold text-custom-text">Mi Cuenta</h3>
        </div>
        <ul className="space-y-3">
          <li>
            <a href="/profile" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Mi perfil
            </a>
          </li>
          <li>
            <a href="/settings" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Configuración
            </a>
          </li>
          <li>
            <button 
              onClick={() => window.location.href = '/logout'} 
              className="text-sm text-custom-detail hover:text-red-500 transition-all duration-300 hover:translate-x-1 flex items-center group w-full text-left"
            >
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-red-500 transition-colors duration-300"></span>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>

      {/* Navegación personalizada */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-custom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-custom-text">Mi Biblioteca</h3>
        </div>
        <ul className="space-y-3">
          <li>
            <a href="/dashboard" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Dashboard
            </a>
          </li>
          <li>
            <a href="/dashboard/juegos-favoritos" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Mis Juegos
            </a>
          </li>
          <li>
            <a href="/dashboard/guardados" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Mods Guardados
            </a>
          </li>
        </ul>
      </div>

      {/* Información útil */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-custom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-custom-text">Información</h3>
        </div>
        <ul className="space-y-3">
          <li>
            <a href="/terms" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Términos y condiciones
            </a>
          </li>
          <li>
            <a href="/contacto" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Contacto rápido
            </a>
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <footer className="bg-custom-card border-t border-custom-detail/10 shadow-custom">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Información de la empresa */}
        <div className="mb-12 pb-8 border-b border-custom-detail/10">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-custom-primary to-custom-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="text-2xl font-bold text-custom-text">ModLibrary</h3>
              <p className="text-custom-detail max-w-2xl leading-relaxed">
                Tu biblioteca digital de juegos. Organiza, gestiona y disfruta de tu colección de videojuegos en un solo lugar.
              </p>
              {isLoggedIn && user && (
                <div className="inline-flex items-center px-4 py-2 bg-custom-primary/10 border border-custom-primary/20 rounded-full">
                  <svg className="w-4 h-4 text-custom-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-custom-primary">
                    Bienvenido/a, {user.name || user.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido dinámico según autenticación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {isLoggedIn ? renderLoggedInLinks() : renderLoggedOutLinks()}
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-custom-detail/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-custom-detail">
            © {new Date().getFullYear()} ModLibrary. Todos los derechos reservados.
          </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 