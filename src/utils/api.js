// Cliente HTTP para la API de TVMaze

import { API_BASE_URL, API_ENDPOINTS, MESSAGES } from './constants.js'

/**
 * Clase para manejar errores de la API
 */
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Cliente HTTP para realizar peticiones a la API de TVMaze
 */
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.timeout = 10000 // 10 segundos
  }

  /**
   * Realiza una petición HTTP
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} options - Opciones de la petición
   * @returns {Promise} - Respuesta de la API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    // Configuración por defecto
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options
    }

    try {
      // Crear AbortController para timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new ApiError(
          this.getErrorMessage(response.status),
          response.status
        )
      }

      const data = await response.json()
      return data

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError(MESSAGES.ERROR_NETWORK, 408)
      }
      
      if (error instanceof ApiError) {
        throw error
      }

      // Error de red o parsing
      throw new ApiError(MESSAGES.ERROR_NETWORK, 0, error)
    }
  }

  /**
   * Obtiene el mensaje de error apropiado según el código de estado
   * @param {number} status - Código de estado HTTP
   * @returns {string} - Mensaje de error
   */
  getErrorMessage(status) {
    switch (status) {
      case 404:
        return MESSAGES.ERROR_NOT_FOUND
      case 500:
      case 502:
      case 503:
      case 504:
        return MESSAGES.ERROR_SERVER
      default:
        return MESSAGES.ERROR_GENERIC
    }
  }

  /**
   * Busca series por nombre
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} - Array de resultados de búsqueda
   */
  async searchShows(query) {
    if (!query || query.trim().length === 0) {
      return []
    }

    const endpoint = `${API_ENDPOINTS.SEARCH_SHOWS}?q=${encodeURIComponent(query.trim())}`
    const results = await this.request(endpoint)
    
    // Filtrar y ordenar resultados por relevancia
    return results
      .filter(result => result.show && result.show.id)
      .sort((a, b) => b.score - a.score)
      .map(result => ({
        ...result.show,
        score: result.score
      }))
  }

  /**
   * Obtiene los detalles de una serie específica
   * @param {number} showId - ID de la serie
   * @returns {Promise<Object>} - Detalles de la serie
   */
  async getShowDetails(showId) {
    if (!showId) {
      throw new ApiError(MESSAGES.ERROR_NOT_FOUND, 400)
    }

    const endpoint = `${API_ENDPOINTS.SHOW_DETAILS}/${showId}`
    return await this.request(endpoint)
  }

  /**
   * Obtiene los episodios de una serie
   * @param {number} showId - ID de la serie
   * @returns {Promise<Array>} - Array de episodios
   */
  async getShowEpisodes(showId) {
    if (!showId) {
      throw new ApiError(MESSAGES.ERROR_NOT_FOUND, 400)
    }

    const endpoint = `${API_ENDPOINTS.SHOW_EPISODES.replace('{id}', showId)}`
    return await this.request(endpoint)
  }

  /**
   * Obtiene las temporadas de una serie
   * @param {number} showId - ID de la serie
   * @returns {Promise<Array>} - Array de temporadas
   */
  async getShowSeasons(showId) {
    if (!showId) {
      throw new ApiError(MESSAGES.ERROR_NOT_FOUND, 400)
    }

    const endpoint = `${API_ENDPOINTS.SHOW_SEASONS.replace('{id}', showId)}`
    return await this.request(endpoint)
  }

  /**
   * Obtiene información completa de una serie (detalles + episodios + temporadas)
   * @param {number} showId - ID de la serie
   * @returns {Promise<Object>} - Información completa de la serie
   */
  async getCompleteShowInfo(showId) {
    try {
      const [details, episodes, seasons] = await Promise.allSettled([
        this.getShowDetails(showId),
        this.getShowEpisodes(showId),
        this.getShowSeasons(showId)
      ])

      const result = {
        details: details.status === 'fulfilled' ? details.value : null,
        episodes: episodes.status === 'fulfilled' ? episodes.value : [],
        seasons: seasons.status === 'fulfilled' ? seasons.value : []
      }

      if (!result.details) {
        throw new ApiError(MESSAGES.ERROR_NOT_FOUND, 404)
      }

      // Agregar información calculada
      result.details.totalEpisodes = result.episodes.length
      result.details.totalSeasons = result.seasons.length

      return result

    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(MESSAGES.ERROR_GENERIC, 500, error)
    }
  }
}

// Crear instancia singleton del cliente
const apiClient = new ApiClient()

// Exportar métodos del cliente
export const {
  searchShows,
  getShowDetails,
  getShowEpisodes,
  getShowSeasons,
  getCompleteShowInfo
} = apiClient

// Exportar la clase para testing o uso avanzado
export { ApiClient, ApiError }

// Exportar instancia por defecto
export default apiClient