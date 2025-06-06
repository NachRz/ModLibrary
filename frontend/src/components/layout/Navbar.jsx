import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/api/authService'; // Importar el servicio de autenticación
import SearchModal from '../common/Modals/SearchModal'; // Importar el modal de búsqueda
import '../../assets/styles/components/layout/navbar.css'; // Ruta actualizada al CSS

// Componente NavLink reutilizable
const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`inline-flex items-center h-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive
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
        to="/dashboard/mis-mods"
        className={`inline-flex items-center h-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive
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
  const [userData, setUserData] = useState({ nome: '', correo: '', rol: '', foto_perfil: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPanelMenuOpen, setIsPanelMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
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
            rol: user.rol || 'usuario',
            foto_perfil: user.foto_perfil || ''
          });
        }
      } else {
        setIsLoggedIn(false);
        setUserData({ nome: '', correo: '', rol: '', foto_perfil: '' });
      }
    };

    checkAuth();

    // Escuchar cambios en localStorage para actualizar el estado
    window.addEventListener('storage', checkAuth);

    // Escuchar evento personalizado de actualización de usuario
    const handleUserUpdate = (event) => {
      const updatedUser = event.detail;
      if (updatedUser) {
        setUserData({
          nome: updatedUser.nome || 'Usuario',
          correo: updatedUser.correo || '',
          rol: updatedUser.rol || 'usuario',
          foto_perfil: updatedUser.foto_perfil || ''
        });
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  // Actualizar URL de imagen de perfil con cache-busting
  useEffect(() => {
    if (userData.foto_perfil) {
      // Usar timestamp del usuario si está disponible, sino generar uno nuevo
      const user = authService.getCurrentUser();
      const timestamp = user?.imageTimestamp || Date.now();
      setProfileImageUrl(`http://localhost:8000/storage/${userData.foto_perfil}?t=${timestamp}`);
    } else {
      setProfileImageUrl('');
    }
  }, [userData.foto_perfil]);

  // Función para verificar ruta activa 
  const isActive = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }, [location.pathname]);

  // Definir enlaces de navegación
  const navLinks = [
    { name: 'Mods', path: '/mods' },
    { name: 'Juegos', path: '/juegos' },
  ];

  // Detectar si estamos en modo admin
  const isAdminMode = location.pathname.startsWith('/admin');

  // Opciones del panel según el modo
  const panelOptions = isAdminMode ? [
    { name: 'Gestión Usuarios', path: '/admin/usuarios' },
    { name: 'Gestión Mods', path: '/admin/mods' },
    { name: 'Gestión Comentarios', path: '/admin/comentarios' },
  ] : [
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

  // Función para abrir el modal de búsqueda
  const handleOpenSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  // Función para cerrar el modal de búsqueda
  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  // Determinar si estamos en páginas que necesitan ancho extendido
  const isWideLayout = location.pathname.startsWith('/mods') ||
    location.pathname.startsWith('/juegos') ||
    location.pathname.startsWith('/search') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/';

  return (
    <nav className="bg-custom-card border-b border-custom-detail/10 shadow-custom sticky top-0 z-50">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isWideLayout ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
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
                  title={isAdminMode ? "Panel Admin" : "Mi Panel"}
                  isActive={location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')}
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
            {/* Botón de búsqueda */}
            <button
              onClick={handleOpenSearchModal}
              className="search-button-enhanced text-custom-detail hover:text-custom-text transition-all duration-300 mr-4"
              aria-label="Buscar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Perfil o botón de login */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 relative group">
                <div className="text-right hidden md:block">
                  <p className="text-custom-text font-medium">{userData.nome}</p>
                  <p className="text-custom-detail text-xs capitalize">{userData.rol}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-custom-primary flex items-center justify-center text-custom-text shadow-sm cursor-pointer group-hover:ring-2 group-hover:ring-custom-secondary/50 transition-all overflow-hidden">
                  {userData.foto_perfil && profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={`Foto de perfil de ${userData.nome}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {userData.nome.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Menú desplegable */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-custom-card rounded-custom shadow-custom-lg border border-custom-detail/10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-custom-detail/10">
                      <p className="text-sm font-medium text-custom-text">{userData.nome}</p>
                      <p className="text-xs text-custom-detail truncate">{userData.correo}</p>
                    </div>
                    <Link to="/perfil" className="block px-4 py-2 text-sm text-custom-text hover:bg-custom-primary/10 transition-colors flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi Perfil
                    </Link>
                    <Link to="/mods/crear" className="block px-4 py-2 text-sm text-custom-text hover:bg-custom-primary/10 transition-colors flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Crear Mods
                    </Link>
                    {/* Opción para cambiar modo (solo para admins) */}
                    {userData.rol === 'admin' && (
                      <Link
                        to={isAdminMode ? "/dashboard/mis-mods" : "/admin"}
                        className="block px-4 py-2 text-sm text-custom-text hover:bg-custom-primary/10 transition-colors flex items-center"
                      >
                        <svg className="h-4 w-4 mr-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                        {isAdminMode ? 'Ir a Mi Panel' : 'Panel Admin'}
                      </Link>
                    )}
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
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gradient-to-b from-custom-card to-custom-card/95 backdrop-blur-sm border-t border-custom-detail/10">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {/* Sección de perfil en móvil - solo si está logueado */}
            {isLoggedIn && (
              <div className="bg-custom-primary/5 rounded-xl p-4 mb-4 border border-custom-detail/10">
                <div className="flex items-center mb-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-custom-primary to-custom-secondary flex items-center justify-center text-custom-text shadow-lg overflow-hidden ring-2 ring-custom-primary/20">
                      {userData.foto_perfil && profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt={`Foto de perfil de ${userData.nome}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-base">
                          {userData.nome.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-custom-card"></div>
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="text-base font-semibold text-custom-text leading-tight">{userData.nome}</p>
                    <p className="text-xs text-custom-detail truncate mt-0.5">{userData.correo}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-custom-secondary/20 text-custom-secondary capitalize mt-1">
                      {userData.rol}
                    </span>
                  </div>
                </div>

                {/* Opciones del perfil en móvil */}
                <div className={`grid gap-2 ${userData.rol === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <Link
                    to="/perfil"
                    className="flex flex-col items-center justify-center p-3 bg-custom-card rounded-lg hover:bg-custom-primary/10 transition-all duration-200 group border border-custom-detail/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5 mb-1 text-custom-primary group-hover:text-custom-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs font-medium text-custom-text">Mi Perfil</span>
                  </Link>
                  <Link
                    to="/mods/crear"
                    className="flex flex-col items-center justify-center p-3 bg-custom-card rounded-lg hover:bg-custom-primary/10 transition-all duration-200 group border border-custom-detail/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5 mb-1 text-custom-primary group-hover:text-custom-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs font-medium text-custom-text">Crear Mods</span>
                  </Link>
                  {/* Botón para cambiar modo (solo para admins) */}
                  {userData.rol === 'admin' && (
                    <Link
                      to={isAdminMode ? "/dashboard/mis-mods" : "/admin"}
                      className="flex flex-col items-center justify-center p-3 bg-custom-card rounded-lg hover:bg-custom-primary/10 transition-all duration-200 group border border-custom-detail/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="h-5 w-5 mb-1 text-orange-400 group-hover:text-orange-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                      <span className="text-xs font-medium text-custom-text">{isAdminMode ? 'Usuario' : 'Admin'}</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Enlaces de navegación principales */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-custom-detail uppercase tracking-wider px-3 py-2">
                Navegación
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive(link.path)
                      ? 'text-custom-text bg-gradient-to-r from-custom-primary/20 to-custom-secondary/10 border-l-4 border-custom-secondary shadow-sm'
                      : 'text-custom-detail hover:text-custom-text hover:bg-custom-primary/8 hover:translate-x-1'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex-1">{link.name}</span>
                  <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Mi Panel con desplegable - versión móvil */}
            {isLoggedIn && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-custom-detail uppercase tracking-wider px-3 py-2 mt-4">
                  {isAdminMode ? 'Administración' : 'Panel Personal'}
                </div>
                <button
                  className={`flex justify-between items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${location.pathname === '/perfil' || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')
                      ? 'text-custom-text bg-gradient-to-r from-custom-primary/20 to-custom-secondary/10 border-l-4 border-custom-secondary shadow-sm'
                      : 'text-custom-detail hover:text-custom-text hover:bg-custom-primary/8'
                    }`}
                  onClick={() => {
                    togglePanelMenu();
                    // Redireccionar según el modo
                    if (isAdminMode) {
                      if (!location.pathname.startsWith('/admin')) {
                        window.location.href = '/admin';
                      }
                    } else {
                      if (location.pathname !== '/perfil' && !location.pathname.startsWith('/dashboard')) {
                        window.location.href = '/dashboard/mis-mods';
                      }
                    }
                  }}
                  aria-expanded={isPanelMenuOpen}
                >
                  <span>{isAdminMode ? 'Panel Admin' : 'Mi Panel'}</span>
                  <svg
                    className={`h-5 w-5 transition-all duration-300 ${isPanelMenuOpen ? 'transform rotate-180 text-custom-secondary' : 'text-custom-detail'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isPanelMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-6 space-y-1">
                    {panelOptions.map(option => (
                      <Link
                        key={option.path}
                        to={option.path}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(option.path)
                            ? 'text-custom-secondary bg-custom-secondary/10 font-semibold'
                            : 'text-custom-detail hover:text-custom-text hover:bg-custom-primary/5 hover:translate-x-1'
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-current mr-3 opacity-60"></div>
                        {option.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Botón de desconectar separado al final */}
            {isLoggedIn && (
              <div className="border-t border-custom-detail/10 pt-4 mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-base font-medium text-custom-error bg-custom-error/5 hover:bg-custom-error/10 transition-all duration-200 border border-custom-error/20 hover:border-custom-error/30"
                >
                  <svg className="h-5 w-5 mr-3 text-custom-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Desconectar
                </button>
              </div>
            )}

            {/* Si no está logueado, mostrar botón de login */}
            {!isLoggedIn && (
              <div className="border-t border-custom-detail/10 pt-4 mt-6">
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-custom-primary to-custom-secondary hover:from-custom-primary-hover hover:to-custom-secondary/90 transition-all duration-200 text-center shadow-lg transform hover:scale-[1.02]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de búsqueda */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
      />
    </nav>
  );
};

export default Navbar;