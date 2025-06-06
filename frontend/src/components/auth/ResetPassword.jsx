import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GradientButton from '../common/buttons/GradientButton';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Simulación de envío de correo de recuperación
      if (email) {
        setSuccess('Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('Por favor, ingresa tu correo electrónico');
      }
    } catch (err) {
      setError('Error al enviar el correo de recuperación. Inténtalo de nuevo más tarde.');
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
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-custom-detail">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
          </p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <GradientButton
              type="submit"
              disabled={loading}
              icon={
                <svg className="h-5 w-5 text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </GradientButton>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-custom-detail hover:text-custom-primary transition-colors duration-300">
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 