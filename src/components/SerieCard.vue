<!-- Tarjeta de serie con imagen, información y acciones -->
<template>
  <article 
    :class="cardClasses"
    @click="handleCardClick"
    @keydown.enter="handleCardClick"
    @keydown.space.prevent="handleCardClick"
    tabindex="0"
    role="button"
    :aria-label="`Ver detalles de ${serie.name}`"
  >
    
    <!-- Contenedor de imagen -->
    <div :class="imageContainerClasses">
      
      <!-- Imagen de la serie -->
      <img
        :src="imageUrl"
        :alt="`Poster de ${serie.name}`"
        :class="imageClasses"
        @load="handleImageLoad"
        @error="handleImageError"
        loading="lazy"
      />

      <!-- Overlay con gradiente -->
      <div :class="overlayClasses">
        
        <!-- Rating -->
        <div 
          v-if="serie.rating?.average"
          :class="ratingClasses"
        >
          <Star 
            :size="14" 
            class="fill-current text-yellow-400"
          />
          <span class="text-sm font-medium">
            {{ formatRating(serie.rating.average) }}
          </span>
        </div>

        <!-- Botón de favoritos -->
        <button
          @click.stop="toggleFavorite"
          :class="favoriteButtonClasses"
          :aria-label="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
        >
          <Heart 
            :size="18" 
            :class="{ 'fill-current': isFavorite }"
          />
        </button>
      </div>

      <!-- Indicador de estado -->
      <div 
        v-if="serie.status"
        :class="statusBadgeClasses"
      >
        {{ formatStatus(serie.status) }}
      </div>

      <!-- Skeleton loader -->
      <div 
        v-if="isLoading"
        :class="skeletonClasses"
      >
        <div class="animate-pulse bg-gray-700 w-full h-full rounded-lg"></div>
      </div>
    </div>

    <!-- Información de la serie -->
    <div :class="infoClasses">
      
      <!-- Título -->
      <h3 :class="titleClasses">
        {{ serie.name }}
      </h3>

      <!-- Géneros -->
      <div 
        v-if="serie.genres && serie.genres.length > 0"
        :class="genresClasses"
      >
        <span
          v-for="(genre, index) in displayGenres"
          :key="genre"
          :class="genreTagClasses"
        >
          {{ genre }}
        </span>
        <span
          v-if="serie.genres.length > maxGenres"
          class="text-xs text-gray-500"
        >
          +{{ serie.genres.length - maxGenres }}
        </span>
      </div>

      <!-- Información adicional -->
      <div :class="metaClasses">
        
        <!-- Año de estreno -->
        <span 
          v-if="serie.premiered"
          class="text-xs text-gray-400"
        >
          {{ formatYear(serie.premiered) }}
        </span>

        <!-- Red/Canal -->
        <span 
          v-if="serie.network?.name"
          class="text-xs text-gray-400"
        >
          {{ serie.network.name }}
        </span>

        <!-- Duración -->
        <span 
          v-if="serie.runtime"
          class="text-xs text-gray-400"
        >
          {{ serie.runtime }}min
        </span>
      </div>

      <!-- Resumen (opcional) -->
      <p 
        v-if="showSummary && serie.summary"
        :class="summaryClasses"
      >
        {{ truncatedSummary }}
      </p>
    </div>

    <!-- Indicador de carga al hacer hover -->
    <div 
      v-if="isNavigating"
      :class="loadingOverlayClasses"
    >
      <LoadingSpinner size="sm" color="white" />
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Star, Heart } from 'lucide-vue-next'
import { useFavorites } from '@/composables/useFavorites.js'
import { formatRating, formatStatus, formatYear, cleanSummary, getImageUrl, truncateText } from '@/utils/formatters.js'
import LoadingSpinner from './LoadingSpinner.vue'

