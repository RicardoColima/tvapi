<!-- Vista de detalle de una serie específica -->
<template>
  <AppLayout>
    <div class="serie-detail-view">
      
      <!-- Loading state -->
      <div 
        v-if="isLoading"
        class="loading-container min-h-screen flex items-center justify-center"
      >
        <div class="text-center">
          <LoadingSpinner size="lg" />
          <p class="text-gray-400 mt-4">Cargando información de la serie...</p>
        </div>
      </div>

      <!-- Error state -->
      <div 
        v-else-if="error"
        class="error-container min-h-screen flex items-center justify-center"
      >
        <ErrorMessage
          type="error"
          title="Error al cargar la serie"
          :message="error"
          @retry="loadSerieData"
        >
          <template #actions>
            <button
              @click="goBack"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              Volver atrás
            </button>
          </template>
        </ErrorMessage>
      </div>

      <!-- Content -->
      <div v-else-if="currentSerie">
        
        <!-- Hero Section -->
        <SerieHero :serie="currentSerie" />

        <!-- Navigation tabs -->
        <div class="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-sm border-b border-gray-700">
          <div class="container mx-auto px-4">
            <nav class="flex space-x-8 overflow-x-auto">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="getTabClasses(tab.id)"
                class="flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200"
              >
                <component :is="tab.icon" :size="16" />
                {{ tab.label }}
                <span 
                  v-if="tab.count !== undefined"
                  class="ml-1 px-2 py-1 bg-gray-700 text-xs rounded-full"
                >
                  {{ tab.count }}
                </span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Tab content -->
        <div class="container mx-auto px-4 py-8">
          
          <!-- Información general -->
          <div 
            v-if="activeTab === 'overview'"
            class="tab-content"
          >
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <!-- Información principal -->
              <div class="lg:col-span-2 space-y-8">
                
                <!-- Resumen -->
                <section v-if="currentSerie.summary">
                  <h2 class="text-2xl font-bold text-white mb-4">Sinopsis</h2>
                  <div class="prose prose-invert max-w-none">
                    <p class="text-gray-300 leading-relaxed text-lg">
                      {{ cleanSummary(currentSerie.summary) }}
                    </p>
                  </div>
                </section>

                <!-- Información adicional -->
                <SerieDetail
                  :serie="currentSerie"
                  :seasons="seasons"
                  :episodes="episodes"
                  :cast="cast"
                />
              </div>

              <!-- Sidebar con información rápida -->
              <div class="space-y-6">
                
                <!-- Datos rápidos -->
                <div class="bg-gray-800/50 rounded-lg p-6">
                  <h3 class="text-lg font-semibold text-white mb-4">Información</h3>
                  <div class="space-y-3 text-sm">
                    <div v-if="currentSerie.status">
                      <span class="text-gray-400">Estado:</span>
                      <span class="text-white ml-2">{{ formatStatus(currentSerie.status) }}</span>
                    </div>
                    <div v-if="currentSerie.premiered">
                      <span class="text-gray-400">Estreno:</span>
                      <span class="text-white ml-2">{{ formatPremiered(currentSerie.premiered) }}</span>
                    </div>
                    <div v-if="currentSerie.network?.name">
                      <span class="text-gray-400">Cadena:</span>
                      <span class="text-white ml-2">{{ currentSerie.network.name }}</span>
                    </div>
                    <div v-if="currentSerie.genres?.length">
                      <span class="text-gray-400">Géneros:</span>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span
                          v-for="genre in currentSerie.genres"
                          :key="genre"
                          class="px-2 py-1 bg-primary-600/20 text-primary-300 rounded text-xs"
                        >
                          {{ genre }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Rating -->
                <div 
                  v-if="currentSerie.rating?.average"
                  class="bg-gray-800/50 rounded-lg p-6"
                >
                  <h3 class="text-lg font-semibold text-white mb-4">Calificación</h3>
                  <div class="text-center">
                    <div class="text-4xl font-bold text-white mb-2">
                      {{ currentSerie.rating.average.toFixed(1) }}
                    </div>
                    <div class="flex justify-center mb-2">
                      <Star 
                        v-for="star in 5"
                        :key="star"
                        :size="20"
                        :class="getStarClass(star)"
                      />
                    </div>
                    <p class="text-gray-400 text-sm">Basado en TVMaze</p>
                  </div>
                </div>

                <!-- Series relacionadas -->
                <div 
                  v-if="relatedSeries.length > 0"
                  class="bg-gray-800/50 rounded-lg p-6"
                >
                  <h3 class="text-lg font-semibold text-white mb-4">Series Similares</h3>
                  <div class="space-y-3">
                    <router-link
                      v-for="serie in relatedSeries.slice(0, 3)"
                      :key="serie.id"
                      :to="`/serie/${serie.id}`"
                      class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <img
                        v-if="serie.image?.medium"
                        :src="serie.image.medium"
                        :alt="serie.name"
                        class="w-12 h-16 object-cover rounded"
                      />
                      <div class="flex-1 min-w-0">
                        <h4 class="text-white font-medium text-sm truncate">{{ serie.name }}</h4>
                        <p class="text-gray-400 text-xs">{{ serie.premiered?.split('-')[0] }}</p>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Episodios -->
          <div 
            v-if="activeTab === 'episodes'"
            class="tab-content"
          >
            <div 
              v-if="isLoadingEpisodes"
              class="text-center py-12"
            >
              <LoadingSpinner size="lg" />
              <p class="text-gray-400 mt-4">Cargando episodios...</p>
            </div>
            
            <div v-else-if="episodes.length > 0">
              <SerieDetail
                :serie="currentSerie"
                :seasons="seasons"
                :episodes="episodes"
                :cast="[]"
              />
            </div>
            
            <div 
              v-else
              class="text-center py-12 text-gray-400"
            >
              <Calendar :size="48" class="mx-auto mb-4 opacity-50" />
              <p>No hay información de episodios disponible</p>
            </div>
          </div>

          <!-- Reparto -->
          <div 
            v-if="activeTab === 'cast'"
            class="tab-content"
          >
            <div 
              v-if="isLoadingCast"
              class="text-center py-12"
            >
              <LoadingSpinner size="lg" />
              <p class="text-gray-400 mt-4">Cargando reparto...</p>
            </div>
            
            <div v-else-if="cast.length > 0">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                <div
                  v-for="member in cast"
                  :key="member.person.id"
                  class="cast-member text-center group cursor-pointer"
                >
                  <div class="aspect-square bg-gray-700 rounded-lg overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-200">
                    <img
                      v-if="member.person.image?.medium"
                      :src="member.person.image.medium"
                      :alt="member.person.name"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div 
                      v-else
                      class="w-full h-full flex items-center justify-center"
                    >
                      <User :size="32" class="text-gray-500" />
                    </div>
                  </div>
                  
                  <h3 class="text-white font-medium text-sm mb-1">
                    {{ member.person.name }}
                  </h3>
                  <p class="text-gray-400 text-xs">
                    {{ member.character.name }}
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              v-else
              class="text-center py-12 text-gray-400"
            >
              <Users :size="48" class="mx-auto mb-4 opacity-50" />
              <p>No hay información del reparto disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Info,
  Calendar,
  Users,
  Star,
  User,
  ExternalLink
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import SerieHero from '@/components/SerieHero.vue'
import SerieDetail from '@/components/SerieDetail.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

import { useApi } from '@/composables/useApi.js'
import { 
  formatStatus, 
  formatPremiered, 
  cleanSummary 
} from '@/utils/formatters.js'

// Router
const route = useRoute()
const router = useRouter()

// Composables
const { 
  currentSerie, 
  isLoading, 
  error, 
  getShowDetails,
  getShowEpisodes,
  getShowCast,
  searchShows
} = useApi()

// Estado local
const activeTab = ref('overview')
const episodes = ref([])
const seasons = ref([])
const cast = ref([])
const relatedSeries = ref([])
const isLoadingEpisodes = ref(false)
const isLoadingCast = ref(false)

// Configuración de tabs
const tabs = computed(() => [
  {
    id: 'overview',
    label: 'Información',
    icon: Info
  },
  {
    id: 'episodes',
    label: 'Episodios',
    icon: Calendar,
    count: episodes.value.length || undefined
  },
  {
    id: 'cast',
    label: 'Reparto',
    icon: Users,
    count: cast.value.length || undefined
  }
])

// Métodos
const loadSerieData = async () => {
  const serieId = route.params.id
  
  if (!serieId) {
    router.push('/')
    return
  }

  try {
    // Cargar datos básicos de la serie
    await getShowDetails(serieId)
    
    // Cargar datos adicionales en paralelo
    await Promise.all([
      loadEpisodes(serieId),
      loadCast(serieId),
      loadRelatedSeries()
    ])
  } catch (err) {
    console.error('Error loading serie data:', err)
  }
}

const loadEpisodes = async (serieId) => {
  isLoadingEpisodes.value = true
  
  try {
    const episodeData = await getShowEpisodes(serieId)
    episodes.value = episodeData
    
    // Extraer información de temporadas
    const seasonMap = new Map()
    episodeData.forEach(episode => {
      if (!seasonMap.has(episode.season)) {
        seasonMap.set(episode.season, {
          number: episode.season,
          episodes: [],
          episodeOrder: 0
        })
      }
      seasonMap.get(episode.season).episodes.push(episode)
      seasonMap.get(episode.season).episodeOrder++
    })
    
    seasons.value = Array.from(seasonMap.values()).sort((a, b) => a.number - b.number)
  } catch (err) {
    console.error('Error loading episodes:', err)
  } finally {
    isLoadingEpisodes.value = false
  }
}

const loadCast = async (serieId) => {
  isLoadingCast.value = true
  
  try {
    const castData = await getShowCast(serieId)
    cast.value = castData
  } catch (err) {
    console.error('Error loading cast:', err)
  } finally {
    isLoadingCast.value = false
  }
}

const loadRelatedSeries = async () => {
  if (!currentSerie.value?.genres?.length) return
  
  try {
    // Buscar series del mismo género
    const genre = currentSerie.value.genres[0].toLowerCase()
    const results = await searchShows(genre)
    
    // Filtrar la serie actual y tomar las primeras 5
    relatedSeries.value = results
      .filter(serie => serie.id !== currentSerie.value.id)
      .slice(0, 5)
  } catch (err) {
    console.error('Error loading related series:', err)
  }
}

const getTabClasses = (tabId) => [
  'border-b-2 transition-colors duration-200',
  {
    'text-primary-400 border-primary-400': activeTab.value === tabId,
    'text-gray-400 border-transparent hover:text-white': activeTab.value !== tabId
  }
]

const getStarClass = (starNumber) => {
  if (!currentSerie.value?.rating?.average) return 'text-gray-600'
  
  const rating = currentSerie.value.rating.average / 2 // Convertir de 10 a 5 estrellas
  
  if (starNumber <= Math.floor(rating)) {
    return 'text-yellow-400 fill-current'
  } else if (starNumber === Math.ceil(rating) && rating % 1 !== 0) {
    return 'text-yellow-400 fill-current opacity-50'
  } else {
    return 'text-gray-600'
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// Watchers
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadSerieData()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  // Los datos se cargan en el watcher
})
</script>

<style scoped>
.tab-content {
  animation: fadeInUp 0.4s ease-out;
}

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

/* Sticky navigation */
.sticky {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Scroll horizontal para tabs en móvil */
nav {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

nav::-webkit-scrollbar {
  display: none;
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-colors,
  .transition-transform {
    transition: none;
  }
  
  .group-hover\:scale-105 {
    transform: none;
  }
  
  .tab-content {
    animation: none;
  }
}

/* Focus states */
button:focus-visible,
a:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .grid.grid-cols-1.lg\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .grid.grid-cols-2.md\:grid-cols-3.lg\:grid-cols-4.xl\:grid-cols-6 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  nav {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

/* Estados de hover mejorados */
.cast-member:hover {
  transform: translateY(-2px);
}

.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Optimización de rendimiento */
.cast-member {
  will-change: transform;
}

.sticky {
  will-change: backdrop-filter;
}

/* Backdrop blur para navegadores compatibles */
@supports (backdrop-filter: blur(8px)) {
  .sticky {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}
</style>