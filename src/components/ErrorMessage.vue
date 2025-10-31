<!-- Componente para mostrar mensajes de error con diferentes tipos y acciones -->
<template>
  <div 
    v-if="show"
    :class="containerClasses"
    role="alert"
    :aria-live="ariaLive"
  >
    <!-- Icono del error -->
    <div :class="iconClasses">
      <component 
        :is="iconComponent"
        :size="iconSize"
        :class="iconColorClasses"
      />
    </div>

    <!-- Contenido del mensaje -->
    <div class="flex-1 min-w-0">
      <!-- Título del error -->
      <h3 
        v-if="title"
        :class="titleClasses"
      >
        {{ title }}
      </h3>

      <!-- Mensaje principal -->
      <div :class="messageClasses">
        <slot v-if="$slots.default" />
        <p v-else-if="message">
          {{ message }}
        </p>
        <p v-else>
          {{ defaultMessage }}
        </p>
      </div>

      <!-- Detalles adicionales -->
      <div 
        v-if="details && showDetails"
        :class="detailsClasses"
      >
        <p class="text-sm opacity-75">
          {{ details }}
        </p>
      </div>

      <!-- Botón para mostrar/ocultar detalles -->
      <button
        v-if="details && !showDetails"
        @click="toggleDetails"
        class="text-sm underline opacity-75 hover:opacity-100 transition-opacity mt-1"
      >
        Ver detalles
      </button>
    </div>

    <!-- Acciones -->
    <div 
      v-if="showActions"
      :class="actionsClasses"
    >
      <!-- Botón de reintentar -->
      <button
        v-if="showRetry"
        @click="handleRetry"
        :disabled="isRetrying"
        :class="retryButtonClasses"
      >
        <RefreshCw 
          :size="16" 
          :class="{ 'animate-spin': isRetrying }"
        />
        <span>{{ isRetrying ? 'Reintentando...' : 'Reintentar' }}</span>
      </button>

      <!-- Botón personalizado -->
      <button
        v-if="actionText && actionHandler"
        @click="handleAction"
        :class="actionButtonClasses"
      >
        {{ actionText }}
      </button>

      <!-- Botón de cerrar -->
      <button
        v-if="dismissible"
        @click="handleDismiss"
        :class="dismissButtonClasses"
        :aria-label="'Cerrar mensaje de error'"
      >
        <X :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  X 
} from 'lucide-vue-next'

// Props del componente
const props = defineProps({
  /**
   * Si el mensaje debe mostrarse
   */
  show: {
    type: Boolean,
    default: true
  },

  /**
   * Tipo de error
   * @type {'error' | 'warning' | 'info' | 'network'}
   */
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info', 'network'].includes(value)
  },

  /**
   * Título del mensaje
   */
  title: {
    type: String,
    default: ''
  },

  /**
   * Mensaje principal
   */
  message: {
    type: String,
    default: ''
  },

  /**
   * Detalles adicionales del error
   */
  details: {
    type: String,
    default: ''
  },

  /**
   * Si se puede cerrar el mensaje
   */
  dismissible: {
    type: Boolean,
    default: true
  },

  /**
   * Si debe mostrar el botón de reintentar
   */
  showRetry: {
    type: Boolean,
    default: false
  },

  /**
   * Texto del botón de acción personalizada
   */
  actionText: {
    type: String,
    default: ''
  },

  /**
   * Función para la acción personalizada
   */
  actionHandler: {
    type: Function,
    default: null
  },

  /**
   * Función para reintentar
   */
  retryHandler: {
    type: Function,
    default: null
  },

  /**
   * Tamaño del componente
   * @type {'sm' | 'md' | 'lg'}
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },

  /**
   * Si debe auto-ocultarse después de un tiempo
   */
  autoHide: {
    type: Boolean,
    default: false
  },

  /**
   * Tiempo en ms para auto-ocultar
   */
  autoHideDelay: {
    type: Number,
    default: 5000
  }
})

// Emits
const emit = defineEmits(['dismiss', 'retry', 'action'])

// Estado local
const showDetails = ref(false)
const isRetrying = ref(false)
let autoHideTimer = null

// Configuraciones por tipo
const typeConfig = {
  error: {
    icon: XCircle,
    colors: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-500',
    title: 'Error',
    defaultMessage: 'Ha ocurrido un error inesperado'
  },
  warning: {
    icon: AlertTriangle,
    colors: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-500',
    title: 'Advertencia',
    defaultMessage: 'Algo requiere tu atención'
  },
  info: {
    icon: Info,
    colors: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-500',
    title: 'Información',
    defaultMessage: 'Información importante'
  },
  network: {
    icon: AlertCircle,
    colors: 'bg-orange-50 border-orange-200 text-orange-800',
    iconColor: 'text-orange-500',
    title: 'Error de conexión',
    defaultMessage: 'No se pudo conectar con el servidor'
  }
}

