<!-- Vista de series favoritas del usuario -->
<template>
  <AppLayout>
    <div class="favorites-view">
      
      <!-- Header -->
      <section class="header-section bg-gradient-to-r from-primary-900 to-accent-900 py-12">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Heart :size="32" />
                Mis Favoritos
              </h1>
              <p class="text-gray-300">
                {{ favoritesCount }} {{ favoritesCount === 1 ? 'serie favorita' : 'series favoritas' }}
              </p>
            </div>
            
            <!-- Estadísticas rápidas -->
            <div 
              v-if="favoritesCount > 0"
              class="hidden md:flex items-center gap-6 text-sm"
            >
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ favoritesCount }}</div>
                <div class="text-gray-400">Series</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ uniqueGenres }}</div>
                <div class="text-gray-400">Géneros</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ averageRating }}</div>
                <div class="text-gray-400">Rating promedio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contenido principal -->
      <section class="main-content py-8">
        <div class="container mx-auto px-4">
          
          <!-- Estado vacío -->
          <div 
            v-if="favoritesCount === 0"
            class="empty-state text-center py-16"
          >
            <div class="max-w-md mx-auto">
              <Heart :size="64" class="mx-auto mb-6 text-gray-600" />
              <h2 class="text-2xl font-bold text-white mb-4">
                No tienes favoritos aún
              </h2>
              <p class="text-gray-400 mb-8">
                Explora series y agrega las que más te gusten a tu lista de favoritos
              </p>
              <router-link
                to="/"
                class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
              >
                <Search :size="20" />
                Explorar Series
              </router-link>
            </div>
          </div>

          <!-- Controles y filtros -->
          <div 
            v-else
            class="controls-section mb-8"
          >
            <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              
              <!-- Búsqueda en favoritos -->
              <div class="flex-1 max-w-md">
                <div class="relative">
                  <Search :size="20" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Buscar en favoritos..."
                    class="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </div>

              <!-- Filtros y ordenamiento -->
              <div class="flex items-center gap-4">
                
                <!-- Filtro por género -->
                <select
                  v-model="selectedGenre"
                  class="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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

                <!-- Ordenamiento -->
                <select
                  v-model="sortBy"
                  class="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="dateAdded">Fecha agregado</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="rating">Calificación</option>
                  <option value="premiered">Año de estreno</option>
                </select>

                <!-- Vista -->
                <div class="flex items-center bg-gray-800 rounded-lg p-1">
                  <button
                    @click="viewMode = 'grid'"
                    :class="getViewButtonClasses('grid')"
                  >
                    <Grid3X3 :size="16" />
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="getViewButtonClasses('list')"
                  >
                    <List :size="16" />
                  </button>
                </div>

                <!-- Acciones -->
                <div class="relative">
                  <button
                    @click="showActionsMenu = !showActionsMenu"
                    class="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <MoreVertical :size="16" />
                  </button>
                  
                  <!-- Menú de acciones -->
                  <div
                    v-if="showActionsMenu"
                    class="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10"
                  >
                    <button
                      @click="exportFavorites"
                      class="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <Download :size="16" />
                      Exportar favoritos
                    </button>
                    <button
                      @click="showImportDialog = true"
                      class="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <Upload :size="16" />
                      Importar favoritos
                    </button>
                    <hr class="border-gray-700 my-1" />
                    <button
                      @click="showClearDialog = true"
                      class="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <Trash2 :size="16" />
                      Limpiar favoritos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de favoritos -->
          <div 
            v-if="filteredFavorites.length > 0"
            class="favorites-grid"
          >
            
            <!-- Vista en grid -->
            <div 
              v-if="viewMode === 'grid'"
              class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              <SerieCard
                v-for="serie in paginatedFavorites"
                :key="serie.id"
                :serie="serie"
                size="md"
                :show-summary="false"
              />
            </div>

            <!-- Vista en lista -->
            <div 
              v-else
              class="space-y-4"
            >
              <div
                v-for="serie in paginatedFavorites"
                :key="serie.id"
                class="favorite-item bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors duration-200"
              >
                <div class="flex items-center gap-4">
                  
                  <!-- Imagen -->
                  <router-link
                    :to="`/serie/${serie.id}`"
                    class="flex-shrink-0"
                  >
                    <img
                      v-if="serie.image?.medium"
                      :src="serie.image.medium"
                      :alt="serie.name"
                      class="w-16 h-24 object-cover rounded-lg"
                    />
                    <div 
                      v-else
                      class="w-16 h-24 bg-gray-700 rounded-lg flex items-center justify-center"
                    >
                      <ImageIcon :size="24" class="text-gray-500" />
                    </div>
                  </router-link>

                  <!-- Información -->
                  <div class="flex-1 min-w-0">
                    <router-link
                      :to="`/serie/${serie.id}`"
                      class="block"
                    >
                      <h3 class="text-lg font-semibold text-white hover:text-primary-400 transition-colors duration-200 truncate">
                        {{ serie.name }}
                      </h3>
                    </router-link>
                    
                    <div class="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span v-if="serie.premiered">{{ serie.premiered.split('-')[0] }}</span>
                      <span v-if="serie.status">{{ formatStatus(serie.status) }}</span>
                      <span 
                        v-if="serie.rating?.average"
                        class="flex items-center gap-1"
                      >
                        <Star :size="14" class="text-yellow-400 fill-current" />
                        {{ serie.rating.average.toFixed(1) }}
                      </span>
                    </div>

                    <div 
                      v-if="serie.genres?.length"
                      class="flex flex-wrap gap-1 mt-2"
                    >
                      <span
                        v-for="genre in serie.genres.slice(0, 3)"
                        :key="genre"
                        class="px-2 py-1 bg-primary-600/20 text-primary-300 rounded text-xs"
                      >
                        {{ genre }}
                      </span>
                    </div>
                  </div>

                  <!-- Acciones -->
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">
                      {{ formatDateAdded(serie.dateAdded) }}
                    </span>
                    <button
                      @click="removeFavorite(serie.id)"
                      class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                      :aria-label="`Quitar ${serie.name} de favoritos`"
                    >
                      <Heart :size="16" class="fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado de búsqueda sin resultados -->
          <div 
            v-else-if="searchQuery && favoritesCount > 0"
            class="no-results text-center py-12"
          >
            <Search :size="48" class="mx-auto mb-4 text-gray-600" />
            <h3 class="text-xl font-semibold text-white mb-2">
              No se encontraron resultados
            </h3>
            <p class="text-gray-400">
              No hay favoritos que coincidan con "{{ searchQuery }}"
            </p>
            <button
              @click="searchQuery = ''"
              class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
            >
              Limpiar búsqueda
            </button>
          </div>

          <!-- Paginación -->
          <div 
            v-if="totalPages > 1"
            class="pagination flex justify-center items-center gap-2 mt-8"
          >
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              <ChevronLeft :size="16" />
            </button>
            
            <span class="px-4 py-2 text-gray-400">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Diálogos -->
    <!-- Diálogo de confirmación para limpiar favoritos -->
    <div
      v-if="showClearDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="showClearDialog = false"
    >
      <div
        class="bg-gray-800 rounded-lg p-6 max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-white mb-4">
          ¿Limpiar todos los favoritos?
        </h3>
        <p class="text-gray-400 mb-6">
          Esta acción eliminará todas las series de tu lista de favoritos. No se puede deshacer.
        </p>
        <div class="flex gap-3">
          <button
            @click="showClearDialog = false"
            class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            @click="confirmClearFavorites"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Diálogo de importación -->
    <div
      v-if="showImportDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="showImportDialog = false"
    >
      <div
        class="bg-gray-800 rounded-lg p-6 max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-white mb-4">
          Importar Favoritos
        </h3>
        <p class="text-gray-400 mb-4">
          Selecciona un archivo JSON con tus favoritos exportados
        </p>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileImport"
          class="w-full mb-4 text-white"
        />
        <div class="flex gap-3">
          <button
            @click="showImportDialog = false"
            class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Heart,
  Search,
  X,
  Grid3X3,
  List,
  MoreVertical,
  Download,
  Upload,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ImageIcon
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import SerieCard from '@/components/SerieCard.vue'

