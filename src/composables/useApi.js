// Composable para manejar llamadas a la API de TVMaze

import { ref, reactive, computed } from 'vue'
import apiClient, { getCompleteShowInfo, getShowEpisodes as apiGetShowEpisodes } from '@/utils/api.js'
import { MESSAGES } from '@/utils/constants.js'

/**
 * Composable para manejar el estado y operaciones de la API
 * @returns {Object} - Estado y métodos de la API
 */
export function useApi() {
  // Estado reactivo para el manejo de la API
  const state = reactive({
    isLoading: false,
    error: null,
    searchResults: [],
    currentShow: null,
    lastQuery: ''
  })

  // Cache simple para evitar peticiones duplicadas
  const cache = reactive({
    searches: new Map(),
    shows: new Map()
  })

  /**
   * Limpia el estado de error
   */
  const clearError = () => {
    state.error = null
  }

  /**
   * Establece un error
   * @param {string|Error} error - Error a establecer
   */
  const setError = (error) => {
    if (typeof error === 'string') {
      state.error = error
    } else if (error && error.message) {
      state.error = error.message
    } else {
      state.error = MESSAGES.ERROR_GENERIC
    }
    console.error('API Error:', error)
  }

  /**
   * Busca series por nombre con debouncing y cache
   * @param {string} query - Término de búsqueda
   * @param {boolean} useCache - Si usar cache o no
   * @returns {Promise<Array>} - Resultados de búsqueda
   */
  const searchShows = async (query, useCache = true) => {
    // Validar query
    if (!query || query.trim().length < 2) {
      state.searchResults = []
      state.lastQuery = ''
      return []
    }

    const trimmedQuery = query.trim().toLowerCase()
    
    // Verificar cache si está habilitado
    if (useCache && cache.searches.has(trimmedQuery)) {
      const cachedResults = cache.searches.get(trimmedQuery)
      state.searchResults = cachedResults
      state.lastQuery = query
      return cachedResults
    }

    try {
      state.isLoading = true
      clearError()

      const results = await apiClient.searchShows(query)
      
      // Guardar en cache
      if (useCache) {
        cache.searches.set(trimmedQuery, results)
      }

      state.searchResults = results
      state.lastQuery = query

      return results

    } catch (error) {
      setError(error.message || MESSAGES.ERROR_GENERIC)
      state.searchResults = []
      return []

    } finally {
      state.isLoading = false
    }
  }

  /**
   * Obtiene los detalles completos de una serie
   * @param {number} showId - ID de la serie
   * @param {boolean} useCache - Si usar cache o no
   * @returns {Promise<Object|null>} - Detalles de la serie
   */
  const getShowDetails = async (showId, useCache = true) => {
    if (!showId) {
      setError(MESSAGES.ERROR_NOT_FOUND)
      return null
    }

    // Verificar cache
    if (useCache && cache.shows.has(showId)) {
      const cachedShow = cache.shows.get(showId)
      state.currentShow = cachedShow
      return cachedShow
    }

    try {
      state.isLoading = true
      clearError()

      const showInfo = await getCompleteShowInfo(showId)
      
      // Extraer solo los detalles de la serie
      const serieDetails = showInfo.details
      
      // Guardar en cache
      if (useCache) {
        cache.shows.set(showId, serieDetails)
      }

      state.currentShow = serieDetails

      return serieDetails

    } catch (error) {
      setError(error.message || MESSAGES.ERROR_NOT_FOUND)
      state.currentShow = null
      return null

    } finally {
      state.isLoading = false
    }
  }

  /**
   * Limpia los resultados de búsqueda
   */
  const clearSearchResults = () => {
    state.searchResults = []
    state.lastQuery = ''
  }

  /**
   * Limpia la serie actual
   */
  const clearCurrentShow = () => {
    state.currentShow = null
  }

  /**
   * Limpia todo el cache
   */
  const clearCache = () => {
    cache.searches.clear()
    cache.shows.clear()
  }

  /**
   * Obtiene estadísticas del cache
   * @returns {Object} - Estadísticas del cache
   */
  const getCacheStats = () => {
    return {
      searchesCount: cache.searches.size,
      showsCount: cache.shows.size,
      totalCacheSize: cache.searches.size + cache.shows.size
    }
  }

  /**
   * Reintenta la última operación fallida
   */
  const retry = async () => {
    if (state.lastQuery) {
      return await searchShows(state.lastQuery, false)
    }
    return []
  }

  /**
   * Verifica si hay una búsqueda activa
   * @returns {boolean} - Si hay búsqueda activa
   */
  const hasActiveSearch = () => {
    return state.lastQuery.length > 0
  }

  /**
   * Verifica si hay resultados
   * @returns {boolean} - Si hay resultados
   */
  const hasResults = () => {
    return state.searchResults.length > 0
  }

  /**
   * Verifica si hay una serie cargada
   * @returns {boolean} - Si hay serie cargada
   */
  const hasCurrentShow = () => {
    return state.currentShow !== null
  }

  /**
   * Obtiene los episodios de una serie
   * @param {number} showId - ID de la serie
   * @returns {Promise<Array>} - Array de episodios
   */
  const getShowEpisodes = async (showId) => {
    if (!showId) {
      setError(MESSAGES.ERROR_NOT_FOUND)
      return []
    }

    try {
      state.isLoading = true
      clearError()

      const episodes = await apiGetShowEpisodes(showId)
      return episodes

    } catch (error) {
      setError(error.message || MESSAGES.ERROR_GENERIC)
      return []

    } finally {
      state.isLoading = false
    }
  }

  /**
   * Obtiene el reparto de una serie (simulado por ahora)
   * @param {number} showId - ID de la serie
   * @returns {Promise<Array>} - Array del reparto
   */
  const getShowCast = async (showId) => {
    if (!showId) {
      setError(MESSAGES.ERROR_NOT_FOUND)
      return []
    }

    try {
      state.isLoading = true
      clearError()

      // Por ahora retornamos un array vacío ya que TVMaze no tiene endpoint de cast directo
      // En una implementación real, se podría usar el endpoint de cast de TVMaze
      return []

    } catch (error) {
      setError(error.message || MESSAGES.ERROR_GENERIC)
      return []

    } finally {
      state.isLoading = false
    }
  }

  // Retornar estado y métodos
  return {
    // Estado reactivo
    ...state,
    
    // Alias para compatibilidad
    currentSerie: computed(() => state.currentShow),
    
    // Métodos principales
    searchShows,
    getShowDetails,
    getShowEpisodes,
    getShowCast,
    
    // Métodos de utilidad
    clearError,
    clearSearchResults,
    clearCurrentShow,
    clearCache,
    retry,
    
    // Métodos de verificación
    hasActiveSearch,
    hasResults,
    hasCurrentShow,
    
    // Información del cache
    getCacheStats,
    
    // Estado computado para facilitar el uso en templates
    isEmpty: () => !state.isLoading && !hasResults() && hasActiveSearch(),
    isSearching: () => state.isLoading && hasActiveSearch(),
    hasError: () => state.error !== null
  }
}