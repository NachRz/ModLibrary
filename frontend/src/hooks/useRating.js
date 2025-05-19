import { useState, useEffect } from 'react';
import modService from '../services/api/modService';
import authService from '../services/api/authService';

// Caché global para almacenar las valoraciones de usuario
// Esto evita tener que hacer llamadas innecesarias a la API
let ratingsCache = {
  ratings: {}, // objeto con formato {modId: {puntuacion, fecha}}
  lastFetched: {}, // objeto con formato {modId: timestamp}
  isFetching: {} // objeto con formato {modId: boolean}
};

// Tiempo de expiración de la caché en milisegundos (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Hook personalizado para manejar las valoraciones de un mod
 * @param {number} modId - ID del mod
 * @returns {Array} - [userRating, hasRated, setUserRating, loading, error, ratingMessage]
 */
const useRating = (modId) => {
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratingMessage, setRatingMessage] = useState(null);
  const isAuthenticated = authService.isAuthenticated();

  // Función para mostrar un mensaje temporal
  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), 3000);
    } else {
      setRatingMessage(message);
      setTimeout(() => setRatingMessage(null), 3000);
    }
  };

  // Verificar si el usuario ya ha valorado el mod
  const checkUserRating = async () => {
    if (!isAuthenticated || !modId) return;
    
    setLoading(true);
    
    try {
      // Verificar si tenemos la valoración en caché y si no está expirada
      const cachedRating = ratingsCache.ratings[modId];
      const lastFetched = ratingsCache.lastFetched[modId];
      const isCacheExpired = !lastFetched || (Date.now() - lastFetched > CACHE_EXPIRATION);
      
      // Si la valoración está en caché y no está expirada, la usamos
      if (cachedRating && !isCacheExpired) {
        setUserRating(cachedRating.puntuacion || 0);
        setHasRated(!!cachedRating.puntuacion);
        setLoading(false);
        return;
      }
      
      // Si no está en caché o está expirada, hacemos la petición al servidor
      if (!ratingsCache.isFetching[modId]) {
        ratingsCache.isFetching[modId] = true;
        
        const response = await modService.getUserRating(modId);
        
        if (response.status === 'success') {
          if (response.hasRated) {
            // Guardamos en la caché
            ratingsCache.ratings[modId] = {
              puntuacion: response.data.puntuacion,
              fecha: response.data.fecha
            };
            
            setUserRating(response.data.puntuacion);
            setHasRated(true);
          } else {
            // Si no ha valorado, guardamos un valor nulo en la caché
            ratingsCache.ratings[modId] = { puntuacion: 0, fecha: null };
            
            setUserRating(0);
            setHasRated(false);
          }
          
          // Actualizamos el timestamp de la caché
          ratingsCache.lastFetched[modId] = Date.now();
        }
        
        ratingsCache.isFetching[modId] = false;
      }
    } catch (err) {
      console.error('Error al verificar la valoración del usuario:', err);
    } finally {
      setLoading(false);
    }
  };

  // Valorar un mod
  const rateMod = async (rating) => {
    if (!isAuthenticated || !modId) {
      showMessage('Debes iniciar sesión para valorar este mod', true);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await modService.rateMod(modId, rating);
      
      if (response.status === 'success') {
        // Actualizamos el estado local
        setUserRating(rating);
        setHasRated(true);
        
        // Actualizamos la caché
        ratingsCache.ratings[modId] = {
          puntuacion: rating,
          fecha: new Date().toISOString()
        };
        ratingsCache.lastFetched[modId] = Date.now();
        
        // Mostrar mensaje de confirmación
        showMessage('¡Gracias por tu valoración!');
        
        return true;
      }
    } catch (err) {
      console.error('Error al valorar el mod:', err);
      showMessage(err?.message || 'Error al valorar el mod', true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar valoración
  const deleteRating = async () => {
    if (!isAuthenticated || !modId || !hasRated) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await modService.deleteRating(modId);
      
      if (response.status === 'success') {
        // Actualizamos el estado local
        setUserRating(0);
        setHasRated(false);
        
        // Actualizamos la caché
        ratingsCache.ratings[modId] = { puntuacion: 0, fecha: null };
        ratingsCache.lastFetched[modId] = Date.now();
        
        // Mostrar mensaje de confirmación
        showMessage('Valoración eliminada correctamente');
        
        return true;
      }
    } catch (err) {
      console.error('Error al eliminar la valoración:', err);
      showMessage(err?.message || 'Error al eliminar tu valoración', true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar el estado inicial
  useEffect(() => {
    if (isAuthenticated && modId) {
      checkUserRating();
    }
  }, [modId, isAuthenticated]);

  return [
    userRating, 
    hasRated, 
    rateMod, 
    deleteRating, 
    loading, 
    error, 
    ratingMessage
  ];
};

export default useRating; 