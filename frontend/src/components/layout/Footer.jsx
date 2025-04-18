import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-custom-card border-t border-custom-detail/10 shadow-custom">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-custom-text">ModLibrary</h3>
            <p className="text-sm text-custom-detail">
              Tu biblioteca digital de juegos. Organiza, gestiona y disfruta de tu colección de videojuegos en un solo lugar.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-custom-text">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-custom-detail hover:text-custom-primary transition-colors duration-300">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/login" className="text-sm text-custom-detail hover:text-custom-primary transition-colors duration-300">
                  Iniciar Sesión
                </a>
              </li>
              <li>
                <a href="/register" className="text-sm text-custom-detail hover:text-custom-primary transition-colors duration-300">
                  Registrarse
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-custom-text">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-custom-detail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-custom-detail">contacto@modlibrary.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-custom-detail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span className="text-sm text-custom-detail">@modlibrary</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-custom-detail/10">
          <p className="text-center text-sm text-custom-detail">
            © {new Date().getFullYear()} ModLibrary. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 