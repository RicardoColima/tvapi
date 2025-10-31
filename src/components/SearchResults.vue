<!-- Componente para mostrar resultados de búsqueda con filtros y ordenamiento -->
<template>
  <div class="search-results">
    
    <!-- Header de resultados -->
    <div 
      v-if="hasSearched"
      class="mb-6"
    >
      <!-- Información de resultados -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 class="text-xl font-semibold text-white">
            Resultados de búsqueda
            <span v-if="lastSearchQuery" class="text-primary-400">
              "{{ lastSearchQuery }}"
            </span>
          </h2>
          <p class="text-gray-400 text-sm mt-1">
            {{ resultsText }}
          </p>
        </div>

        <!-- Controles de vista -->
        <div class="flex items-center space-x-3">
          <!-- Selector de ordenamiento -->
          <select
            v-model="sortBy"
            :class="selectClasses"
            @change="handleSortChange"
          >
            <option value="relevance">Relevancia</option>
            <option value="name">Nombre A-Z</option>
            <option value="rating">Mejor valoradas</option>
            <option value="premiered">Más recientes</option>
          </select>

          <!-- Botón de filtros -->
          <button
            @click="toggleFilters"
            :class="filterButtonClasses"
          >
            <Filter :size="16" />
            <span class="hidden sm:inline">Filtros</span>
            <span 
              v-if="activeFiltersCount > 0"
              class="bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1"
            >
              {{ activeFiltersCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Panel de filtros -->
      <div
        v-if="showFilters"
        :class="filtersClasses"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <!-- Filtro por género -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Género
            </label>
            <select
              v-model="selectedGenre"
              :class="selectClasses"
              @change="applyFilters"
            >
              <option value="">Todos los géneros</option>
              <option
                v-for="genre in availableGenres"
                :key="genre"
                :value="genre"
              >
                {{ genre }}
              </option>
            </select>
          </div>

          <!-- Filtro por rating -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Rating mínimo
            </label>
            <select
              v-model="minRating"
              :class="selectClasses"
              @change="applyFilters"
            >
              <option value="">Cualquier rating</option>
              <option value="7">7.0+</option>
              <option value="8">8.0+</option>
              <option value="9">9.0+</option>
            </select>
          </div>

          <!-- Filtro por estado -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              v-model="selectedStatus"
              :class="selectClasses"
              @change="applyFilters"
            >
              <option value="">Todos los estados</option>
              <option value="Running">En emisión</option>
              <option value="Ended">Finalizada</option>
              <option value="To Be Determined">Por determinar</option>
            </select>
          </div>
        </div>

        <!-- Botón para limpiar filtros -->
        <div class="mt-4 flex justify-end">
          <button
            @click="clearFilters"
            class="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Buscando series..." show-text />
    </div>

    <ErrorMessage
      v-else-if="error"
      :message="error"
      :show-retry="true"
      :retry-handler="retrySearch"
      type="network"
    />

    <!-- Mensaje de sin resultados -->
    <div
      v-else-if="isEmpty"
      class="text-center py-12"
    >
      <div class="max-w-md mx-auto">
        <Search :size="48" class="text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-white mb-2">
          No se encontraron resultados
        </h3>
        <p class="text-gray-400 mb-4">
          No encontramos series que coincidan con tu búsqueda
          <span v-if="lastSearchQuery" class="text-primary-400">
            "{{ lastSearchQuery }}"
          </span>
        </p>
        <div class="space-y-2 text-sm text-gray-500">
          <p>• Verifica la ortografía</p>
          <p>• Intenta con términos más generales</p>
          <p>• Prueba con el nombre en inglés</p>
        </div>
      </div>
    </div>

    <!-- Grid de resultados -->
    <div
      v-else-if="hasResults"
      :class="gridClasses"
    >
      <SerieCard
        v-for="serie in displayedResults"
        :key="serie.id"
        :serie="serie"
        :size="cardSize"
        @click="handleSerieClick"
        @favorite-toggle="handleFavoriteToggle"
      />
    </div>

    <!-- Paginación -->
    <div
      v-if="hasResults && totalPages > 1"
      class="mt-8 flex justify-center"
    >
      <nav class="flex items-center space-x-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          :class="paginationButtonClasses"
        >
          <ChevronLeft :size="16" />
          Anterior
        </button>

        <div class="flex items-center space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="getPageButtonClasses(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          :class="paginationButtonClasses"
        >
          Siguiente
          <ChevronRight :size="16" />
        </button>
      </nav>
    </div>

    <!-- Estadísticas de resultados -->
    <div
      v-if="hasResults && showStats"
      class="mt-6 p-4 bg-gray-800 rounded-lg"
    >
      <h4 class="text-sm font-medium text-white mb-3">Estadísticas de búsqueda</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-gray-400">Total:</span>
          <span class="text-white ml-1">{{ searchStats.total }}</span>
        </div>
        <div v-if="searchStats.averageRating > 0">
          <span class="text-gray-400">Rating promedio:</span>
          <span class="text-white ml-1">{{ searchStats.averageRating.toFixed(1) }}</span>
        </div>
        <div v-if="Object.keys(searchStats.byGenre).length > 0">
          <span class="text-gray-400">Género principal:</span>
          <span class="text-white ml-1">{{ topGenre }}</span>
        </div>
        <div v-if="Object.keys(searchStats.byStatus).length > 0">
          <span class="text-gray-400">Estado principal:</span>
          <span class="text-white ml-1">{{ topStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useSearch } from '@/composables/useSearch.js'
import SerieCard from './SerieCard.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorMessage from './ErrorMessage.vue'

// Props del componente
const props = defineProps({
  /**
   * Tamaño de las tarjetas
   * @type {'sm' | 'md' | 'lg'}
   */
  cardSize: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },

  /**
   * Número de resultados por página
   */
  itemsPerPage: {
    type: Number,
    default: 20
  },

  /**
   * Si debe mostrar estadísticas
   */
  showStats: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['serie-click', 'favorite-toggle'])

// Composable de búsqueda
const {
  searchResults,
  isLoading,
  error,
  hasResults,
  isEmpty,
  hasSearched,
  lastSearchQuery,
  resultsCount,
  searchStats,
  filterByGenre,
  filterByRating,
  sortResults,
  searchImmediate
} = useSearch()

// Estado local
const showFilters = ref(false)
const sortBy = ref('relevance')
const selectedGenre = ref('')
const minRating = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)

// Resultados filtrados y ordenados
const filteredResults = computed(() => {
  let results = [...searchResults.value]

  // Aplicar filtros
  if (selectedGenre.value) {
    results = filterByGenre(selectedGenre.value)
  }

  if (minRating.value) {
    results = results.filter(serie => 
      serie.rating?.average && serie.rating.average >= parseFloat(minRating.value)
    )
  }

  if (selectedStatus.value) {
    results = results.filter(serie => serie.status === selectedStatus.value)
  }

  // Aplicar ordenamiento
  return sortResults(results, sortBy.value)
})

// Paginación
const totalPages = computed(() => 
  Math.ceil(filteredResults.value.length / props.itemsPerPage)
)

const displayedResults = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredResults.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }
  
  return pages
})

