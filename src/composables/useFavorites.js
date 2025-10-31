// Composable para manejar series favoritas con localStorage

import { ref, reactive, computed, watch } from 'vue'
import { STORAGE_KEYS, MESSAGES } from '@/utils/constants.js'

/**
 * Composable para manejar el sistema de favoritos
 * @returns {Object} - Estado y métodos de favoritos
 */
export function useFavorites() {
  // Estado reactivo para favoritos
  const favorites = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Carga los favoritos desde localStorage
   */
  const loadFavorites = () => {
    try {
      isLoading.value = true
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES)
      
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validar que sea un array
        if (Array.isArray(parsed)) {
          favorites.value = parsed
        } else {
          favorites.value = []
        }
      } else {
        favorites.value = []
      }
      
      error.value = null
    } catch (err) {
      console.error('Error loading favorites:', err)
      error.value = 'Error al cargar favoritos'
      favorites.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Guarda los favoritos en localStorage
   */
  const saveFavorites = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites.value))
      error.value = null
    } catch (err) {
      console.error('Error saving favorites:', err)
      error.value = 'Error al guardar favoritos'
    }
  }

  /**
   * Agrega una serie a favoritos
   * @param {Object} serie - Serie a agregar
   * @returns {boolean} - Si se agregó exitosamente
   */
  const addToFavorites = (serie) => {
    if (!serie || !serie.id) {
      error.value = 'Serie inválida'
      return false
    }

    // Verificar si ya está en favoritos
    if (isFavorite(serie.id)) {
      error.value = 'La serie ya está en favoritos'
      return false
    }

    try {
      const favoriteItem = {
        id: serie.id,
        name: serie.name,
        image: serie.image,
        rating: serie.rating,
        genres: serie.genres || [],
        addedAt: new Date().toISOString(),
        // Información adicional para mostrar en la lista
        status: serie.status,
        premiered: serie.premiered,
        summary: serie.summary
      }

      favorites.value.unshift(favoriteItem) // Agregar al inicio
      saveFavorites()
      error.value = null
      
      return true
    } catch (err) {
      console.error('Error adding to favorites:', err)
      error.value = 'Error al agregar a favoritos'
      return false
    }
  }

  /**
   * Remueve una serie de favoritos
   * @param {number} serieId - ID de la serie a remover
   * @returns {boolean} - Si se removió exitosamente
   */
  const removeFromFavorites = (serieId) => {
    if (!serieId) {
      error.value = 'ID de serie inválido'
      return false
    }

    try {
      const index = favorites.value.findIndex(fav => fav.id === serieId)
      
      if (index === -1) {
        error.value = 'La serie no está en favoritos'
        return false
      }

      favorites.value.splice(index, 1)
      saveFavorites()
      error.value = null
      
      return true
    } catch (err) {
      console.error('Error removing from favorites:', err)
      error.value = 'Error al remover de favoritos'
      return false
    }
  }

  /**
   * Alterna el estado de favorito de una serie
   * @param {Object} serie - Serie a alternar
   * @returns {boolean} - Nuevo estado (true = agregado, false = removido)
   */
  const toggleFavorite = (serie) => {
    if (!serie || !serie.id) {
      error.value = 'Serie inválida'
      return false
    }

    if (isFavorite(serie.id)) {
      removeFromFavorites(serie.id)
      return false
    } else {
      addToFavorites(serie)
      return true
    }
  }

  /**
   * Verifica si una serie está en favoritos
   * @param {number} serieId - ID de la serie
   * @returns {boolean} - Si está en favoritos
   */
  const isFavorite = (serieId) => {
    return favorites.value.some(fav => fav.id === serieId)
  }

  /**
   * Obtiene una serie favorita por ID
   * @param {number} serieId - ID de la serie
   * @returns {Object|null} - Serie favorita o null
   */
  const getFavoriteById = (serieId) => {
    return favorites.value.find(fav => fav.id === serieId) || null
  }

  /**
   * Limpia todos los favoritos
   * @returns {boolean} - Si se limpiaron exitosamente
   */
  const clearAllFavorites = () => {
    try {
      favorites.value = []
      saveFavorites()
      error.value = null
      return true
    } catch (err) {
      console.error('Error clearing favorites:', err)
      error.value = 'Error al limpiar favoritos'
      return false
    }
  }

  /**
   * Obtiene favoritos ordenados por diferentes criterios
   * @param {string} sortBy - Criterio de ordenamiento
   * @returns {Array} - Favoritos ordenados
   */
  const getSortedFavorites = (sortBy = 'addedAt') => {
    const sorted = [...favorites.value]
    
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
      case 'addedAt':
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.addedAt)
          const dateB = new Date(b.addedAt)
          return dateB - dateA
        })
    }
  }

  /**
   * Busca en favoritos por nombre
   * @param {string} query - Término de búsqueda
   * @returns {Array} - Favoritos que coinciden
   */
  const searchInFavorites = (query) => {
    if (!query || query.trim().length === 0) {
      return favorites.value
    }

    const searchTerm = query.toLowerCase().trim()
    return favorites.value.filter(fav => 
      fav.name.toLowerCase().includes(searchTerm) ||
      (fav.genres && fav.genres.some(genre => 
        genre.toLowerCase().includes(searchTerm)
      ))
    )
  }

  /**
   * Exporta favoritos como JSON
   * @returns {string} - JSON de favoritos
   */
  const exportFavorites = () => {
    try {
      return JSON.stringify(favorites.value, null, 2)
    } catch (err) {
      console.error('Error exporting favorites:', err)
      return null
    }
  }

  /**
   * Importa favoritos desde JSON
   * @param {string} jsonData - Datos JSON
   * @returns {boolean} - Si se importaron exitosamente
   */
  const importFavorites = (jsonData) => {
    try {
      const imported = JSON.parse(jsonData)
      
      if (!Array.isArray(imported)) {
        error.value = 'Formato de datos inválido'
        return false
      }

      favorites.value = imported
      saveFavorites()
      error.value = null
      return true
    } catch (err) {
      console.error('Error importing favorites:', err)
      error.value = 'Error al importar favoritos'
      return false
    }
  }

  // Propiedades computadas
  const favoritesCount = computed(() => favorites.value.length)
  const hasFavorites = computed(() => favorites.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && favorites.value.length === 0)

  // Estadísticas de favoritos
  const favoriteStats = computed(() => {
    const stats = {
      total: favorites.value.length,
      byGenre: {},
      byStatus: {},
      averageRating: 0
    }

    let totalRating = 0
    let ratedCount = 0

    favorites.value.forEach(fav => {
      // Contar por géneros
      if (fav.genres) {
        fav.genres.forEach(genre => {
          stats.byGenre[genre] = (stats.byGenre[genre] || 0) + 1
        })
      }

      // Contar por estado
      if (fav.status) {
        stats.byStatus[fav.status] = (stats.byStatus[fav.status] || 0) + 1
      }

      // Calcular rating promedio
      if (fav.rating?.average) {
        totalRating += fav.rating.average
        ratedCount++
      }
    })

    if (ratedCount > 0) {
      stats.averageRating = totalRating / ratedCount
    }

    return stats
  })

  // Cargar favoritos al inicializar
  loadFavorites()

  // Retornar estado y métodos
  return {
    // Estado
    favorites,
    isLoading,
    error,
    
    // Propiedades computadas
    favoritesCount,
    hasFavorites,
    isEmpty,
    favoriteStats,
    
    // Métodos principales
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    
    // Métodos de utilidad
    getFavoriteById,
    clearAllFavorites,
    getSortedFavorites,
    searchInFavorites,
    
    // Métodos de importación/exportación
    exportFavorites,
    importFavorites,
    
    // Métodos de gestión
    loadFavorites,
    saveFavorites
  }
}