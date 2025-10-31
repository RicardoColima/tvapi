// Constantes de la aplicación TVApi Series

// URLs de la API de TVMaze
export const API_BASE_URL = 'https://api.tvmaze.com'
export const API_ENDPOINTS = {
  SEARCH_SHOWS: '/search/shows',
  SHOW_DETAILS: '/shows',
  SHOW_EPISODES: '/shows/{id}/episodes',
  SHOW_SEASONS: '/shows/{id}/seasons'
}

// Configuración de localStorage
export const STORAGE_KEYS = {
  FAVORITES: 'tvapi-favorites',
  SEARCH_HISTORY: 'tvapi-search-history',
  USER_PREFERENCES: 'tvapi-preferences'
}

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'TVApi Series',
  DESCRIPTION: 'Catálogo de Series de Televisión',
  VERSION: '1.0.0',
  AUTHOR: 'TVApi Team'
}

// Configuración de búsqueda
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 500,
  MAX_RESULTS: 50,
  PLACEHOLDER_TEXT: 'Buscar series...'
}

// Mensajes de la aplicación en español
export const MESSAGES = {
  LOADING: 'Cargando...',
  NO_RESULTS: 'No se encontraron resultados',
  ERROR_NETWORK: 'Error de conexión. Verifica tu internet.',
  ERROR_NOT_FOUND: 'Serie no encontrada',
  ERROR_SERVER: 'Error del servidor. Intenta más tarde.',
  ERROR_GENERIC: 'Ha ocurrido un error inesperado',
  SEARCH_PLACEHOLDER: 'Buscar series por nombre...',
  FAVORITES_EMPTY: 'No tienes series favoritas aún',
  FAVORITES_ADDED: 'Serie agregada a favoritos',
  FAVORITES_REMOVED: 'Serie removida de favoritos'
}

// Estados de las series
export const SHOW_STATUS = {
  RUNNING: 'En emisión',
  ENDED: 'Finalizada',
  TO_BE_DETERMINED: 'Por determinar',
  IN_DEVELOPMENT: 'En desarrollo'
}

// Géneros más comunes (para iconos y colores)
export const GENRES = {
  ACTION: 'Acción',
  ADVENTURE: 'Aventura',
  ANIMATION: 'Animación',
  COMEDY: 'Comedia',
  CRIME: 'Crimen',
  DOCUMENTARY: 'Documental',
  DRAMA: 'Drama',
  FAMILY: 'Familiar',
  FANTASY: 'Fantasía',
  HISTORY: 'Historia',
  HORROR: 'Terror',
  MUSIC: 'Musical',
  MYSTERY: 'Misterio',
  ROMANCE: 'Romance',
  SCIENCE_FICTION: 'Ciencia Ficción',
  THRILLER: 'Thriller',
  WAR: 'Guerra',
  WESTERN: 'Western'
}

// Configuración de imágenes
export const IMAGE_CONFIG = {
  PLACEHOLDER: '/placeholder-serie.jpg',
  SIZES: {
    SMALL: 'medium',
    LARGE: 'original'
  },
  LAZY_LOADING: true
}

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
}

// Breakpoints responsive
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
}

// Configuración del grid de series
export const GRID_CONFIG = {
  COLUMNS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 4,
    LARGE: 5
  },
  GAP: {
    MOBILE: 4,
    DESKTOP: 6
  }
}