// Géneros disponibles
const availableGenres = computed(() => {
  const genres = new Set()
  searchResults.value.forEach(serie => {
    if (serie.genres) {
      serie.genres.forEach(genre => genres.add(genre))
    }
  })
  return Array.from(genres).sort()
})

// Contadores
const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedGenre.value) count++
  if (minRating.value) count++
  if (selectedStatus.value) count++
  return count
})

const resultsText = computed(() => {
  const total = filteredResults.value.length
  const showing = displayedResults.value.length
  
  if (total === 0) return 'No se encontraron resultados'
  if (total === showing) return `${total} resultado${total !== 1 ? 's' : ''}`
  
  const start = (currentPage.value - 1) * props.itemsPerPage + 1
  const end = start + showing - 1
  return `Mostrando ${start}-${end} de ${total} resultados`
})

// Estadísticas
const topGenre = computed(() => {
  const genres = searchStats.value.byGenre
  return Object.keys(genres).reduce((a, b) => genres[a] > genres[b] ? a : b, '')
})

const topStatus = computed(() => {
  const statuses = searchStats.value.byStatus
  return Object.keys(statuses).reduce((a, b) => statuses[a] > statuses[b] ? a : b, '')
})

// Clases CSS
const selectClasses = computed(() => [
  'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg',
  'text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
  'transition-colors duration-200'
])

const filterButtonClasses = computed(() => [
  'flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700',
  'rounded-lg text-white text-sm hover:bg-gray-700 transition-colors duration-200',
  {
    'bg-primary-600 border-primary-500': showFilters.value
  }
])

const filtersClasses = computed(() => [
  'p-4 bg-gray-800 border border-gray-700 rounded-lg mb-6',
  'transition-all duration-300'
])

const gridClasses = computed(() => [
  'grid gap-6',
  {
    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6': props.cardSize === 'sm',
    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': props.cardSize === 'md',
    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4': props.cardSize === 'lg'
  }
])

const paginationButtonClasses = computed(() => [
  'flex items-center space-x-1 px-3 py-2 bg-gray-800 border border-gray-700',
  'rounded-lg text-white text-sm hover:bg-gray-700 transition-colors duration-200',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800'
])

const getPageButtonClasses = (page) => [
  'px-3 py-2 text-sm rounded-lg transition-colors duration-200',
  {
    'bg-primary-600 text-white': page === currentPage.value,
    'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white': page !== currentPage.value && page !== '...',
    'text-gray-500 cursor-default': page === '...'
  }
]

// Métodos
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const applyFilters = () => {
  currentPage.value = 1 // Reset a primera página
}

const clearFilters = () => {
  selectedGenre.value = ''
  minRating.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

const handleSortChange = () => {
  currentPage.value = 1 // Reset a primera página
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll al top de resultados
    document.querySelector('.search-results')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }
}

const handleSerieClick = (serie) => {
  emit('serie-click', serie)
}

const handleFavoriteToggle = (data) => {
  emit('favorite-toggle', data)
}

const retrySearch = () => {
  if (lastSearchQuery.value) {
    searchImmediate(lastSearchQuery.value)
  }
}

// Watchers
watch(() => searchResults.value, () => {
  currentPage.value = 1 // Reset página al cambiar resultados
})

watch(() => filteredResults.value.length, () => {
  // Ajustar página actual si es necesaria
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})
</script>

<style scoped>
/* Animaciones para filtros */
.filters-enter-active,
.filters-leave-active {
  transition: all 0.3s ease;
}

.filters-enter-from,
.filters-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Grid responsive mejorado */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors {
    transition: none;
  }
}

/* Focus visible mejorado */
button:focus-visible,
select:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Estilos para paginación */
.pagination-enter-active,
.pagination-leave-active {
  transition: all 0.3s ease;
}

.pagination-enter-from,
.pagination-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Modo oscuro adicional */
@media (prefers-color-scheme: dark) {
  .bg-gray-800 {
    background-color: #111827;
  }
  
  .border-gray-700 {
    border-color: #4b5563;
  }
}
</style>