// Funciones de formateo de datos para TVApi Series

/**
 * Formatea la calificación de una serie
 * @param {Object} rating - Objeto de rating de TVMaze
 * @returns {string} - Rating formateado
 */
export function formatRating(rating) {
  if (!rating || !rating.average) {
    return 'Sin calificación'
  }
  return `${rating.average.toFixed(1)}/10`
}

/**
 * Formatea los géneros de una serie
 * @param {Array} genres - Array de géneros
 * @returns {string} - Géneros separados por comas
 */
export function formatGenres(genres) {
  if (!genres || genres.length === 0) {
    return 'Sin género especificado'
  }
  return genres.join(', ')
}

/**
 * Limpia el HTML de la sinopsis
 * @param {string} summary - Sinopsis con HTML
 * @returns {string} - Sinopsis sin HTML
 */
export function cleanSummary(summary) {
  if (!summary) {
    return 'Sin sinopsis disponible'
  }
  // Remover tags HTML
  return summary.replace(/<[^>]*>/g, '').trim()
}

/**
 * Formatea la fecha de estreno
 * @param {string} premiered - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada en español
 */
export function formatPremiered(premiered) {
  if (!premiered) {
    return 'Fecha no disponible'
  }
  
  const date = new Date(premiered)
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC'
  }
  
  return date.toLocaleDateString('es-ES', options)
}

/**
 * Extrae el año de una fecha
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} - Año formateado
 */
export function formatYear(dateString) {
  if (!dateString) {
    return ''
  }
  
  const date = new Date(dateString)
  return date.getFullYear().toString()
}

/**
 * Formatea el estado de la serie
 * @param {string} status - Estado de la serie
 * @returns {string} - Estado en español
 */
export function formatStatus(status) {
  const statusMap = {
    'Running': 'En emisión',
    'Ended': 'Finalizada',
    'To Be Determined': 'Por determinar',
    'In Development': 'En desarrollo'
  }
  
  return statusMap[status] || status || 'Estado desconocido'
}

/**
 * Formatea la duración del episodio
 * @param {number} runtime - Duración en minutos
 * @returns {string} - Duración formateada
 */
export function formatRuntime(runtime) {
  if (!runtime) {
    return 'Duración no disponible'
  }
  
  if (runtime < 60) {
    return `${runtime} min`
  }
  
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  
  if (minutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${minutes}min`
}

/**
 * Formatea la información de la cadena/network
 * @param {Object} network - Objeto de network
 * @returns {string} - Información de la cadena
 */
export function formatNetwork(network) {
  if (!network) {
    return 'Cadena no disponible'
  }
  
  let result = network.name || 'Cadena desconocida'
  
  if (network.country && network.country.name) {
    result += ` (${network.country.name})`
  }
  
  return result
}

/**
 * Formatea el idioma
 * @param {string} language - Código o nombre del idioma
 * @returns {string} - Idioma en español
 */
export function formatLanguage(language) {
  const languageMap = {
    'English': 'Inglés',
    'Spanish': 'Español',
    'French': 'Francés',
    'German': 'Alemán',
    'Italian': 'Italiano',
    'Portuguese': 'Portugués',
    'Japanese': 'Japonés',
    'Korean': 'Coreano',
    'Chinese': 'Chino',
    'Russian': 'Ruso'
  }
  
  return languageMap[language] || language || 'Idioma no disponible'
}

/**
 * Obtiene la URL de imagen con fallback
 * @param {Object} image - Objeto de imagen de TVMaze
 * @param {string} size - Tamaño deseado ('medium' o 'original')
 * @returns {string} - URL de la imagen
 */
export function getImageUrl(image, size = 'medium') {
  if (!image) {
    return '/placeholder-serie.jpg'
  }
  
  return image[size] || image.medium || image.original || '/placeholder-serie.jpg'
}

/**
 * Trunca el texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export function truncateText(text, maxLength = 150) {
  if (!text) {
    return ''
  }
  
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Formatea el número de temporadas y episodios
 * @param {number} seasons - Número de temporadas
 * @param {number} episodes - Número de episodios
 * @returns {string} - Información formateada
 */
export function formatSeasonEpisodeInfo(seasons, episodes) {
  let result = []
  
  if (seasons && seasons > 0) {
    result.push(`${seasons} temporada${seasons > 1 ? 's' : ''}`)
  }
  
  if (episodes && episodes > 0) {
    result.push(`${episodes} episodio${episodes > 1 ? 's' : ''}`)
  }
  
  return result.length > 0 ? result.join(' • ') : 'Información no disponible'
}

/**
 * Calcula las estrellas para mostrar rating visual
 * @param {Object} rating - Objeto de rating
 * @returns {Object} - Información de estrellas
 */
export function calculateStars(rating) {
  if (!rating || !rating.average) {
    return {
      fullStars: 0,
      halfStar: false,
      emptyStars: 5,
      rating: 0
    }
  }
  
  const ratingValue = rating.average
  const scaledRating = (ratingValue / 10) * 5 // Convertir de 10 a 5 estrellas
  const fullStars = Math.floor(scaledRating)
  const halfStar = scaledRating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
  
  return {
    fullStars,
    halfStar,
    emptyStars,
    rating: ratingValue
  }
}

/**
 * Formatea la fecha para mostrar "hace X tiempo"
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} - Tiempo relativo
 */
export function formatRelativeTime(dateString) {
  if (!dateString) {
    return 'Fecha no disponible'
  }
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Hace un momento'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `Hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`
}