// Configuraciones de tamaño
const sizeConfig = {
  sm: {
    container: 'p-3 text-sm',
    icon: 16,
    title: 'text-sm font-medium',
    message: 'text-sm'
  },
  md: {
    container: 'p-4 text-base',
    icon: 20,
    title: 'text-base font-medium',
    message: 'text-base'
  },
  lg: {
    container: 'p-5 text-lg',
    icon: 24,
    title: 'text-lg font-medium',
    message: 'text-lg'
  }
}

// Propiedades computadas
const config = computed(() => typeConfig[props.type])
const sizeConf = computed(() => sizeConfig[props.size])

const iconComponent = computed(() => config.value.icon)
const iconSize = computed(() => sizeConf.value.icon)
const defaultMessage = computed(() => config.value.defaultMessage)
const ariaLive = computed(() => props.type === 'error' ? 'assertive' : 'polite')

const showActions = computed(() => 
  props.dismissible || props.showRetry || (props.actionText && props.actionHandler)
)

// Clases CSS
const containerClasses = computed(() => [
  'flex items-start gap-3 rounded-lg border transition-all duration-200',
  config.value.colors,
  sizeConf.value.container,
  'shadow-sm hover:shadow-md'
])

const iconClasses = computed(() => [
  'flex-shrink-0 mt-0.5'
])

const iconColorClasses = computed(() => [
  config.value.iconColor
])

const titleClasses = computed(() => [
  sizeConf.value.title,
  'mb-1'
])

const messageClasses = computed(() => [
  sizeConf.value.message
])

const detailsClasses = computed(() => [
  'mt-2 p-2 bg-black/5 rounded text-xs border-l-2 border-current/20'
])

const actionsClasses = computed(() => [
  'flex items-center gap-2 flex-shrink-0'
])

const retryButtonClasses = computed(() => [
  'inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded',
  'bg-white/80 hover:bg-white border border-current/20',
  'transition-colors duration-200',
  'disabled:opacity-50 disabled:cursor-not-allowed'
])

const actionButtonClasses = computed(() => [
  'inline-flex items-center px-3 py-1 text-xs font-medium rounded',
  'bg-current/10 hover:bg-current/20 border border-current/20',
  'transition-colors duration-200'
])

const dismissButtonClasses = computed(() => [
  'p-1 rounded hover:bg-black/10 transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-current/20'
])

// Métodos
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const handleDismiss = () => {
  emit('dismiss')
}

const handleRetry = async () => {
  if (isRetrying.value || !props.retryHandler) return

  try {
    isRetrying.value = true
    await props.retryHandler()
    emit('retry')
  } catch (error) {
    console.error('Error en reintento:', error)
  } finally {
    isRetrying.value = false
  }
}

const handleAction = () => {
  if (props.actionHandler) {
    props.actionHandler()
  }
  emit('action')
}

const startAutoHide = () => {
  if (props.autoHide && props.autoHideDelay > 0) {
    autoHideTimer = setTimeout(() => {
      handleDismiss()
    }, props.autoHideDelay)
  }
}

const clearAutoHide = () => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
    autoHideTimer = null
  }
}

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    startAutoHide()
  } else {
    clearAutoHide()
  }
}, { immediate: true })

// Cleanup
const cleanup = () => {
  clearAutoHide()
}

// Lifecycle
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
/* Animaciones de entrada */
.error-message-enter-active,
.error-message-leave-active {
  transition: all 0.3s ease;
}

.error-message-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Efectos hover mejorados */
.error-message:hover {
  transform: translateY(-1px);
}

/* Accesibilidad mejorada */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors {
    transition: none;
  }
  
  .error-message:hover {
    transform: none;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .flex.items-start {
    flex-direction: column;
    align-items: stretch;
  }
  
  .flex.items-center.gap-2 {
    justify-content: center;
    margin-top: 0.75rem;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .bg-red-50 { background-color: rgba(127, 29, 29, 0.2); }
  .bg-yellow-50 { background-color: rgba(120, 113, 108, 0.2); }
  .bg-blue-50 { background-color: rgba(30, 58, 138, 0.2); }
  .bg-orange-50 { background-color: rgba(154, 52, 18, 0.2); }
  
  .border-red-200 { border-color: #991b1b; }
  .border-yellow-200 { border-color: #a16207; }
  .border-blue-200 { border-color: #1e40af; }
  .border-orange-200 { border-color: #9a3412; }
  
  .text-red-800 { color: #fecaca; }
  .text-yellow-800 { color: #fef3c7; }
  .text-blue-800 { color: #dbeafe; }
  .text-orange-800 { color: #fed7aa; }
}
</style>