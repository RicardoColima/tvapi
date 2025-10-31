// Composable para manejar búsquedas de series con debounce y cache

import { ref, computed, watch, nextTick } from 'vue'
import { useApi } from './useApi.js'
import { SEARCH_CONFIG, MESSAGES } from '@/utils/constants.js'

/**
 * Composable para manejar búsquedas de series
 * @returns {Object} - Estado y métodos de búsqueda
 */
export function useSearch() {
  // Usar el composable de API
  const { searchShows, isLoading: apiLoading, error: apiError } = useApi()

  // Estado de búsqueda
  const searchQuery = ref('')
  const searchResults = ref([])
  const isSearching = ref(false)
  const searchError = ref(null)
  const hasSearched = ref(false)
  const lastSearchQuery = ref('')

  // Cache de búsquedas
  const searchCache = ref(new Map())
  const searchHistory = ref([])

  // Configuración de debounce
  let debounceTimer = null

  /**
   * Limpia el timer de debounce
   */
  const clearDebounceTimer = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  /**
   * Ejecuta la búsqueda real
   * @param {string} query - Término de búsqueda
   */
  const executeSearch = async (query) => {
    console.log('🔍 executeSearch llamado con query:', query)
    if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      console.log('❌ Query inválido en executeSearch:', query)
      searchResults.value = []
      searchError.value = null
      hasSearched.value = false
      return
    }

    const trimmedQuery = query.trim().toLowerCase()
    console.log('🔍 Query procesado:', trimmedQuery)
    
    try {
      isSearching.value = true
      searchError.value = null

      // Verificar cache primero
      if (searchCache.value.has(trimmedQuery)) {
        const cachedResult = searchCache.value.get(trimmedQuery)
        searchResults.value = cachedResult.results
        lastSearchQuery.value = trimmedQuery
        hasSearched.value = true
        console.log(`Resultados desde cache para: "${trimmedQuery}"`)
        return
      }

      // Realizar búsqueda en API
      console.log(`Buscando series: "${trimmedQuery}"`)
      const results = await searchShows(trimmedQuery)
      
      // Procesar resultados
      searchResults.value = results || []
      lastSearchQuery.value = trimmedQuery
      hasSearched.value = true

      // Guardar en cache
      searchCache.value.set(trimmedQuery, {
        results: results || [],
        timestamp: Date.now()
      })

      // Agregar a historial si no existe
      addToSearchHistory(trimmedQuery)

      // Limpiar cache si es muy grande
      if (searchCache.value.size > SEARCH_CONFIG.MAX_CACHE_SIZE) {
        clearOldCache()
      }

    } catch (error) {
      console.error('Error en búsqueda:', error)
      searchError.value = error.message || MESSAGES.SEARCH_ERROR
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  /**
   * Busca series con debounce
   * @param {string} query - Término de búsqueda
   */
  const searchWithDebounce = (query) => {
    clearDebounceTimer()
    
    debounceTimer = setTimeout(() => {
      executeSearch(query)
    }, SEARCH_CONFIG.DEBOUNCE_DELAY)
  }

  /**
   * Busca series inmediatamente (sin debounce)
   * @param {string} query - Término de búsqueda
   */
  const searchImmediate = (query) => {
    clearDebounceTimer()
    executeSearch(query)
  }

  /**
   * Actualiza el término de búsqueda
   * @param {string} query - Nuevo término
   */
  const updateSearchQuery = (query) => {
    searchQuery.value = query
    searchWithDebounce(query)
  }

  /**
   * Limpia la búsqueda actual
   */
  const clearSearch = () => {
    clearDebounceTimer()
    searchQuery.value = ''
    searchResults.value = []
    searchError.value = null
    hasSearched.value = false
    lastSearchQuery.value = ''
    isSearching.value = false
  }

  /**
   * Agrega un término al historial de búsquedas
   * @param {string} query - Término a agregar
   */
  const addToSearchHistory = (query) => {
    if (!query || query.trim().length === 0) return

    const trimmedQuery = query.trim().toLowerCase()
    
    // Remover si ya existe
    const existingIndex = searchHistory.value.indexOf(trimmedQuery)
    if (existingIndex > -1) {
      searchHistory.value.splice(existingIndex, 1)
    }

    // Agregar al inicio
    searchHistory.value.unshift(trimmedQuery)

    // Limitar tamaño del historial
    if (searchHistory.value.length > SEARCH_CONFIG.MAX_HISTORY_SIZE) {
      searchHistory.value = searchHistory.value.slice(0, SEARCH_CONFIG.MAX_HISTORY_SIZE)
    }

    // Guardar en localStorage
    saveSearchHistory()
  }

  /**
   * Guarda el historial en localStorage
   */
  const saveSearchHistory = () => {
    try {
      localStorage.setItem('tvapi_search_history', JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('Error guardando historial de búsqueda:', error)
    }
  }

  /**
   * Carga el historial desde localStorage
   */
  const loadSearchHistory = () => {
    try {
      const stored = localStorage.getItem('tvapi_search_history')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          searchHistory.value = parsed.slice(0, SEARCH_CONFIG.MAX_HISTORY_SIZE)
        }
      }
    } catch (error) {
      console.error('Error cargando historial de búsqueda:', error)
      searchHistory.value = []
    }
  }

  /**
   * Limpia el historial de búsquedas
   */
  const clearSearchHistory = () => {
    searchHistory.value = []
    saveSearchHistory()
  }

  /**
   * Limpia entradas antiguas del cache
   */
  const clearOldCache = () => {
    const now = Date.now()
    const maxAge = SEARCH_CONFIG.CACHE_DURATION

    for (const [key, value] of searchCache.value.entries()) {
      if (now - value.timestamp > maxAge) {
        searchCache.value.delete(key)
      }
    }
  }

  /**
   * Limpia todo el cache de búsquedas
   */
  const clearSearchCache = () => {
    searchCache.value.clear()
  }

  /**
   * Obtiene sugerencias de búsqueda basadas en el historial
   * @param {string} query - Término parcial
   * @returns {Array} - Sugerencias
   */
  const getSearchSuggestions = (query) => {
    if (!query || query.trim().length === 0) {
      return searchHistory.value.slice(0, 5)
    }

    const trimmedQuery = query.trim().toLowerCase()
    return searchHistory.value
      .filter(item => item.includes(trimmedQuery))
      .slice(0, 5)
  }

  /**
   * Busca desde una sugerencia del historial
   * @param {string} suggestion - Sugerencia seleccionada
   */
  const searchFromSuggestion = (suggestion) => {
    searchQuery.value = suggestion
    searchImmediate(suggestion)
  }

  /**
   * Filtra resultados por género
   * @param {string} genre - Género a filtrar
   * @returns {Array} - Resultados filtrados
   */
  const filterByGenre = (genre) => {
    if (!genre) return searchResults.value

    return searchResults.value.filter(serie => 
      serie.genres && serie.genres.includes(genre)
    )
  }

  /**
   * Filtra resultados por rating mínimo
   * @param {number} minRating - Rating mínimo
   * @returns {Array} - Resultados filtrados
   */
  const filterByRating = (minRating) => {
    if (!minRating) return searchResults.value

    return searchResults.value.filter(serie => 
      serie.rating?.average && serie.rating.average >= minRating
    )
  }

  /**
   * Ordena resultados por diferentes criterios
   * @param {string} sortBy - Criterio de ordenamiento
   * @returns {Array} - Resultados ordenados
   */
  const sortResults = (sortBy = 'relevance') => {
    const sorted = [...searchResults.value]

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = a.rating?.average || 0
          const ratingB = b.rating?.average || 0
          return ratingB - ratingA
        })
      case 'premiered':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.premiered || 0)
          const dateB = new Date(b.premiered || 0)
          return dateB - dateA
        })
      case 'relevance':
      default:
        return sorted // Mantener orden de relevancia de la API
    }
  }

  // Propiedades computadas
  const hasResults = computed(() => searchResults.value.length > 0)
  const isEmpty = computed(() => hasSearched.value && searchResults.value.length === 0)
  const isLoading = computed(() => isSearching.value || apiLoading.value)
  const error = computed(() => searchError.value || apiError.value)
  const resultsCount = computed(() => searchResults.value.length)
  const hasQuery = computed(() => searchQuery.value.trim().length > 0)
  const canSearch = computed(() => 
    searchQuery.value.trim().length >= SEARCH_CONFIG.MIN_QUERY_LENGTH
  )

  // Estadísticas de resultados
  const searchStats = computed(() => {
    const stats = {
      total: searchResults.value.length,
      byGenre: {},
      byStatus: {},
      averageRating: 0,
      ratingRange: { min: 10, max: 0 }
    }

    let totalRating = 0
    let ratedCount = 0

    searchResults.value.forEach(serie => {
      // Contar por géneros
      if (serie.genres) {
        serie.genres.forEach(genre => {
          stats.byGenre[genre] = (stats.byGenre[genre] || 0) + 1
        })
      }

      // Contar por estado
      if (serie.status) {
        stats.byStatus[serie.status] = (stats.byStatus[serie.status] || 0) + 1
      }

      // Calcular estadísticas de rating
      if (serie.rating?.average) {
        const rating = serie.rating.average
        totalRating += rating
        ratedCount++
        
        if (rating < stats.ratingRange.min) stats.ratingRange.min = rating
        if (rating > stats.ratingRange.max) stats.ratingRange.max = rating
      }
    })

    if (ratedCount > 0) {
      stats.averageRating = totalRating / ratedCount
    } else {
      stats.ratingRange = { min: 0, max: 0 }
    }

    return stats
  })

  // Cargar historial al inicializar
  loadSearchHistory()

  // Limpiar cache periódicamente
  setInterval(clearOldCache, SEARCH_CONFIG.CACHE_CLEANUP_INTERVAL)

  // Limpiar timer al destruir
  const cleanup = () => {
    clearDebounceTimer()
  }

  // Retornar estado y métodos
  return {
    // Estado
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    hasSearched,
    lastSearchQuery,
    searchHistory,

    // Propiedades computadas
    hasResults,
    isEmpty,
    isLoading,
    error,
    resultsCount,
    hasQuery,
    canSearch,
    searchStats,

    // Métodos de búsqueda
    updateSearchQuery,
    searchImmediate,
    clearSearch,

    // Métodos de historial
    addToSearchHistory,
    clearSearchHistory,
    getSearchSuggestions,
    searchFromSuggestion,

    // Métodos de filtrado y ordenamiento
    filterByGenre,
    filterByRating,
    sortResults,

    // Métodos de cache
    clearSearchCache,

    // Cleanup
    cleanup
  }
}