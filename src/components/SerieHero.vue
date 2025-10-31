<!-- Componente hero para mostrar información destacada de una serie -->
<template>
  <div class="serie-hero relative overflow-hidden">
    
    <!-- Imagen de fondo con gradiente -->
    <div class="absolute inset-0">
      <div 
        v-if="backgroundImage"
        class="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      ></div>
      
      <!-- Gradientes overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
    </div>

    <!-- Contenido principal -->
    <div class="relative z-10 container mx-auto px-4 py-8 lg:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        
        <!-- Poster de la serie -->
        <div class="lg:col-span-3 flex justify-center lg:justify-start">
          <div class="poster-container relative group">
            <div 
              v-if="serie.image?.original"
              class="relative overflow-hidden rounded-lg shadow-2xl transform transition-transform duration-300 group-hover:scale-105"
            >
              <img
                :src="serie.image.original"
                :alt="`Poster de ${serie.name}`"
                class="w-64 h-96 object-cover"
                loading="lazy"
              />
              
              <!-- Overlay con botón de favoritos -->
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                <div class="absolute top-4 right-4">
                  <button
                    @click="toggleFavorite"
                    :class="favoriteButtonClasses"
                    :aria-label="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                  >
                    <Heart 
                      :size="20" 
                      :class="{ 'fill-current': isFavorite }"
                    />
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Placeholder si no hay imagen -->
            <div 
              v-else
              class="w-64 h-96 bg-gray-800 rounded-lg flex items-center justify-center"
            >
              <ImageIcon :size="48" class="text-gray-600" />
            </div>
          </div>
        </div>

        <!-- Información de la serie -->
        <div class="lg:col-span-9 space-y-6">
          
          <!-- Título y año -->
          <div class="space-y-2">
            <h1 class="text-4xl lg:text-6xl font-bold text-white leading-tight">
              {{ serie.name }}
            </h1>
            
            <div class="flex flex-wrap items-center gap-4 text-lg text-gray-300">
              <span v-if="premiereYear">{{ premiereYear }}</span>
              <span v-if="serie.status" class="flex items-center gap-1">
                <Circle :size="6" :class="statusColor" />
                {{ formatStatus(serie.status) }}
              </span>
              <span v-if="serie.runtime">{{ serie.runtime }} min</span>
              <span v-if="serie.network?.name">{{ serie.network.name }}</span>
            </div>
          </div>

          <!-- Rating y géneros -->
          <div class="flex flex-wrap items-center gap-6">
            
            <!-- Rating -->
            <div 
              v-if="serie.rating?.average"
              class="flex items-center gap-2"
            >
              <div class="flex items-center">
                <Star 
                  v-for="star in 5"
                  :key="star"
                  :size="20"
                  :class="getStarClass(star)"
                />
              </div>
              <span class="text-xl font-semibold text-white">
                {{ serie.rating.average.toFixed(1) }}
              </span>
              <span class="text-gray-400">/10</span>
            </div>

            <!-- Géneros -->
            <div 
              v-if="serie.genres?.length"
              class="flex flex-wrap gap-2"
            >
              <span
                v-for="genre in serie.genres.slice(0, 4)"
                :key="genre"
                class="px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-sm font-medium border border-primary-500/30"
              >
                {{ genre }}
              </span>
              <span
                v-if="serie.genres.length > 4"
                class="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-full text-sm"
              >
                +{{ serie.genres.length - 4 }} más
              </span>
            </div>
          </div>

          <!-- Resumen -->
          <div 
            v-if="formattedSummary"
            class="max-w-4xl"
          >
            <p class="text-lg text-gray-200 leading-relaxed">
              {{ formattedSummary }}
            </p>
          </div>

          <!-- Información adicional -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            
            <div 
              v-if="serie.language"
              class="info-item"
            >
              <span class="label">Idioma:</span>
              <span class="value">{{ formatLanguage(serie.language) }}</span>
            </div>

            <div 
              v-if="serie.premiered"
              class="info-item"
            >
              <span class="label">Estreno:</span>
              <span class="value">{{ formatPremiered(serie.premiered) }}</span>
            </div>

            <div 
              v-if="serie.ended"
              class="info-item"
            >
              <span class="label">Finalizada:</span>
              <span class="value">{{ formatPremiered(serie.ended) }}</span>
            </div>

            <div 
              v-if="serie.officialSite"
              class="info-item"
            >
              <span class="label">Sitio oficial:</span>
              <a 
                :href="serie.officialSite"
                target="_blank"
                rel="noopener noreferrer"
                class="value text-primary-400 hover:text-primary-300 transition-colors"
              >
                Visitar sitio
                <ExternalLink :size="14" class="inline ml-1" />
              </a>
            </div>

            <div 
              v-if="serie.weight"
              class="info-item"
            >
              <span class="label">Popularidad:</span>
              <div class="flex items-center gap-2">
                <div class="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min((serie.weight / 100) * 100, 100)}%` }"
                  ></div>
                </div>
                <span class="value">{{ serie.weight }}%</span>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex flex-wrap gap-4 pt-4">
            
            <!-- Botón principal de favoritos -->
            <button
              @click="toggleFavorite"
              :class="primaryButtonClasses"
            >
              <Heart 
                :size="20" 
                :class="{ 'fill-current': isFavorite }"
              />
              {{ isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
            </button>

            <!-- Botón de compartir -->
            <button
              @click="shareShow"
              class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Share2 :size="20" />
              Compartir
            </button>

            <!-- Botón de sitio oficial -->
            <a
              v-if="serie.officialSite"
              :href="serie.officialSite"
              target="_blank"
              rel="noopener noreferrer"
              class="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <ExternalLink :size="20" />
              Sitio oficial
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de scroll -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
      <ChevronDown :size="24" class="text-white/60" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Heart, 
  Star, 
  Circle, 
  Share2, 
  ExternalLink, 
  ChevronDown,
  ImageIcon
} from 'lucide-vue-next'
import { useFavorites } from '@/composables/useFavorites.js'
import { 
  formatStatus, 
  formatLanguage, 
  formatPremiered, 
  cleanSummary,
  getImageUrl
} from '@/utils/formatters.js'

// Props
const props = defineProps({
  /**
   * Datos de la serie
   */
  serie: {
    type: Object,
    required: true
  }
})

// Composables
const { isFavorite, toggleFavorite } = useFavorites()

// Propiedades computadas
const backgroundImage = computed(() => {
  if (props.serie.image?.original) {
    return props.serie.image.original
  }
  return null
})

const formattedSummary = computed(() => {
  if (!props.serie.summary) return null
  return cleanSummary(props.serie.summary)
})

const premiereYear = computed(() => {
  if (!props.serie.premiered) return null
  return new Date(props.serie.premiered).getFullYear()
})

const statusColor = computed(() => {
  const status = props.serie.status?.toLowerCase()
  switch (status) {
    case 'running':
      return 'text-green-500 fill-current'
    case 'ended':
      return 'text-red-500 fill-current'
    case 'to be determined':
      return 'text-yellow-500 fill-current'
    default:
      return 'text-gray-500 fill-current'
  }
})

const favoriteButtonClasses = computed(() => [
  'p-2 rounded-full transition-all duration-200',
  'backdrop-blur-sm border',
  {
    'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30': isFavorite(props.serie.id),
    'bg-black/20 text-white border-white/20 hover:bg-black/40': !isFavorite(props.serie.id)
  }
])

const primaryButtonClasses = computed(() => [
  'px-8 py-3 rounded-lg font-semibold transition-all duration-200',
  'flex items-center gap-2 text-lg',
  {
    'bg-red-600 hover:bg-red-700 text-white': isFavorite(props.serie.id),
    'bg-primary-600 hover:bg-primary-700 text-white': !isFavorite(props.serie.id)
  }
])

// Métodos
const getStarClass = (starNumber) => {
  const rating = props.serie.rating?.average || 0
  const normalizedRating = rating / 2 // Convertir de 10 a 5 estrellas
  
  if (starNumber <= Math.floor(normalizedRating)) {
    return 'text-yellow-400 fill-current'
  } else if (starNumber === Math.ceil(normalizedRating) && normalizedRating % 1 !== 0) {
    return 'text-yellow-400 fill-current opacity-50'
  } else {
    return 'text-gray-600'
  }
}

const shareShow = async () => {
  const shareData = {
    title: props.serie.name,
    text: `Mira "${props.serie.name}" - ${formattedSummary.value?.substring(0, 100)}...`,
    url: window.location.href
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback: copiar al portapapeles
      await navigator.clipboard.writeText(window.location.href)
      // Aquí podrías mostrar un toast de confirmación
    }
  } catch (error) {
    console.error('Error al compartir:', error)
  }
}
</script>

