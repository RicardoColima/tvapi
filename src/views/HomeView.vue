<!-- Vista principal de la aplicación -->
<template>
  <AppLayout>
    <div class="home-view">
      
      <!-- Hero Section con búsqueda destacada -->
      <section class="hero-section relative overflow-hidden bg-gradient-to-br from-primary-900 via-dark-800 to-accent-900 py-16 lg:py-24">
        <div class="absolute inset-0 bg-black/20"></div>
        
        <!-- Patrón de fondo -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, #6366f1 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)"></div>
        </div>
        
        <div class="relative z-10 container mx-auto px-4 text-center">
          <h1 class="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Descubre tu próxima
            <span class="text-gradient bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              serie favorita
            </span>
          </h1>
          
          <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Explora miles de series, encuentra información detallada y guarda tus favoritas en un solo lugar
          </p>
          
          <!-- Barra de búsqueda principal -->
          <div class="max-w-2xl mx-auto mb-8">
            <SearchBar
              v-model="searchQuery"
              size="lg"
              placeholder="Buscar series, actores, géneros..."
              :autofocus="true"
              @search="handleSearch"
            />
          </div>
          
          <!-- Estadísticas rápidas -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Series Populares</p>
                  <p class="text-2xl font-bold text-white">{{ popularSeries.length }}</p>
                </div>
                <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp class="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
          
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Géneros</p>
                  <p class="text-2xl font-bold text-white">{{ Object.keys(GENRES).length }}</p>
                </div>
                <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Star class="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          
            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Pruebas API</p>
                  <div class="flex gap-2 mt-2">
                    <button 
                      @click="testApiConnection"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                    >
                      Test API
                    </button>
                    <button 
                      @click="testApiSearch"
                      class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
                    >
                      Test Search
                    </button>
                    <button 
                      @click="testNavigation"
                      class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors"
                    >
                      Test Navigation
                    </button>
                  </div>
                </div>
                <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity class="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <div class="flex items-center gap-2">
              <Tv :size="16" />
              <span>Miles de series</span>
            </div>
            <div class="flex items-center gap-2">
              <Star :size="16" />
              <span>Información detallada</span>
            </div>
            <div class="flex items-center gap-2">
              <Heart :size="16" />
              <span>Lista de favoritos</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de resultados de búsqueda -->
      <section 
        v-if="showSearchResults"
        class="search-results-section py-8"
      >
        <div class="container mx-auto px-4">
          <SearchResults />
        </div>
      </section>

      <!-- Sección de series populares -->
      <section 
        v-else
        class="popular-series-section py-12"
      >
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-bold text-white flex items-center gap-3">
              <TrendingUp :size="28" />
              Series Populares
            </h2>
            
            <!-- Filtros rápidos -->
            <div class="hidden md:flex items-center gap-2">
              <button
                v-for="filter in popularFilters"
                :key="filter.value"
                @click="setPopularFilter(filter.value)"
                :class="getFilterButtonClasses(filter.value)"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <!-- Grid de series populares -->
          <div 
            v-if="isLoadingPopular"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            <div
              v-for="n in 10"
              :key="n"
              class="animate-pulse"
            >
              <div class="bg-gray-700 aspect-[2/3] rounded-lg mb-3"></div>
              <div class="bg-gray-700 h-4 rounded mb-2"></div>
              <div class="bg-gray-700 h-3 rounded w-3/4"></div>
            </div>
          </div>

          <div 
            v-else-if="popularSeries.length > 0"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            <SerieCard
              v-for="serie in popularSeries"
              :key="serie.id"
              :serie="serie"
              size="md"
              :show-summary="false"
            />
          </div>

          <div 
            v-else-if="popularError"
            class="text-center py-12"
          >
            <ErrorMessage
              type="error"
              title="Error al cargar series"
              :message="popularError"
              @retry="loadPopularSeries"
            />
          </div>

          <!-- Botón para cargar más -->
          <div 
            v-if="popularSeries.length > 0 && !isLoadingPopular"
            class="text-center mt-8"
          >
            <button
              @click="loadMorePopular"
              :disabled="isLoadingMore"
              class="px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <span v-if="isLoadingMore">
                <LoadingSpinner size="xs" color="white" />
                Cargando...
              </span>
              <span v-else>
                Ver más series
                <ChevronDown :size="16" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- Sección de géneros populares -->
      <section class="genres-section py-12 bg-gray-900/50">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Grid3X3 :size="28" />
            Explorar por Género
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <button
              v-for="genre in popularGenres"
              :key="genre.name"
              @click="searchByGenre(genre.name)"
              class="genre-card group relative overflow-hidden rounded-lg aspect-video bg-gradient-to-br from-gray-800 to-gray-900 hover:from-primary-800 hover:to-primary-900 transition-all duration-300 transform hover:scale-105"
            >
              <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
              <div class="relative z-10 h-full flex flex-col items-center justify-center text-center p-4">
                <component 
                  :is="genre.icon" 
                  :size="32" 
                  class="text-white mb-2 group-hover:scale-110 transition-transform duration-300" 
                />
                <span class="text-white font-semibold text-sm">{{ genre.name }}</span>
                <span class="text-gray-300 text-xs mt-1">{{ genre.count }}+ series</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- Sección de favoritos recientes -->
      <section 
        v-if="recentFavorites.length > 0"
        class="recent-favorites-section py-12"
      >
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-bold text-white flex items-center gap-3">
              <Heart :size="28" />
              Tus Favoritos Recientes
            </h2>
            
            <router-link
              to="/favorites"
              class="text-primary-400 hover:text-primary-300 transition-colors duration-200 flex items-center gap-1"
            >
              Ver todos
              <ChevronRight :size="16" />
            </router-link>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <SerieCard
              v-for="serie in recentFavorites.slice(0, 5)"
              :key="serie.id"
              :serie="serie"
              size="md"
              :show-summary="false"
            />
          </div>
        </div>
      </section>

      <!-- Call to action -->
      <section class="cta-section py-16 bg-gradient-to-r from-primary-900 to-accent-900">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p class="text-gray-300 mb-8 max-w-2xl mx-auto">
            Utiliza nuestra búsqueda avanzada para encontrar series específicas por actor, año, género o cualquier criterio que tengas en mente
          </p>
          <button
            @click="focusSearch"
            class="px-8 py-3 bg-white text-primary-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <Search :size="20" />
            Búsqueda Avanzada
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Tv,
  Star,
  Heart,
  TrendingUp,
  Grid3X3,
  Search,
  ChevronDown,
  ChevronRight,
  Zap,
  Drama,
  Laugh,
  Sword,
  Rocket,
  Users,
  Activity
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import SearchBar from '@/components/SearchBar.vue'
import SearchResults from '@/components/SearchResults.vue'
import SerieCard from '@/components/SerieCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

