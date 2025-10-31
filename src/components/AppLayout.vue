<!-- Layout principal de la aplicación con header, main y footer -->
<template>
  <div :class="layoutClasses">
    
    <!-- Header principal -->
    <AppHeader />

    <!-- Contenido principal -->
    <main :class="mainClasses">
      <div class="container mx-auto px-4 py-6">
        
        <!-- Breadcrumbs (opcional) -->
        <nav 
          v-if="showBreadcrumbs && breadcrumbs.length > 0"
          :class="breadcrumbsClasses"
          aria-label="Navegación de migas de pan"
        >
          <ol class="flex items-center space-x-2">
            <li
              v-for="(crumb, index) in breadcrumbs"
              :key="crumb.path || index"
              class="flex items-center"
            >
              <!-- Separador -->
              <ChevronRight 
                v-if="index > 0"
                :size="16" 
                class="text-gray-500 mx-2"
              />
              
              <!-- Enlace o texto -->
              <router-link
                v-if="crumb.path && index < breadcrumbs.length - 1"
                :to="crumb.path"
                class="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {{ crumb.label }}
              </router-link>
              <span
                v-else
                class="text-white text-sm font-medium"
              >
                {{ crumb.label }}
              </span>
            </li>
          </ol>
        </nav>

        <!-- Título de página (opcional) -->
        <div 
          v-if="pageTitle || $slots.title"
          :class="titleSectionClasses"
        >
          <slot name="title">
            <h1 :class="titleClasses">
              {{ pageTitle }}
            </h1>
          </slot>
          
          <!-- Subtítulo (opcional) -->
          <p 
            v-if="pageSubtitle || $slots.subtitle"
            :class="subtitleClasses"
          >
            <slot name="subtitle">
              {{ pageSubtitle }}
            </slot>
          </p>
        </div>

        <!-- Contenido de la página -->
        <div :class="contentClasses">
          <slot />
        </div>

        <!-- Área de acciones flotantes (opcional) -->
        <div 
          v-if="$slots.actions"
          :class="actionsClasses"
        >
          <slot name="actions" />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer :class="footerClasses">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          <!-- Información de la app -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <Tv :size="24" class="text-primary-500" />
              <span class="text-white font-semibold">TVApi</span>
            </div>
            <span class="text-gray-400 text-sm">
              Descubre las mejores series de televisión
            </span>
          </div>

          <!-- Enlaces del footer -->
          <div class="flex items-center space-x-6">
            <a
              href="https://www.tvmaze.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-1"
            >
              <ExternalLink :size="14" />
              <span>Powered by TVMaze</span>
            </a>
            
            <button
              @click="scrollToTop"
              class="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-1"
            >
              <ArrowUp :size="14" />
              <span>Ir arriba</span>
            </button>
          </div>
        </div>

        <!-- Copyright -->
        <div class="mt-4 pt-4 border-t border-gray-800 text-center">
          <p class="text-gray-500 text-xs">
            © {{ currentYear }} TVApi. Aplicación de demostración para búsqueda de series.
          </p>
        </div>
      </div>
    </footer>

    <!-- Overlay para modales (opcional) -->
    <div
      v-if="showOverlay"
      :class="overlayClasses"
      @click="handleOverlayClick"
    >
      <slot name="overlay" />
    </div>

    <!-- Botón de scroll to top -->
    <Transition name="scroll-button">
      <button
        v-if="showScrollButton"
        @click="scrollToTop"
        :class="scrollButtonClasses"
        aria-label="Volver arriba"
      >
        <ArrowUp :size="20" />
      </button>
    </Transition>

    <!-- Toast notifications area -->
    <div 
      v-if="$slots.notifications"
      :class="notificationsClasses"
    >
      <slot name="notifications" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { 
  ChevronRight, 
  Tv, 
  ExternalLink, 
  ArrowUp 
} from 'lucide-vue-next'
import AppHeader from './AppHeader.vue'