<style scoped>
.serie-hero {
  min-height: 70vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.poster-container {
  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5));
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  color: #9ca3af;
  font-weight: 500;
}

.info-item .value {
  color: white;
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

.serie-hero > .relative {
  animation: fadeInUp 0.8s ease-out;
}

/* Efectos de parallax sutil */
.bg-cover {
  transition: transform 0.3s ease-out;
}

.serie-hero:hover .bg-cover {
  transform: scale(1.02);
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transform,
  .transition-transform,
  .animate-bounce {
    transform: none;
    transition: none;
    animation: none;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .serie-hero {
    min-height: 60vh;
  }
}

@media (max-width: 768px) {
  .serie-hero {
    min-height: 50vh;
  }
  
  .poster-container img {
    width: 12rem;
    height: 18rem;
  }
}

@media (max-width: 640px) {
  .serie-hero {
    min-height: auto;
    padding-bottom: 2rem;
  }
  
  .poster-container img {
    width: 10rem;
    height: 15rem;
  }
}

/* Optimización de rendimiento */
.bg-cover {
  will-change: transform;
}

/* Estados de focus mejorados */
button:focus-visible,
a:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Gradientes personalizados */
.bg-gradient-to-r {
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
}

.bg-gradient-to-t {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    transparent 50%,
    transparent 100%
  );
}

.bg-gradient-to-b {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.6) 0%,
    transparent 30%,
    transparent 100%
  );
}

/* Efectos de hover mejorados */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

.group:hover .group-hover\:bg-black\/20 {
  background-color: rgba(0, 0, 0, 0.2);
}

/* Backdrop blur para navegadores compatibles */
@supports (backdrop-filter: blur(4px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
}
</style>