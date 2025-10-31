<!-- Componente para mostrar información detallada de una serie -->
<template>
  <div class="serie-detail space-y-8">
    
    <!-- Sección de temporadas y episodios -->
    <section 
      v-if="seasons.length > 0"
      class="seasons-section"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar :size="24" />
          Temporadas y Episodios
        </h2>
        
        <!-- Selector de temporada -->
        <div class="flex items-center gap-2">
          <label for="season-select" class="text-gray-400 text-sm">
            Temporada:
          </label>
          <select
            id="season-select"
            v-model="selectedSeason"
            class="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option 
              v-for="season in seasons"
              :key="season.number"
              :value="season.number"
            >
              Temporada {{ season.number }} ({{ season.episodeOrder || season.episodes?.length || 0 }} episodios)
            </option>
          </select>
        </div>
      </div>

      <!-- Lista de episodios -->
      <div 
        v-if="selectedSeasonData"
        class="space-y-4"
      >
        <div 
          v-for="episode in selectedSeasonEpisodes"
          :key="episode.id"
          class="episode-card bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors duration-200"
        >
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <!-- Imagen del episodio -->
            <div class="md:col-span-3">
              <div class="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                <img
                  v-if="episode.image?.medium"
                  :src="episode.image.medium"
                  :alt="`Episodio ${episode.number}: ${episode.name}`"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div 
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <Play :size="32" class="text-gray-500" />
                </div>
              </div>
            </div>

            <!-- Información del episodio -->
            <div class="md:col-span-9 space-y-2">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-white">
                    {{ episode.number }}. {{ episode.name }}
                  </h3>
                  <div class="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span v-if="episode.airdate">
                      {{ formatEpisodeDate(episode.airdate) }}
                    </span>
                    <span v-if="episode.runtime">
                      {{ episode.runtime }} min
                    </span>
                    <span 
                      v-if="episode.rating?.average"
                      class="flex items-center gap-1"
                    >
                      <Star :size="14" class="text-yellow-400 fill-current" />
                      {{ episode.rating.average.toFixed(1) }}
                    </span>
                  </div>
                </div>
                
                <!-- Estado del episodio -->
                <span 
                  v-if="getEpisodeStatus(episode)"
                  :class="getEpisodeStatusClasses(episode)"
                >
                  {{ getEpisodeStatus(episode) }}
                </span>
              </div>

              <!-- Resumen del episodio -->
              <p 
                v-if="episode.summary"
                class="text-gray-300 text-sm leading-relaxed"
              >
                {{ cleanSummary(episode.summary) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Mensaje si no hay episodios -->
        <div 
          v-if="selectedSeasonEpisodes.length === 0"
          class="text-center py-8 text-gray-400"
        >
          <Calendar :size="48" class="mx-auto mb-4 opacity-50" />
          <p>No hay episodios disponibles para esta temporada</p>
        </div>
      </div>
    </section>

    <!-- Sección de reparto -->
    <section 
      v-if="cast.length > 0"
      class="cast-section"
    >
      <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Users :size="24" />
        Reparto Principal
      </h2>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div
          v-for="member in cast.slice(0, 12)"
          :key="member.person.id"
          class="cast-member text-center group"
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

      <!-- Botón para ver más reparto -->
      <div 
        v-if="cast.length > 12"
        class="text-center mt-6"
      >
        <button
          @click="showAllCast = !showAllCast"
          class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          {{ showAllCast ? 'Ver menos' : `Ver todos (${cast.length})` }}
        </button>
      </div>
    </section>

    <!-- Sección de información adicional -->
    <section class="additional-info">
      <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Info :size="24" />
        Información Adicional
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Información de producción -->
        <div class="info-card bg-gray-800/50 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building :size="20" />
            Producción
          </h3>
          <div class="space-y-3 text-sm">
            <div v-if="serie.network">
              <span class="text-gray-400">Cadena:</span>
              <span class="text-white ml-2">{{ serie.network.name }}</span>
            </div>
            <div v-if="serie.webChannel">
              <span class="text-gray-400">Plataforma:</span>
              <span class="text-white ml-2">{{ serie.webChannel.name }}</span>
            </div>
            <div v-if="serie.network?.country">
              <span class="text-gray-400">País:</span>
              <span class="text-white ml-2">{{ serie.network.country.name }}</span>
            </div>
            <div v-if="serie.language">
              <span class="text-gray-400">Idioma:</span>
              <span class="text-white ml-2">{{ formatLanguage(serie.language) }}</span>
            </div>
          </div>
        </div>

        <!-- Información de emisión -->
        <div class="info-card bg-gray-800/50 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock :size="20" />
            Emisión
          </h3>
          <div class="space-y-3 text-sm">
            <div v-if="serie.premiered">
              <span class="text-gray-400">Estreno:</span>
              <span class="text-white ml-2">{{ formatPremiered(serie.premiered) }}</span>
            </div>
            <div v-if="serie.ended">
              <span class="text-gray-400">Final:</span>
              <span class="text-white ml-2">{{ formatPremiered(serie.ended) }}</span>
            </div>
            <div v-if="serie.status">
              <span class="text-gray-400">Estado:</span>
              <span class="text-white ml-2">{{ formatStatus(serie.status) }}</span>
            </div>
            <div v-if="serie.schedule?.time">
              <span class="text-gray-400">Horario:</span>
              <span class="text-white ml-2">{{ serie.schedule.time }}</span>
            </div>
            <div v-if="serie.schedule?.days?.length">
              <span class="text-gray-400">Días:</span>
              <span class="text-white ml-2">{{ serie.schedule.days.join(', ') }}</span>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="info-card bg-gray-800/50 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 :size="20" />
            Estadísticas
          </h3>
          <div class="space-y-3 text-sm">
            <div v-if="serie.rating?.average">
              <span class="text-gray-400">Calificación:</span>
              <span class="text-white ml-2">{{ serie.rating.average }}/10</span>
            </div>
            <div v-if="serie.weight">
              <span class="text-gray-400">Popularidad:</span>
              <span class="text-white ml-2">{{ serie.weight }}%</span>
            </div>
            <div v-if="totalEpisodes">
              <span class="text-gray-400">Episodios:</span>
              <span class="text-white ml-2">{{ totalEpisodes }}</span>
            </div>
            <div v-if="serie.runtime">
              <span class="text-gray-400">Duración:</span>
              <span class="text-white ml-2">{{ serie.runtime }} min</span>
            </div>
            <div v-if="serie.averageRuntime">
              <span class="text-gray-400">Duración promedio:</span>
              <span class="text-white ml-2">{{ serie.averageRuntime }} min</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Enlaces externos -->
    <section 
      v-if="hasExternalLinks"
      class="external-links"
    >
      <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <ExternalLink :size="24" />
        Enlaces Externos
      </h2>
      
      <div class="flex flex-wrap gap-4">
        <a
          v-if="serie.officialSite"
          :href="serie.officialSite"
          target="_blank"
          rel="noopener noreferrer"
          class="external-link"
        >
          <Globe :size="20" />
          Sitio Oficial
        </a>
        
        <a
          v-if="serie.externals?.imdb"
          :href="`https://www.imdb.com/title/${serie.externals.imdb}`"
          target="_blank"
          rel="noopener noreferrer"
          class="external-link"
        >
          <ExternalLink :size="20" />
          IMDb
        </a>
        
        <a
          v-if="serie.externals?.thetvdb"
          :href="`https://thetvdb.com/?tab=series&id=${serie.externals.thetvdb}`"
          target="_blank"
          rel="noopener noreferrer"
          class="external-link"
        >
          <Database :size="20" />
          TheTVDB
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Calendar,
  Users,
  Info,
  Building,
  Clock,
  BarChart3,
  ExternalLink,
  Globe,
  Database,
  Star,
  Play,
  User
} from 'lucide-vue-next'
import { 
  formatStatus, 
  formatLanguage, 
  formatPremiered, 
  cleanSummary 
} from '@/utils/formatters.js'

// Props
const props = defineProps({
  /**
   * Datos de la serie
   */
  serie: {
    type: Object,
    required: true
  },

  /**
   * Temporadas de la serie
   */
  seasons: {
    type: Array,
    default: () => []
  },

  /**
   * Episodios de la serie
   */
  episodes: {
    type: Array,
    default: () => []
  },

  /**
   * Reparto de la serie
   */
  cast: {
    type: Array,
    default: () => []
  }
})

// Estado local
const selectedSeason = ref(1)
const showAllCast = ref(false)

// Propiedades computadas
const selectedSeasonData = computed(() => 
  props.seasons.find(season => season.number === selectedSeason.value)
)

const selectedSeasonEpisodes = computed(() => 
  props.episodes.filter(episode => episode.season === selectedSeason.value)
)

const totalEpisodes = computed(() => 
  props.episodes.length
)

const hasExternalLinks = computed(() => 
  props.serie.officialSite || 
  props.serie.externals?.imdb || 
  props.serie.externals?.thetvdb
)

// Métodos
const formatEpisodeDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getEpisodeStatus = (episode) => {
  if (!episode.airdate) return null
  
  const today = new Date()
  const airDate = new Date(episode.airdate)
  
  if (airDate > today) {
    return 'Próximamente'
  } else if (airDate.toDateString() === today.toDateString()) {
    return 'Hoy'
  }
  
  return null
}

const getEpisodeStatusClasses = (episode) => {
  const status = getEpisodeStatus(episode)
  
  switch (status) {
    case 'Próximamente':
      return 'px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs'
    case 'Hoy':
      return 'px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs'
    default:
      return ''
  }
}

// Watchers
watch(() => props.seasons, (newSeasons) => {
  if (newSeasons.length > 0 && !newSeasons.find(s => s.number === selectedSeason.value)) {
    selectedSeason.value = newSeasons[0].number
  }
}, { immediate: true })
</script>

<style scoped>
.external-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #374151;
  color: white;
  border-radius: 0.5rem;
  transition: colors 200ms;
}

.external-link:hover {
  background-color: #4b5563;
}

.cast-member {
  cursor: pointer;
}

.episode-card {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.episode-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
}

.info-card {
  border: 1px solid rgba(75, 85, 99, 0.3);
  transition: all 0.2s ease;
}

.info-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  background-color: rgba(31, 41, 55, 0.7);
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

.serie-detail > section {
  animation: fadeInUp 0.6s ease-out;
}

.serie-detail > section:nth-child(2) {
  animation-delay: 0.1s;
}

.serie-detail > section:nth-child(3) {
  animation-delay: 0.2s;
}

.serie-detail > section:nth-child(4) {
  animation-delay: 0.3s;
}

/* Responsive */
@media (max-width: 768px) {
  .episode-card .grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .info-card {
    padding: 1rem;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-transform,
  .transition-colors {
    transition: none;
  }
  
  .group-hover\:scale-105 {
    transform: none;
  }
}

/* Focus states */
select:focus,
button:focus,
a:focus {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Scrollbar personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>