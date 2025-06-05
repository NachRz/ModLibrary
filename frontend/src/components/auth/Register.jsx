import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GradientButton from '../common/buttons/GradientButton';
import authService from '../../services/api/authService';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validaciones básicas
    if (!userData.username || !userData.email || !userData.password || !userData.confirmPassword) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }
    
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    
    if (userData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    
    try {
      // Llamada real a la API para registrar al usuario
      await authService.register(userData);
      
      setSuccess('Cuenta creada correctamente. Redirigiendo al perfil...');
      
      // Redirección a perfil después de 2 segundos
      setTimeout(() => {
        navigate('/perfil');
      }, 2000);
    } catch (error) {
      console.error('Error al registrar:', error);
      setError(error.message || 'Ha ocurrido un error durante el registro. Por favor, inténtalo de nuevo.');
      if (error.errors && error.errors.correo) {
        setError(`El correo electrónico ya está en uso.`);
      }
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
            Crea tu cuenta
          </h2>
          <div className="pb-6 text-center">
            <p className="text-sm text-custom-detail">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="font-semibold text-base text-custom-secondary hover:text-custom-primary border-b border-custom-secondary hover:border-custom-primary transition-all duration-300 hover:scale-102 inline-block">
                Inicia sesión
              </Link>
            </p>
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

        {success && (
          <div className="text-green-600 text-sm text-center p-3 bg-green-50 rounded-lg border border-green-200 animate-pulse">
            <svg className="h-5 w-5 inline-block mr-1 mb-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Nombre de usuario */}
            <div className="group">
              <label htmlFor="username" className="block text-sm font-medium text-custom-detail mb-2 transition-all duration-300 group-focus-within:text-custom-primary">
                Nombre de usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-custom-detail group-focus-within:text-custom-primary transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-custom-detail/20 placeholder-custom-detail/50 text-custom-text rounded-lg bg-custom-card/60 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-transparent shadow-sm transition-all duration-300"
                  placeholder="Tu nombre de usuario"
                  value={userData.username}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Correo electrónico */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-custom-detail mb-2 transition-all duration-300 group-focus-within:text-custom-primary">
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
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-custom-detail/20 placeholder-custom-detail/50 text-custom-text rounded-lg bg-custom-card/60 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-transparent shadow-sm transition-all duration-300"
                  placeholder="usuario@ejemplo.com"
                  value={userData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Contraseña */}
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
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-custom-detail/20 placeholder-custom-detail/50 text-custom-text rounded-lg bg-custom-card/60 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-transparent shadow-sm transition-all duration-300"
                  placeholder="••••••••"
                  value={userData.password}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1 text-xs text-custom-detail">
                Usa al menos 6 caracteres con una mezcla de letras, números y símbolos
              </p>
            </div>
            
            {/* Confirmar contraseña */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-custom-detail mb-2 transition-all duration-300 group-focus-within:text-custom-primary">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-custom-detail group-focus-within:text-custom-primary transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-custom-detail/20 placeholder-custom-detail/50 text-custom-text rounded-lg bg-custom-card/60 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-transparent shadow-sm transition-all duration-300"
                  placeholder="••••••••"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-custom-primary focus:ring-custom-primary border-custom-detail/20 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-custom-detail">
              Acepto los <Link to="#" className="text-custom-secondary font-semibold hover:text-custom-primary border-b border-custom-secondary hover:border-custom-primary transition-colors duration-300">Términos y Condiciones</Link> y la <Link to="#" className="text-custom-secondary font-semibold hover:text-custom-primary border-b border-custom-secondary hover:border-custom-primary transition-colors duration-300">Política de Privacidad</Link>
            </label>
          </div>

          <div>
            <GradientButton
              type="submit"
              icon={
                <svg className="h-5 w-5 text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            >
              Crear cuenta
            </GradientButton>
          </div>
        </form>
        
        <div className="mt-6 text-center text-xs text-custom-detail">
          <p>Al registrarte, aceptas recibir correos electrónicos sobre actualizaciones y novedades de ModLibrary.</p>
        </div>
      </div>
    </div>
  );
};

export default Register; 