import { useSearch } from '@/composables/useSearch.js'
import { useFavorites } from '@/composables/useFavorites.js'
import { useApi } from '@/composables/useApi.js'
import { GENRES } from '@/utils/constants.js'

// Composables
const router = useRouter()
const { searchQuery, searchResults, isLoading: isSearchLoading, executeSearch } = useSearch()
const { favorites } = useFavorites()
const { searchShows, isLoading: apiLoading, error: apiError } = useApi()

// Estado local
const popularSeries = ref([])
const isLoadingPopular = ref(false)
const isLoadingMore = ref(false)
const popularError = ref(null)
const currentPopularFilter = ref('all')
const popularPage = ref(1)

// Filtros para series populares
const popularFilters = [
  { label: 'Todas', value: 'all' },
  { label: 'Drama', value: 'drama' },
  { label: 'Comedia', value: 'comedy' },
  { label: 'Acción', value: 'action' },
  { label: 'Sci-Fi', value: 'science-fiction' }
]

// Géneros populares con iconos
const popularGenres = [
  { name: 'Drama', icon: Drama, count: 1200 },
  { name: 'Comedia', icon: Laugh, count: 800 },
  { name: 'Acción', icon: Sword, count: 600 },
  { name: 'Sci-Fi', icon: Rocket, count: 400 },
  { name: 'Thriller', icon: Zap, count: 350 },
  { name: 'Romance', icon: Heart, count: 300 }
]

// Propiedades computadas
const showSearchResults = computed(() => 
  searchQuery.value && searchQuery.value.length >= 2
)

const recentFavorites = computed(() => 
  favorites.value.slice(0, 5)
)

// Métodos
const handleSearch = (query) => {
  console.log('🔍 handleSearch llamado con query:', query)
  if (query && query.length >= 2) {
    console.log('✅ Query válido, ejecutando búsqueda...')
    searchQuery.value = query // Actualizar el searchQuery para mostrar resultados
    executeSearch(query)
  } else {
    console.log('❌ Query inválido o muy corto:', query)
    searchQuery.value = '' // Limpiar si el query es inválido
  }
}