// Props del componente
const props = defineProps({
  /**
   * Datos de la serie
   */
  serie: {
    type: Object,
    required: true
  },

  /**
   * Tamaño de la tarjeta
   * @type {'sm' | 'md' | 'lg'}
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },

  /**
   * Si debe mostrar el resumen
   */
  showSummary: {
    type: Boolean,
    default: false
  },

  /**
   * Número máximo de géneros a mostrar
   */
  maxGenres: {
    type: Number,
    default: 2
  },

  /**
   * Si la tarjeta es clickeable
   */
  clickable: {
    type: Boolean,
    default: true
  },

  /**
   * Clase adicional para la tarjeta
   */
  cardClass: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['click', 'favorite-toggle'])

// Composables
const router = useRouter()
const { isFavorite, toggleFavorite: toggleFav } = useFavorites()

// Estado local
const isLoading = ref(true)
const isNavigating = ref(false)
const imageError = ref(false)

// Configuraciones de tamaño
const sizeConfig = {
  sm: {
    container: 'w-40',
    image: 'h-56',
    title: 'text-sm',
    info: 'p-2'
  },
  md: {
    container: 'w-48',
    image: 'h-64',
    title: 'text-base',
    info: 'p-3'
  },
  lg: {
    container: 'w-56',
    image: 'h-72',
    title: 'text-lg',
    info: 'p-4'
  }
}

// Propiedades computadas
const config = computed(() => sizeConfig[props.size])

const imageUrl = computed(() => {
  if (imageError.value) {
    return `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=TV%20series%20poster%20${encodeURIComponent(props.serie.name)}&image_size=portrait_4_3`
  }
  return getImageUrl(props.serie.image, 'medium')
})

const displayGenres = computed(() => 
  props.serie.genres?.slice(0, props.maxGenres) || []
)

const truncatedSummary = computed(() => {
  if (!props.serie.summary) return ''
  const cleaned = cleanSummary(props.serie.summary)
  return truncateText(cleaned, 100)
})

const isFav = computed(() => isFavorite(props.serie.id))

// Clases CSS
const cardClasses = computed(() => [
  'serie-card group relative bg-gray-800 rounded-lg overflow-hidden',
  'transition-all duration-300 ease-out',
  'hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900',
  'cursor-pointer select-none',
  config.value.container,
  props.cardClass,
  {
    'pointer-events-none': !props.clickable
  }
])

const imageContainerClasses = computed(() => [
  'relative overflow-hidden',
  config.value.image
])

const imageClasses = computed(() => [
  'w-full h-full object-cover transition-transform duration-500',
  'group-hover:scale-110'
])

const overlayClasses = computed(() => [
  'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent',
  'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
  'flex items-end justify-between p-3'
])

const ratingClasses = computed(() => [
  'flex items-center space-x-1 bg-black/50 backdrop-blur-sm',
  'px-2 py-1 rounded-full text-white'
])

const favoriteButtonClasses = computed(() => [
  'p-2 bg-black/50 backdrop-blur-sm rounded-full',
  'text-white hover:text-red-400 transition-colors duration-200',
  'hover:bg-black/70',
  {
    'text-red-400': isFav.value
  }
])

const statusBadgeClasses = computed(() => [
  'absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full',
  'bg-primary-600 text-white shadow-lg'
])

const skeletonClasses = computed(() => [
  'absolute inset-0 flex items-center justify-center'
])

const infoClasses = computed(() => [
  config.value.info,
  'space-y-2'
])

const titleClasses = computed(() => [
  config.value.title,
  'font-semibold text-white line-clamp-2 group-hover:text-primary-400',
  'transition-colors duration-200'
])

const genresClasses = computed(() => [
  'flex flex-wrap gap-1'
])

const genreTagClasses = computed(() => [
  'px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded-full'
])

const metaClasses = computed(() => [
  'flex flex-wrap gap-2 text-xs text-gray-400'
])

const summaryClasses = computed(() => [
  'text-xs text-gray-400 line-clamp-3'
])

const loadingOverlayClasses = computed(() => [
  'absolute inset-0 bg-black/50 backdrop-blur-sm',
  'flex items-center justify-center'
])

// Métodos
const handleCardClick = async () => {
  if (!props.clickable) return

  emit('click', props.serie)

  if (router) {
    try {
      isNavigating.value = true
      await router.push(`/serie/${props.serie.id}`)
    } catch (error) {
      console.error('Error navegando a serie:', error)
    } finally {
      isNavigating.value = false
    }
  }
}

const toggleFavorite = async () => {
  try {
    const result = await toggleFav(props.serie)
    emit('favorite-toggle', { serie: props.serie, isFavorite: result })
  } catch (error) {
    console.error('Error toggling favorite:', error)
  }
}

const handleImageLoad = () => {
  isLoading.value = false
  imageError.value = false
}

const handleImageError = () => {
  isLoading.value = false
  imageError.value = true
}
</script>

<style scoped>
/* Animaciones personalizadas */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    #374151 25%,
    #4b5563 50%,
    #374151 75%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* Efectos de hover mejorados */
.serie-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.serie-card:active {
  transform: translateY(-2px) scale(1.01);
}

/* Clamp para texto */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-transform,
  .transition-colors,
  .transition-opacity {
    transition: none;
  }
  
  .group-hover\:scale-110:hover {
    transform: none;
  }
  
  .hover\:scale-105:hover {
    transform: none;
  }
  
  .animate-pulse {
    animation: none;
  }
}

/* Focus visible mejorado */
.serie-card:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .w-48 {
    width: 10rem;
  }
  
  .w-56 {
    width: 11rem;
  }
  
  .h-64 {
    height: 14rem;
  }
  
  .h-72 {
    height: 16rem;
  }
}

/* Modo oscuro adicional */
@media (prefers-color-scheme: dark) {
  .bg-gray-800 {
    background-color: #111827;
  }
  
  .bg-gray-700 {
    background-color: #374151;
  }
}

/* Optimización de rendimiento */
.serie-card {
  contain: layout style paint;
  will-change: transform;
}

.serie-card img {
  will-change: transform;
}

/* Estados de carga */
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

/* Efectos de gradiente */
.bg-gradient-to-t {
  background-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
}

/* Sombras personalizadas */
.hover\:shadow-2xl {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.hover\:shadow-primary-500\/20:hover {
  box-shadow: 
    0 25px 50px -12px rgba(99, 102, 241, 0.2),
    0 0 0 1px rgba(99, 102, 241, 0.1);
}
</style>