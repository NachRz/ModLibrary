import { useState, useEffect } from 'react';
import modService from '../services/api/modService';
import authService from '../services/api/authService';

// Caché global para almacenar los IDs de mods guardados
// Esto evita tener que hacer llamadas innecesarias a la API
let savedModsCache = {
  mods: [],
  lastFetched: null,
  isFetching: false
};

// Tiempo de expiración de la caché en milisegundos (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Hook personalizado para manejar el estado de guardado de un mod
 * @param {number} modId - ID del mod
 * @returns {Array} - [isGuardado, toggleSavedStatus, isLoading, error]
 */
const useSavedStatus = (modId) => {
  const [isGuardado, setIsGuardado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAuthenticated = authService.isAuthenticated();

  // Actualizar todos los mods guardados en la caché
  const updateCache = async () => {
    // Si ya se está actualizando la caché, no hacemos nada
    if (savedModsCache.isFetching) return;
    
    try {
      savedModsCache.isFetching = true;
      const response = await modService.getSavedMods();
      if (response.status === 'success') {
        // Guardamos solo los IDs para mantener la caché liviana
        savedModsCache.mods = response.data.map(mod => mod.id);
        savedModsCache.lastFetched = Date.now();
      }
    } catch (err) {
      console.error('Error al actualizar la caché de mods guardados:', err);
    } finally {
      savedModsCache.isFetching = false;
    }
  };

  // Verificar si el mod está guardado
  const checkSavedStatus = async () => {
    if (!isAuthenticated || !modId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Si la caché está expirada o no existe, la actualizamos
      const isCacheExpired = !savedModsCache.lastFetched || 
                             (Date.now() - savedModsCache.lastFetched > CACHE_EXPIRATION);
      
      if (isCacheExpired) {
        await updateCache();
      }
      
      // Verificamos si el mod está en la caché
      setIsGuardado(savedModsCache.mods.includes(Number(modId)));
    } catch (err) {
      console.error('Error al verificar si el mod está guardado:', err);
      setError(err.message || 'Error al verificar el estado de guardado');
      
      // Si hay un error, hacemos una petición directa al backend
      try {
        const response = await modService.isModSaved(modId);
        if (response.status === 'success') {
          setIsGuardado(response.guardado);
        }
      } catch (directErr) {
        console.error('Error en la verificación directa:', directErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar el estado de guardado del mod
  const toggleSavedStatus = async () => {
    if (!isAuthenticated || !modId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isGuardado) {
        // Eliminar de guardados
        await modService.removeFromSaved(modId);
        setIsGuardado(false);
        
        // Actualizar la caché
        savedModsCache.mods = savedModsCache.mods.filter(id => id !== Number(modId));
      } else {
        // Guardar el mod
        await modService.saveMod(modId);
        setIsGuardado(true);
        
        // Actualizar la caché
        if (!savedModsCache.mods.includes(Number(modId))) {
          savedModsCache.mods.push(Number(modId));
        }
      }
    } catch (err) {
      console.error('Error al cambiar el estado de guardado:', err);
      setError(err.message || 'Error al cambiar el estado de guardado');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar el estado inicial
  useEffect(() => {
    if (isAuthenticated && modId) {
      checkSavedStatus();
    }
  }, [modId, isAuthenticated]);

  return [isGuardado, toggleSavedStatus, isLoading, error];
};

export default useSavedStatus; 