import { useFavorites } from '@/composables/useFavorites.js'
import { formatStatus } from '@/utils/formatters.js'

// Composables
const { 
  favorites, 
  favoritesCount, 
  removeFavorite, 
  clearFavorites, 
  exportFavorites: exportFavs, 
  importFavorites,
  searchFavorites,
  sortFavorites
} = useFavorites()

// Estado local
const searchQuery = ref('')
const selectedGenre = ref('')
const sortBy = ref('dateAdded')
const viewMode = ref('grid')
const currentPage = ref(1)
const itemsPerPage = 20
const showActionsMenu = ref(false)
const showClearDialog = ref(false)
const showImportDialog = ref(false)
const fileInput = ref(null)

// Propiedades computadas
const availableGenres = computed(() => {
  const genres = new Set()
  favorites.value.forEach(serie => {
    if (serie.genres) {
      serie.genres.forEach(genre => genres.add(genre))
    }
  })
  return Array.from(genres).sort()
})

const uniqueGenres = computed(() => availableGenres.value.length)

const averageRating = computed(() => {
  const ratingsSum = favorites.value
    .filter(serie => serie.rating?.average)
    .reduce((sum, serie) => sum + serie.rating.average, 0)
  
  const ratingsCount = favorites.value.filter(serie => serie.rating?.average).length
  
  return ratingsCount > 0 ? (ratingsSum / ratingsCount).toFixed(1) : '0.0'
})

