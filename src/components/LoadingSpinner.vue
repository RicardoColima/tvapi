<!-- Componente de spinner de carga con diferentes tamaños y estilos -->
<template>
  <div 
    :class="containerClasses"
    :aria-label="ariaLabel"
    role="status"
  >
    <!-- Spinner principal -->
    <div 
      :class="spinnerClasses"
      :style="spinnerStyle"
    >
      <!-- Círculos del spinner -->
      <div 
        v-for="i in circleCount" 
        :key="i"
        :class="circleClasses"
        :style="getCircleStyle(i)"
      ></div>
    </div>

    <!-- Texto de carga (opcional) -->
    <div 
      v-if="showText && text"
      :class="textClasses"
    >
      {{ text }}
    </div>

    <!-- Texto para lectores de pantalla -->
    <span class="sr-only">
      {{ ariaLabel }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props del componente
const props = defineProps({
  /**
   * Tamaño del spinner
   * @type {'xs' | 'sm' | 'md' | 'lg' | 'xl'}
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },

  /**
   * Tipo de spinner
   * @type {'dots' | 'circle' | 'pulse' | 'bars'}
   */
  type: {
    type: String,
    default: 'dots',
    validator: (value) => ['dots', 'circle', 'pulse', 'bars'].includes(value)
  },

  /**
   * Color del spinner
   * @type {'primary' | 'accent' | 'white' | 'gray'}
   */
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'accent', 'white', 'gray'].includes(value)
  },

  /**
   * Si debe ocupar toda la pantalla
   */
  fullscreen: {
    type: Boolean,
    default: false
  },

  /**
   * Si debe centrarse en su contenedor
   */
  centered: {
    type: Boolean,
    default: true
  },

  /**
   * Texto a mostrar debajo del spinner
   */
  text: {
    type: String,
    default: ''
  },

  /**
   * Si debe mostrar el texto
   */
  showText: {
    type: Boolean,
    default: false
  },

  /**
   * Texto para accesibilidad
   */
  ariaLabel: {
    type: String,
    default: 'Cargando contenido...'
  }
})

// Configuraciones de tamaño
const sizeConfig = {
  xs: { size: 16, text: 'text-xs' },
  sm: { size: 20, text: 'text-sm' },
  md: { size: 24, text: 'text-base' },
  lg: { size: 32, text: 'text-lg' },
  xl: { size: 40, text: 'text-xl' }
}

// Configuraciones de color
const colorConfig = {
  primary: 'text-primary-500',
  accent: 'text-accent-500',
  white: 'text-white',
  gray: 'text-gray-400'
}

// Número de círculos según el tipo
const circleCount = computed(() => {
  switch (props.type) {
    case 'dots': return 3
    case 'bars': return 4
    case 'pulse': return 1
    case 'circle': return 1
    default: return 3
  }
})

// Clases del contenedor
const containerClasses = computed(() => [
  'loading-spinner',
  {
    // Fullscreen
    'fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-sm': props.fullscreen,
    
    // Centrado
    'flex items-center justify-center': props.centered || props.fullscreen,
    
    // Dirección de elementos
    'flex-col': props.showText && props.text,
    'gap-3': props.showText && props.text
  }
])

// Clases del spinner
const spinnerClasses = computed(() => [
  'relative inline-flex',
  {
    // Tipos de animación
    'animate-spin': props.type === 'circle',
    'space-x-1': props.type === 'dots' || props.type === 'bars'
  }
])

// Estilo del spinner
const spinnerStyle = computed(() => {
  const config = sizeConfig[props.size]
  return {
    width: `${config.size}px`,
    height: `${config.size}px`
  }
})

// Clases de los círculos/elementos
const circleClasses = computed(() => {
  const baseClasses = [colorConfig[props.color]]
  
  switch (props.type) {
    case 'dots':
      return [
        ...baseClasses,
        'w-2 h-2 rounded-full animate-pulse-slow'
      ]
    
    case 'bars':
      return [
        ...baseClasses,
        'w-1 h-4 rounded-sm animate-pulse'
      ]
    
    case 'pulse':
      return [
        ...baseClasses,
        'w-full h-full rounded-full animate-ping'
      ]
    
    case 'circle':
      return [
        ...baseClasses,
        'absolute inset-0 rounded-full border-2 border-current border-t-transparent'
      ]
    
    default:
      return baseClasses
  }
})

// Clases del texto
const textClasses = computed(() => [
  sizeConfig[props.size].text,
  colorConfig[props.color],
  'font-medium animate-pulse'
])

// Estilo específico para cada círculo
const getCircleStyle = (index) => {
  if (props.type === 'dots') {
    return {
      animationDelay: `${(index - 1) * 0.2}s`
    }
  }
  
  if (props.type === 'bars') {
    return {
      animationDelay: `${(index - 1) * 0.15}s`,
      height: `${12 + (index % 2) * 4}px`
    }
  }
  
  return {}
}
</script>

<style scoped>
/* Animaciones personalizadas */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 1.5s ease-in-out infinite;
}

/* Spinner de círculo con gradiente */
.loading-spinner .animate-spin {
  background: conic-gradient(
    from 0deg,
    transparent,
    currentColor,
    transparent
  );
  border-radius: 50%;
  mask: radial-gradient(
    circle at center,
    transparent 40%,
    black 41%,
    black 59%,
    transparent 60%
  );
}

/* Efectos de hover para interactividad */
.loading-spinner:hover .animate-pulse {
  animation-duration: 0.8s;
}

.loading-spinner:hover .animate-spin {
  animation-duration: 0.8s;
}

/* Accesibilidad */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .loading-spinner.fullscreen .text-xl {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  
  .loading-spinner.fullscreen .text-lg {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .loading-spinner.fullscreen {
    background-color: rgba(17, 24, 39, 0.9);
  }
}

/* Reducir movimiento para usuarios sensibles */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .animate-pulse,
  .animate-pulse-slow,
  .animate-ping {
    animation: none;
  }
  
  .loading-spinner .animate-spin::after {
    content: '⏳';
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
  }
}
</style>