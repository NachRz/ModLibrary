import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GradientButton from '../common/buttons/GradientButton';
import authService from '../../services/api/authService';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!credentials.email || !credentials.password) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }
    
    try {
      // Llamada real a la API para autenticar al usuario
      await authService.login(credentials);
      
      // Redirección al dashboard si el inicio de sesión es exitoso
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError(error.message || 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-custom-bg to-custom-bg/90 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-custom-card/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl hover:shadow-xl transition-all duration-500 hover:scale-105 duration-300">
        <div className="text-center">
          <Link to="/" className="inline-block text-3xl font-bold text-custom-text flex items-center justify-center mb-2 hover:scale-105 duration-300" style={{ willChange: 'transform', WebkitFontSmoothing: 'antialiased' }}>
            <svg className="w-10 h-10 mr-2 text-custom-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-custom-secondary">Mod</span>Library
          </Link>
          <h2 className="mt-2 text-2xl font-extrabold text-custom-text bg-clip-text bg-gradient-to-r from-custom-primary to-custom-secondary">
            Bienvenido de nuevo
          </h2>
          <div className="pb-6 text-center">
            <p className="text-sm text-custom-detail">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="font-semibold text-base text-custom-secondary hover:text-custom-primary border-b border-custom-secondary hover:border-custom-primary transition-all duration-300 hover:scale-102 inline-block">
                Regístrate ahora
              </Link>
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="group">
              <label htmlFor="email-address" className="block text-sm font-medium text-custom-detail mb-2 transition-all duration-300 group-focus-within:text-custom-primary">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-custom-detail group-focus-within:text-custom-primary transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-custom-detail/20 placeholder-custom-detail/50 text-custom-text rounded-lg bg-custom-card/60 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-transparent shadow-sm transition-all duration-300"
                  placeholder="usuario@ejemplo.com"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-custom-detail mb-2 transition-all duration-300 group-focus-within:text-custom-primary">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-custom-detail group-focus-within:text-custom-primary transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-custom-detail/20 placeholder-custom-detail/50 text-custom-text rounded-lg bg-custom-card/60 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-transparent shadow-sm transition-all duration-300"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-custom-error text-sm text-center p-3 bg-custom-error/10 rounded-lg border border-custom-error/20 animate-pulse">
              <svg className="h-5 w-5 inline-block mr-1 mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-custom-primary focus:ring-custom-primary border-custom-detail/20 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-custom-detail">
                Recuérdame
              </label>
            </div>

            <div className="text-sm">
              <Link to="/reset-password" className="font-semibold text-custom-secondary hover:text-custom-primary border-b border-custom-secondary hover:border-custom-primary transition-all duration-300">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <GradientButton
              type="submit"
              icon={
                <svg className="h-5 w-5 text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              }
            >
              Iniciar Sesión
            </GradientButton>
          </div>
        </form>
        
        <div className="mt-6 text-center text-xs text-custom-detail">
          <p>Al iniciar sesión, aceptas nuestros <Link to="#" className="underline hover:text-custom-primary transition-colors duration-300">Términos de Servicio</Link> y <Link to="#" className="underline hover:text-custom-primary transition-colors duration-300">Política de Privacidad</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 