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
            <a href="/perfil" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-2 group-hover:animate-pulse"></span>
              Perfil
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
            <a href="/dashboard/juegos-favoritos" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Mis Juegos
            </a>
          </li>
          <li>
            <a href="/dashboard/mis-mods" className="text-sm text-custom-detail hover:text-custom-primary transition-all duration-300 hover:translate-x-1 flex items-center group">
              <span className="w-1.5 h-1.5 bg-custom-detail rounded-full mr-3 group-hover:bg-custom-primary transition-colors duration-300"></span>
              Mis Mods
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

        {/* Sección inferior estilo NexusMods */}
        <div className="mt-8 pt-6 border-t border-custom-detail/10">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Redes sociales */}
            <div className="flex items-center space-x-4">
              <a href="#" className="text-custom-detail hover:text-custom-primary transition-colors duration-300 p-2 hover:bg-custom-primary/10 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a href="#" className="text-custom-detail hover:text-custom-primary transition-colors duration-300 p-2 hover:bg-custom-primary/10 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-custom-detail hover:text-custom-primary transition-colors duration-300 p-2 hover:bg-custom-primary/10 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a href="#" className="text-custom-detail hover:text-custom-primary transition-colors duration-300 p-2 hover:bg-custom-primary/10 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6.857 4.714h1.715v5.143H6.857zm0 6.857h1.715v5.143H6.857zm4.714 0h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6.857 18.286h1.715v1.143H6.857zm4.714 0h1.715v1.143H11.57zm4.715 0H18v1.143h-1.714z"/>
                  <path d="M5.143 4.714h1.714v14.857H5.143zm14.857 0H21.43v14.857h-1.43zM6.857 3h1.715v1.714H6.857zm4.714 0h1.715v1.714H11.57zm4.715 0H18v1.714h-1.714z"/>
                </svg>
              </a>
              <a href="#" className="text-custom-detail hover:text-custom-primary transition-colors duration-300 p-2 hover:bg-custom-primary/10 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="text-custom-detail hover:text-custom-primary transition-colors duration-300 p-2 hover:bg-custom-primary/10 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Enlaces legales */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end space-x-6 text-sm">
              <a href="/terms" className="text-custom-detail hover:text-custom-primary transition-colors duration-300">
                Condiciones de servicio
              </a>
              <span className="text-custom-detail/50">|</span>
              <a href="/privacy" className="text-custom-detail hover:text-custom-primary transition-colors duration-300">
                política de privacidad
              </a>
            </div>
          </div>

          {/* Copyright adicional */}
          <div className="text-center mt-4 pt-4 border-t border-custom-detail/10">
            <p className="text-xs text-custom-detail/70">
              Copyright © {new Date().getFullYear()} ModLibrary. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 