const filteredFavorites = computed(() => {
  let filtered = [...favorites.value]

  // Filtrar por búsqueda
  if (searchQuery.value) {
    filtered = searchFavorites(searchQuery.value)
  }

  // Filtrar por género
  if (selectedGenre.value) {
    filtered = filtered.filter(serie => 
      serie.genres?.includes(selectedGenre.value)
    )
  }

  // Ordenar
  filtered = sortFavorites(filtered, sortBy.value)

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredFavorites.value.length / itemsPerPage)
)

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredFavorites.value.slice(start, end)
})

// Métodos
const getViewButtonClasses = (mode) => [
  'p-2 rounded transition-colors duration-200',
  {
    'bg-primary-600 text-white': viewMode.value === mode,
    'text-gray-400 hover:text-white': viewMode.value !== mode
  }
]

const formatDateAdded = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`
  if (diffDays < 365) return `Hace ${Math.ceil(diffDays / 30)} meses`
  
  return `Hace ${Math.ceil(diffDays / 365)} años`
}

const confirmClearFavorites = () => {
  clearFavorites()
  showClearDialog.value = false
  showActionsMenu.value = false
}

const exportFavorites = () => {
  exportFavs()
  showActionsMenu.value = false
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      importFavorites(data)
      showImportDialog.value = false
    } catch (error) {
      console.error('Error importing favorites:', error)
      // Aquí podrías mostrar un toast de error
    }
  }
  reader.readAsText(file)
}

const handleClickOutside = (event) => {
  if (showActionsMenu.value && !event.target.closest('.relative')) {
    showActionsMenu.value = false
  }
}

// Watchers
watch([searchQuery, selectedGenre, sortBy], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.favorite-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.favorite-item:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.favorites-grid {
  animation: fadeInUp 0.6s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .controls-section .flex {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls-section .flex > div:last-child {
    justify-content: flex-start;
  }
  
  .grid.grid-cols-2.md\:grid-cols-3.lg\:grid-cols-4.xl\:grid-cols-5 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .favorite-item .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .favorite-item .flex > div:last-child {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-colors,
  .transition-all {
    transition: none;
  }
  
  .favorites-grid {
    animation: none;
  }
}

/* Focus states */
button:focus-visible,
select:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Estados de hover mejorados */
.favorite-item:hover h3 {
  color: theme('colors.primary.400');
}

/* Scrollbar personalizado para el menú de acciones */
.absolute.right-0 {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.absolute.right-0::-webkit-scrollbar {
  width: 6px;
}

.absolute.right-0::-webkit-scrollbar-track {
  background: transparent;
}

.absolute.right-0::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

/* Optimización de rendimiento */
.favorites-grid {
  contain: layout style paint;
}

.favorite-item {
  contain: layout style;
}
</style>