// Datos de prueba para series
const mockSeries = [
  {
    id: 1,
    name: "Breaking Bad",
    summary: "<p>Un profesor de química de secundaria se convierte en fabricante de metanfetaminas.</p>",
    premiered: "2008-01-20",
    ended: "2013-09-29",
    status: "Ended",
    genres: ["Drama", "Crime", "Thriller"],
    rating: { average: 9.5 },
    image: {
      medium: "https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg",
      original: "https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg"
    },
    network: { name: "AMC" }
  },
  {
    id: 2,
    name: "Game of Thrones",
    summary: "<p>Nueve familias nobles luchan por el control del mítico reino de Westeros.</p>",
    premiered: "2011-04-17",
    ended: "2019-05-19",
    status: "Ended",
    genres: ["Drama", "Adventure", "Fantasy"],
    rating: { average: 9.3 },
    image: {
      medium: "https://static.tvmaze.com/uploads/images/medium_portrait/190/476117.jpg",
      original: "https://static.tvmaze.com/uploads/images/original_untouched/190/476117.jpg"
    },
    network: { name: "HBO" }
  },
  {
    id: 3,
    name: "The Office",
    summary: "<p>Una comedia que documenta las aventuras de una empresa de papel en Scranton.</p>",
    premiered: "2005-03-24",
    ended: "2013-05-16",
    status: "Ended",
    genres: ["Comedy"],
    rating: { average: 8.8 },
    image: {
      medium: "https://static.tvmaze.com/uploads/images/medium_portrait/85/213184.jpg",
      original: "https://static.tvmaze.com/uploads/images/original_untouched/85/213184.jpg"
    },
    network: { name: "NBC" }
  },
  {
    id: 4,
    name: "Stranger Things",
    summary: "<p>Un grupo de niños descubre experimentos sobrenaturales en su pequeño pueblo.</p>",
    premiered: "2016-07-15",
    ended: null,
    status: "Running",
    genres: ["Drama", "Fantasy", "Horror"],
    rating: { average: 8.7 },
    image: {
      medium: "https://static.tvmaze.com/uploads/images/medium_portrait/200/501942.jpg",
      original: "https://static.tvmaze.com/uploads/images/original_untouched/200/501942.jpg"
    },
    network: { name: "Netflix" }
  },
  {
    id: 5,
    name: "Friends",
    summary: "<p>Seis amigos navegan por la vida y el amor en Nueva York.</p>",
    premiered: "1994-09-22",
    ended: "2004-05-06",
    status: "Ended",
    genres: ["Comedy", "Romance"],
    rating: { average: 8.9 },
    image: {
      medium: "https://static.tvmaze.com/uploads/images/medium_portrait/0/618.jpg",
      original: "https://static.tvmaze.com/uploads/images/original_untouched/0/618.jpg"
    },
    network: { name: "NBC" }
  },
  {
    id: 6,
    name: "The Mandalorian",
    summary: "<p>Un cazarrecompensas mandaloriano navega por los confines de la galaxia.</p>",
    premiered: "2019-11-12",
    ended: null,
    status: "Running",
    genres: ["Action", "Adventure", "Science-Fiction"],
    rating: { average: 8.6 },
    image: {
      medium: "https://static.tvmaze.com/uploads/images/medium_portrait/202/506077.jpg",
      original: "https://static.tvmaze.com/uploads/images/original_untouched/202/506077.jpg"
    },
    network: { name: "Disney+" }
  },
  {
    id: 7,
    name: "The Crown",
    summary: "<p>La historia de la reina Isabel II y la familia real británica.</p>",
    premiered: "2016-11-04",
    ended: null,
    status: "Running",
    genres: ["Drama", "History"],
    rating: { average: 8.7 },
    image: {
      medium: "https://static.tvmaze.com/uploads/images/medium_portrait/86/215501.jpg",
      original: "https://static.tvmaze.com/uploads/images/original_untouched/86/215501.jpg"
    },
    network: { name: "Netflix" }
  },
  {
    id: 8,
    name: "The Witcher",
    summary: "<p>Un cazador de monstruos lucha por encontrar su lugar en un mundo donde las personas son más malvadas que las bestias.</p>",
    premiered: "2019-12-20",
    ended: null,
    status: "Running",
    genres: ["Drama", "Adventure", "Fantasy"],
    rating: { average: 8.2 },
    image: {
      medium: "https://static.tvmaze.com/uploads/images/medium_portrait/192/481942.jpg",
      original: "https://static.tvmaze.com/uploads/images/original_untouched/192/481942.jpg"
    },
    network: { name: "Netflix" }
  }
]

const loadPopularSeries = async () => {
  console.log('🔄 Iniciando carga de series populares...')
  isLoadingPopular.value = true
  popularError.value = null
  
  try {
    // Usar datos de prueba mientras se soluciona el problema de la API
    console.log('📺 Usando datos de prueba para mostrar series')
    
    // Simular un pequeño delay para mostrar el loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    popularSeries.value = [...mockSeries]
    console.log('✅ Series cargadas exitosamente:', popularSeries.value.length)
    
  } catch (error) {
    popularError.value = 'Error al cargar las series populares'
    console.error('❌ Error loading popular series:', error)
  } finally {
    isLoadingPopular.value = false
  }
}

