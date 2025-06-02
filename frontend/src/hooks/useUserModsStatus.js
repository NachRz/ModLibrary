import { useState, useEffect, useMemo, useCallback } from 'react';
import modService from '../services/api/modService';
import authService from '../services/api/authService';

// Caché global unificada para el usuario y sus mods
let userModsCache = {
  // Información del usuario
  userId: null,
  isAuthenticated: false,
  lastUserCheck: null,
  
  // Mods guardados
  savedMods: [],
  lastSavedFetch: null,
  isFetchingSaved: false,
  
  // Tiempos de expiración
  userCacheExpiration: 2 * 60 * 1000, // 2 minutos para datos de usuario
  savedCacheExpiration: 5 * 60 * 1000, // 5 minutos para mods guardados
};

/**
 * Hook unificado para manejar estados relacionados con el usuario y sus mods
 * Combina funcionalidad de guardado y propiedad de mods con optimización de caché
 * @param {number|Array} modIds - ID del mod o array de mods (opcional)
 * @returns {Object} - Objeto con métodos para verificar guardado y propiedad
 */
const useUserModsStatus = (modIds = null) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedModIds, setSavedModIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Actualizar la caché del usuario
  const updateUserCache = useCallback(() => {
    const authenticated = authService.isAuthenticated();
    const user = authenticated ? authService.getCurrentUser() : null;
    
    userModsCache.userId = user?.id || null;
    userModsCache.isAuthenticated = authenticated;
    userModsCache.lastUserCheck = Date.now();
    
    setCurrentUserId(user?.id || null);
    setIsAuthenticated(authenticated);
  }, []);

  // Actualizar la caché de mods guardados
  const updateSavedModsCache = useCallback(async () => {
    if (!userModsCache.isAuthenticated || userModsCache.isFetchingSaved) return;
    
    try {
      userModsCache.isFetchingSaved = true;
      const response = await modService.getSavedMods();
      
      if (response.status === 'success') {
        // Guardamos solo los IDs para mantener la caché liviana
        userModsCache.savedMods = response.data.map(mod => mod.id);
        userModsCache.lastSavedFetch = Date.now();
        setSavedModIds(userModsCache.savedMods);
      }
    } catch (err) {
      console.error('Error al actualizar la caché de mods guardados:', err);
      setError(err.message || 'Error al cargar mods guardados');
    } finally {
      userModsCache.isFetchingSaved = false;
    }
  }, []);

  // Verificar y actualizar cachés si es necesario
  const checkAndUpdateCaches = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar caché de usuario
      const isUserCacheExpired = !userModsCache.lastUserCheck || 
                                 (Date.now() - userModsCache.lastUserCheck > userModsCache.userCacheExpiration);
      
      if (isUserCacheExpired) {
        updateUserCache();
      } else {
        setCurrentUserId(userModsCache.userId);
        setIsAuthenticated(userModsCache.isAuthenticated);
      }
      
      // Verificar caché de mods guardados si el usuario está autenticado
      if (userModsCache.isAuthenticated) {
        const isSavedCacheExpired = !userModsCache.lastSavedFetch || 
                                    (Date.now() - userModsCache.lastSavedFetch > userModsCache.savedCacheExpiration);
        
        if (isSavedCacheExpired) {
          await updateSavedModsCache();
        } else {
          setSavedModIds(userModsCache.savedMods);
        }
      } else {
        setSavedModIds([]);
      }
    } catch (err) {
      setError(err.message || 'Error al inicializar datos del usuario');
    } finally {
      setLoading(false);
    }
  }, [updateUserCache, updateSavedModsCache]);

  // Inicializar el hook
  useEffect(() => {
    checkAndUpdateCaches();
  }, [checkAndUpdateCaches]);

  // Función para verificar si un mod es propio del usuario
  const isOwner = useCallback((mod) => {
    if (!isAuthenticated || !currentUserId || !mod) return false;
    
    // Soportar tanto mod.creador_id como mod.creador?.id
    const creatorId = mod.creador_id || mod.creador?.id;
    return creatorId === currentUserId;
  }, [isAuthenticated, currentUserId]);

  // Función para verificar si un mod está guardado
  const isSaved = useCallback((modId) => {
    if (!isAuthenticated || !modId) return false;
    return savedModIds.includes(Number(modId));
  }, [isAuthenticated, savedModIds]);

  // Función para alternar el estado de guardado de un mod
  const toggleSavedStatus = useCallback(async (modId) => {
    if (!isAuthenticated || !modId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const isCurrentlySaved = isSaved(modId);
      
      if (isCurrentlySaved) {
        // Eliminar de guardados
        await modService.removeFromSaved(modId);
        
        // Actualizar caché local
        userModsCache.savedMods = userModsCache.savedMods.filter(id => id !== Number(modId));
        setSavedModIds(userModsCache.savedMods);
      } else {
        // Guardar el mod
        await modService.saveMod(modId);
        
        // Actualizar caché local
        if (!userModsCache.savedMods.includes(Number(modId))) {
          userModsCache.savedMods.push(Number(modId));
          setSavedModIds(userModsCache.savedMods);
        }
      }
      
      return !isCurrentlySaved; // Retorna el nuevo estado
    } catch (err) {
      console.error('Error al cambiar el estado de guardado:', err);
      setError(err.message || 'Error al cambiar el estado de guardado');
      return isSaved(modId); // Retorna el estado actual si hay error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isSaved]);

  // Función para obtener un mapa de propiedad para múltiples mods
  const getOwnershipMap = useMemo(() => {
    return (mods) => {
      if (!isAuthenticated || !currentUserId || !Array.isArray(mods)) {
        return {};
      }
      
      const ownershipMap = {};
      mods.forEach(mod => {
        if (mod && mod.id) {
          const creatorId = mod.creador_id || mod.creador?.id;
          ownershipMap[mod.id] = creatorId === currentUserId;
        }
      });
      
      return ownershipMap;
    };
  }, [isAuthenticated, currentUserId]);

  // Función para obtener un mapa de guardado para múltiples mods
  const getSavedMap = useMemo(() => {
    return (modIds) => {
      if (!isAuthenticated || !Array.isArray(modIds)) {
        return {};
      }
      
      const savedMap = {};
      modIds.forEach(modId => {
        savedMap[modId] = savedModIds.includes(Number(modId));
      });
      
      return savedMap;
    };
  }, [isAuthenticated, savedModIds]);

  // Función para filtrar solo los mods propios
  const getOwnMods = useMemo(() => {
    return (mods) => {
      if (!isAuthenticated || !currentUserId || !Array.isArray(mods)) {
        return [];
      }
      
      return mods.filter(mod => {
        if (!mod) return false;
        const creatorId = mod.creador_id || mod.creador?.id;
        return creatorId === currentUserId;
      });
    };
  }, [isAuthenticated, currentUserId]);

  // Función para refrescar manualmente todas las cachés
  const refresh = useCallback(async () => {
    updateUserCache();
    if (userModsCache.isAuthenticated) {
      await updateSavedModsCache();
    }
  }, [updateUserCache, updateSavedModsCache]);

  return {
    // Estados básicos
    currentUserId,
    isAuthenticated,
    loading,
    error,
    savedModIds,
    
    // Funciones de verificación individual
    isOwner,
    isSaved,
    
    // Funciones para múltiples mods
    getOwnershipMap,
    getSavedMap,
    getOwnMods,
    
    // Funciones de acción
    toggleSavedStatus,
    refresh,
    
    // Datos de utilidad
    ownModsCount: (mods) => getOwnMods(mods).length,
    savedModsCount: savedModIds.length
  };
};

export default useUserModsStatus; 