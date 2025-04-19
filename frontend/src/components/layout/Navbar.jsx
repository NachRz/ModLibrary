import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../assets/styles/components/layout/navbar.css'; // Ruta actualizada al CSS
import { authService } from '../../services/api'; // Importar el servicio de autenticación

// Componente NavLink reutilizable
const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`inline-flex items-center h-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-custom-text bg-custom-primary/15 border-b-2 border-custom-secondary'
        : 'text-custom-detail hover:text-custom-text hover:bg-custom-primary/5'
    }`}
  >
    {children}
  </Link>
);

// Componente NavLink con submenú desplegable
const NavLinkWithDropdown = ({ title, isActive, children }) => {
  return (
    <div className="relative h-full flex items-center group">
      <Link
        to="/dashboard"
        className={`inline-flex items-center h-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'text-custom-text bg-custom-primary/15 border-b-2 border-custom-secondary'
            : 'text-custom-detail hover:text-custom-text hover:bg-custom-primary/5'
        }`}
      >
        {title}
        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>
      <div className="absolute left-0 top-full mt-0 w-48 bg-custom-card rounded-b-lg shadow-custom-lg border border-custom-detail/10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform origin-top-left scale-95 group-hover:scale-100">
        <div className="py-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ nome: '', correo: '', rol: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPanelMenuOpen, setIsPanelMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const location = useLocation();

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        setIsLoggedIn(true);
        const user = authService.getCurrentUser();
        if (user) {
          setUserData({
            nome: user.nome || 'Usuario',
            correo: user.correo || '',
            rol: user.rol || 'usuario'
          });
        }
      } else {
        setIsLoggedIn(false);
        setUserData({ nome: '', correo: '', rol: '' });
      }
    };
    
    checkAuth();
    // Escuchar cambios en localStorage para actualizar el estado
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Función para verificar ruta activa 
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  // Definir enlaces de navegación
  const navLinks = [
    { name: 'Explorar', path: '/explorar' },
    { name: 'Tendencias', path: '/tendencias' },
    { name: 'Categorías', path: '/categorias' },
  ];

  // Opciones del panel
  const panelOptions = [
    { name: 'General', path: '/dashboard' },
    { name: 'Mis Mods', path: '/dashboard/mis-mods' },
    { name: 'Juegos Favoritos', path: '/dashboard/juegos-favoritos' },
    { name: 'Mods Guardados', path: '/dashboard/guardados' },
  ];

  // Función para cerrar sesión
  const handleLogout = () => {
    authService.logout().then(() => {
      window.location.href = '/';
    }).catch(error => {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    });
  };

  // Toggles para menú móvil
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const togglePanelMenu = () => setIsPanelMenuOpen(!isPanelMenuOpen);

  // Función para manejar el envío del formulario de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchInputRef.current.value.trim();
    if (query) {
      console.log('Searching for:', query);
      // Aquí puedes añadir la lógica de búsqueda o redirección
    }
  };

  // Manejadores para los eventos del campo de búsqueda
  const handleSearchMouseEnter = () => {
    setIsSearchOpen(true);
  };

  const handleSearchMouseLeave = () => {
    // Solo cerrar si no está enfocado
    if (!isSearchFocused) {
      setIsSearchOpen(false);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // Cerrar si el ratón no está sobre el campo
    if (!isSearchOpen) {
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="bg-custom-card border-b border-custom-detail/10 shadow-custom sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y enlaces principales */}
          <div className="flex h-full">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-custom-text flex items-center">
                <span className="text-custom-secondary">Mod</span>Library
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-2 md:h-full">
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} isActive={isActive(link.path)}>
                  {link.name}
                </NavLink>
              ))}
              
              {/* Mi Panel con desplegable - versión desktop */}
              {isLoggedIn && (
                <NavLinkWithDropdown
                  title="Mi Panel"
                  isActive={location.pathname.startsWith('/dashboard')}
                >
                  {panelOptions.map(option => (
                    <Link 
                      key={option.path}
                      to={option.path}
                      className="block px-4 py-2 text-sm text-custom-text hover:bg-custom-primary/10 transition-colors"
                    >
                      {option.name}
                    </Link>
                  ))}
                </NavLinkWithDropdown>
              )}
            </div>
          </div>

          {/* Lado derecho de la navbar */}
          <div className="flex items-center">
            {/* Barra de búsqueda desplegable */}
            <div 
              className="search-container relative mr-2"
              onMouseEnter={handleSearchMouseEnter}
              onMouseLeave={handleSearchMouseLeave}
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className={`search-wrapper ${isSearchOpen || isSearchFocused ? 'search-wrapper-open' : ''}`}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar..."
                    className="search-input bg-custom-card text-custom-text placeholder-custom-detail/50 focus:outline-none"
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                  />
                  <button 
                    type="submit"
                    className="search-button text-custom-detail hover:text-custom-text transition-colors" 
                    aria-label="Buscar"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Icono de favoritos */}
            <button 
              className="text-custom-detail p-2 rounded-md hover:text-custom-secondary hover:bg-custom-primary/5 transition-colors mr-2 hidden md:block" 
              aria-label="Favoritos"
            >
              <div className="relative">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-custom-secondary text-custom-text text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </div>
            </button>

            {/* Icono de notificaciones */}
            <button 
              className="text-custom-detail p-2 rounded-md hover:text-custom-primary hover:bg-custom-primary/5 transition-colors mr-2 hidden md:block" 
              aria-label="Notificaciones"
            >
              <div className="relative">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-custom-primary text-custom-text text-xs rounded-full h-4 w-4 flex items-center justify-center">5</span>
              </div>
            </button>

            {/* Icono de mensajes */}
            <button 
              className="text-custom-detail p-2 rounded-md hover:text-custom-primary-hover hover:bg-custom-primary/5 transition-colors mr-2 hidden md:block" 
              aria-label="Mensajes"
            >
              <div className="relative">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-custom-primary-hover text-custom-text text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
              </div>
            </button>

            {/* Perfil o botón de login */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 relative group">
                <div className="text-right hidden md:block">
                  <p className="text-custom-text font-medium">{userData.nome}</p>
                  <p className="text-custom-detail text-xs capitalize">{userData.rol}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-custom-primary flex items-center justify-center text-custom-text shadow-sm cursor-pointer group-hover:ring-2 group-hover:ring-custom-secondary/50 transition-all">
                  {userData.nome.charAt(0)}
                </div>
                
                {/* Menú desplegable */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-custom-card rounded-custom shadow-custom-lg border border-custom-detail/10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-custom-detail/10">
                      <p className="text-sm font-medium text-custom-text">{userData.nome}</p>
                      <p className="text-xs text-custom-detail truncate">{userData.correo}</p>
                    </div>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-custom-text hover:bg-custom-primary/10 transition-colors flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      Panel
                    </Link>
                    <Link to="/perfil" className="block px-4 py-2 text-sm text-custom-text hover:bg-custom-primary/10 transition-colors flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Perfil
                    </Link>
                    <Link to="/ajustes" className="block px-4 py-2 text-sm text-custom-text hover:bg-custom-primary/10 transition-colors flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ajustes
                    </Link>
                    <div className="border-t border-custom-detail/10 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-custom-error hover:bg-custom-error/10 transition-colors flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2 text-custom-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Desconectar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-custom-text bg-custom-primary hover:bg-custom-primary-hover transition-colors">
                Iniciar Sesión
              </Link>
            )}

            {/* Botón de menú móvil */}
            <div className="md:hidden ml-4">
              <button
                onClick={toggleMobileMenu}
                className="text-custom-detail p-2 rounded-md hover:text-custom-text hover:bg-custom-primary/5 transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label="Abrir menú"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'text-custom-text bg-custom-primary/15 border-l-4 border-custom-secondary'
                  : 'text-custom-detail hover:text-custom-text hover:bg-custom-primary/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mi Panel con desplegable - versión móvil */}
          {isLoggedIn && (
            <>
              <button
                className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname.startsWith('/dashboard')
                    ? 'text-custom-text bg-custom-primary/15 border-l-4 border-custom-secondary'
                    : 'text-custom-detail hover:text-custom-text hover:bg-custom-primary/5'
                }`}
                onClick={() => {
                  togglePanelMenu();
                  // Redireccionar al dashboard si no estamos ya allí
                  if (!location.pathname.startsWith('/dashboard')) {
                    window.location.href = '/dashboard';
                  }
                }}
                aria-expanded={isPanelMenuOpen}
              >
                <span>Mi Panel</span>
                <svg 
                  className={`h-5 w-5 transition-transform duration-200 ${isPanelMenuOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`transition-all duration-200 overflow-hidden pl-4 ${isPanelMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                {panelOptions.map(option => (
                  <Link
                    key={option.path}
                    to={option.path}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(option.path)
                        ? 'text-custom-text bg-custom-primary/10'
                        : 'text-custom-detail hover:text-custom-text hover:bg-custom-primary/5'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {option.name}
                  </Link>
                ))}
              </div>
            </>
          )}
          
          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-custom-error hover:bg-custom-error/10 transition-colors"
            >
              Desconectar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 