const loadMorePopular = async () => {
  console.log('🔄 Cargando más series...')
  isLoadingMore.value = true
  
  try {
    // Simular carga de más series duplicando algunas con IDs diferentes
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const moreSeries = mockSeries.slice(0, 4).map(serie => ({
      ...serie,
      id: serie.id + 100,
      name: `${serie.name} (Temporada 2)`
    }))
    
    popularSeries.value = [...popularSeries.value, ...moreSeries]
    console.log('✅ Más series cargadas. Total:', popularSeries.value.length)
    
  } catch (error) {
    console.error('❌ Error loading more series:', error)
  } finally {
    isLoadingMore.value = false
  }
}

const setPopularFilter = async (filter) => {
  if (filter === currentPopularFilter.value) return
  
  currentPopularFilter.value = filter
  popularPage.value = 1
  
  if (filter === 'all') {
    await loadPopularSeries()
  } else {
    isLoadingPopular.value = true
    try {
      const results = await searchShows(filter)
      popularSeries.value = results.slice(0, 20)
    } catch (error) {
      popularError.value = 'Error al filtrar series'
    } finally {
      isLoadingPopular.value = false
    }
  }
}

const getFilterButtonClasses = (filter) => [
  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
  {
    'bg-primary-600 text-white': filter === currentPopularFilter.value,
    'bg-gray-700 text-gray-300 hover:bg-gray-600': filter !== currentPopularFilter.value
  }
]

const searchByGenre = (genre) => {
  searchQuery.value = genre.toLowerCase()
  executeSearch(genre.toLowerCase())
}

const focusSearch = () => {
  // Scroll hacia arriba y enfocar la búsqueda
  window.scrollTo({ top: 0, behavior: 'smooth' })
  // El SearchBar tiene autofocus, así que se enfocará automáticamente
}

// Watchers
watch(searchQuery, (newQuery) => {
  if (!newQuery || newQuery.length < 2) {
    // Si no hay búsqueda, mostrar series populares
  }
})

// Lifecycle
onMounted(() => {
  loadPopularSeries()
})

    // Función de prueba para verificar la API
    const testApiConnection = async () => {
      console.log('🔍 Probando conexión con la API de TVMaze...')
      
      try {
        // Prueba simple con fetch directo
        const response = await fetch('https://api.tvmaze.com/shows/1')
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ API de TVMaze funciona correctamente:', data.name)
          return true
        } else {
          console.log('❌ Error en la respuesta de la API:', response.status)
          return false
        }
      } catch (error) {
        console.log('❌ Error de conexión con la API:', error.message)
        return false
      }
    }

    // Función para probar búsqueda
    const testApiSearch = async () => {
      console.log('🔍 Probando búsqueda en la API...')
      
      try {
        const response = await fetch('https://api.tvmaze.com/search/shows?q=breaking+bad')
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Búsqueda funciona correctamente. Resultados:', data.length)
          return data
        } else {
          console.log('❌ Error en búsqueda:', response.status)
          return []
        }
      } catch (error) {
        console.log('❌ Error en búsqueda:', error.message)
        return []
      }
    }

    // Función para probar navegación a detalles
    const testNavigation = async () => {
      console.log('🧭 Probando navegación a detalles de serie...')
      
      try {
        // Usar la primera serie de los datos de prueba
        const testSerie = mockSeries[0] // Breaking Bad
        console.log('📺 Navegando a detalles de:', testSerie.name)
        
        // Navegar a la página de detalles
        await router.push(`/serie/${testSerie.id}`)
        console.log('✅ Navegación exitosa a /serie/' + testSerie.id)
        
      } catch (error) {
        console.log('❌ Error en navegación:', error.message)
      }
    }
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.genre-card {
  background-image: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.genre-card:hover {
  background-image: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-view section {
  animation: fadeInUp 0.6s ease-out;
}

.home-view section:nth-child(2) {
  animation-delay: 0.1s;
}

.home-view section:nth-child(3) {
  animation-delay: 0.2s;
}

.home-view section:nth-child(4) {
  animation-delay: 0.3s;
}

/* Efectos de parallax sutil */
.hero-section {
  background-attachment: fixed;
}

@media (max-width: 768px) {
  .hero-section {
    background-attachment: scroll;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors,
  .transition-transform {
    transition: none;
  }
  
  .transform,
  .hover\:scale-105 {
    transform: none;
  }
  
  .animate-pulse {
    animation: none;
  }
}

/* Focus states mejorados */
button:focus-visible,
a:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .hero-section {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
  
  .hero-section h1 {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
  
  .hero-section p {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  
  .grid.grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .hidden.md\:flex {
    display: none;
  }
}

/* Optimización de rendimiento */
.genre-card {
  will-change: transform;
}

.hero-section {
  contain: layout style paint;
}

/* Estados de hover mejorados */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:bg-black\/20 {
  background-color: rgba(0, 0, 0, 0.2);
}

/* Backdrop blur para navegadores compatibles */
@supports (backdrop-filter: blur(10px)) {
  .genre-card {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
</style>