import apiClient from './apiClient';

// Caché para almacenar resultados de búsqueda
let searchCache = {
    queries: {},
    tags: {},
    lastFetched: null
};

// Tiempo de expiración de la caché (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000;

const etiquetasService = {
    // Buscar etiquetas en RAWG
    searchTags: async (query = '', page = 1, pageSize = 20) => {
        try {
            // Verificar caché
            const cacheKey = `${query}_${page}_${pageSize}`;
            if (
                searchCache.queries[cacheKey] &&
                Date.now() - searchCache.queries[cacheKey].timestamp < CACHE_EXPIRATION
            ) {
                return searchCache.queries[cacheKey].data;
            }

            const response = await apiClient.get('/etiquetas/buscar-rawg', {
                params: {
                    query,
                    page,
                    page_size: pageSize
                }
            });

            if (response.data) {
                // Guardar en caché
                searchCache.queries[cacheKey] = {
                    data: response.data,
                    timestamp: Date.now()
                };
                return response.data;
            }

            throw new Error('Error al buscar etiquetas');
        } catch (error) {
            console.error('Error en searchTags:', error);
            throw error.response?.data || { message: 'Error al buscar etiquetas en RAWG' };
        }
    },

    // Sincronizar una etiqueta con la base de datos local
    syncTag: async (rawgId) => {
        try {
            // Verificar caché
            if (
                searchCache.tags[rawgId] &&
                Date.now() - searchCache.tags[rawgId].timestamp < CACHE_EXPIRATION
            ) {
                return searchCache.tags[rawgId].data;
            }

            const response = await apiClient.post(`/etiquetas/${rawgId}/sincronizar`);

            if (response.data.status === 'success') {
                // Guardar en caché
                searchCache.tags[rawgId] = {
                    data: response.data.data,
                    timestamp: Date.now()
                };
                return response.data.data;
            }

            throw new Error('Error al sincronizar la etiqueta');
        } catch (error) {
            console.error('Error en syncTag:', error);
            throw error.response?.data || { message: 'Error al sincronizar la etiqueta' };
        }
    },

    // Sincronizar múltiples etiquetas
    syncMultipleTags: async (rawgIds) => {
        try {
            // Usamos directamente la referencia a syncTag del servicio
            const syncPromises = rawgIds.map(id => etiquetasService.syncTag(id));
            return await Promise.all(syncPromises);
        } catch (error) {
            console.error('Error en syncMultipleTags:', error);
            throw error;
        }
    },

    // Limpiar caché
    clearCache: () => {
        searchCache = {
            queries: {},
            tags: {},
            lastFetched: null
        };
    }
};

export default etiquetasService; 