// Props del componente
const props = defineProps({
  /**
   * Título de la página
   */
  pageTitle: {
    type: String,
    default: ''
  },

  /**
   * Subtítulo de la página
   */
  pageSubtitle: {
    type: String,
    default: ''
  },

  /**
   * Si debe mostrar breadcrumbs
   */
  showBreadcrumbs: {
    type: Boolean,
    default: false
  },

  /**
   * Array de breadcrumbs personalizados
   */
  customBreadcrumbs: {
    type: Array,
    default: () => []
  },

  /**
   * Si debe mostrar overlay
   */
  showOverlay: {
    type: Boolean,
    default: false
  },

  /**
   * Clase adicional para el contenido
   */
  contentClass: {
    type: String,
    default: ''
  },

  /**
   * Si el layout debe ser de ancho completo
   */
  fullWidth: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['overlay-click'])

// Composables
const route = useRoute()

// Estado local
const showScrollButton = ref(false)
const scrollY = ref(0)

// Año actual
const currentYear = new Date().getFullYear()

// Breadcrumbs automáticos basados en la ruta
const breadcrumbs = computed(() => {
  if (props.customBreadcrumbs.length > 0) {
    return props.customBreadcrumbs
  }

  const crumbs = [{ label: 'Inicio', path: '/' }]
  
  switch (route.path) {
    case '/favoritos':
      crumbs.push({ label: 'Favoritos' })
      break
    case '/serie/:id':
      crumbs.push({ label: 'Serie', path: '/serie' })
      if (route.params.id) {
        crumbs.push({ label: 'Detalles' })
      }
      break
    default:
      if (route.path !== '/') {
        crumbs.push({ label: route.meta?.title || 'Página' })
      }
  }

  return crumbs.length > 1 ? crumbs : []
})

// Clases CSS computadas
const layoutClasses = computed(() => [
  'min-h-screen bg-dark-900 text-white flex flex-col',
  'relative overflow-x-hidden'
])

const mainClasses = computed(() => [
  'flex-1 relative',
  {
    'pt-4': !props.pageTitle && !props.showBreadcrumbs
  }
])

const breadcrumbsClasses = computed(() => [
  'mb-4 pb-2 border-b border-gray-800'
])

const titleSectionClasses = computed(() => [
  'mb-6',
  {
    'text-center': route.path === '/',
    'mb-8': route.path === '/'
  }
])

const titleClasses = computed(() => [
  'text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2',
  'bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent'
])

const subtitleClasses = computed(() => [
  'text-gray-400 text-lg max-w-2xl',
  {
    'mx-auto': route.path === '/'
  }
])

const contentClasses = computed(() => [
  'relative z-10',
  props.contentClass,
  {
    'max-w-none': props.fullWidth,
    'max-w-7xl mx-auto': !props.fullWidth
  }
])

const actionsClasses = computed(() => [
  'fixed bottom-6 right-6 z-30 flex flex-col space-y-3'
])

const footerClasses = computed(() => [
  'bg-dark-800 border-t border-gray-800 mt-auto'
])

const overlayClasses = computed(() => [
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
  'flex items-center justify-center p-4'
])

const scrollButtonClasses = computed(() => [
  'fixed bottom-6 right-6 z-40 p-3 bg-primary-600 hover:bg-primary-700',
  'text-white rounded-full shadow-lg transition-all duration-300',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  'hover:scale-110 active:scale-95'
])

const notificationsClasses = computed(() => [
  'fixed top-20 right-4 z-50 space-y-2 max-w-sm'
])

// Métodos
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    emit('overlay-click')
  }
}

const handleScroll = () => {
  scrollY.value = window.scrollY
  showScrollButton.value = scrollY.value > 300
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Verificar posición inicial
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Exponer métodos para uso externo
defineExpose({
  scrollToTop
})
</script>

<style scoped>
/* Animaciones para el botón de scroll */
.scroll-button-enter-active,
.scroll-button-leave-active {
  transition: all 0.3s ease;
}

.scroll-button-enter-from,
.scroll-button-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* Efectos de parallax sutil */
.relative::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: radial-gradient(
    ellipse at center top,
    rgba(99, 102, 241, 0.1) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

/* Gradiente de fondo sutil */
.bg-dark-900 {
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors,
  .transition-transform {
    transition: none;
  }
  
  .hover\:scale-110:hover {
    transform: none;
  }
  
  .active\:scale-95:active {
    transform: none;
  }
}

/* Responsive mejorado */
@media (max-width: 640px) {
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .fixed.bottom-6.right-6 {
    bottom: 1rem;
    right: 1rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}

/* Focus visible mejorado */
button:focus-visible,
a:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Scroll suave para toda la página */
html {
  scroll-behavior: smooth;
}

/* Optimización de rendimiento */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Modo oscuro adicional */
@media (prefers-color-scheme: dark) {
  .bg-dark-800 {
    background-color: #111827;
  }
  
  .border-gray-800 {
    border-color: #374151;
  }
}

/* Animaciones de entrada para el contenido */
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

.content-enter-active {
  animation: fadeInUp 0.6s ease-out;
}

/* Estilos para el overlay */
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
</style>