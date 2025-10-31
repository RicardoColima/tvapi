<!-- Componente principal de la aplicación -->
<template>
  <div id="app" class="min-h-screen bg-gray-900 text-white">
    <!-- Router View - Aquí se renderizan las diferentes vistas -->
    <router-view />
    
    <!-- Toast notifications container -->
    <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2">
      <!-- Los toasts se insertarán aquí dinámicamente -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Configuración global de la aplicación
onMounted(() => {
  // Configurar meta tags básicos
  setupMetaTags()
  
  // Configurar manejo de errores globales
  setupErrorHandling()
  
  // Configurar service worker si está disponible
  setupServiceWorker()
  
  // Log de inicio de aplicación en desarrollo
  if (import.meta.env.DEV) {
    console.log('🎬 TV Series App iniciada')
    console.log('Modo:', import.meta.env.MODE)
  }
})

onUnmounted(() => {
  // Limpiar event listeners globales si los hay
  cleanupGlobalListeners()
})

// Funciones de configuración
const setupMetaTags = () => {
  // Configurar meta tags básicos
  const metaViewport = document.querySelector('meta[name="viewport"]')
  if (!metaViewport) {
    const viewport = document.createElement('meta')
    viewport.name = 'viewport'
    viewport.content = 'width=device-width, initial-scale=1.0'
    document.head.appendChild(viewport)
  }
  
  // Meta description por defecto
  const metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    const description = document.createElement('meta')
    description.name = 'description'
    description.content = 'Descubre y explora las mejores series de televisión. Busca, guarda tus favoritos y mantente al día con la información más completa.'
    document.head.appendChild(description)
  }
  
  // Meta keywords
  const metaKeywords = document.querySelector('meta[name="keywords"]')
  if (!metaKeywords) {
    const keywords = document.createElement('meta')
    keywords.name = 'keywords'
    keywords.content = 'series, televisión, TV, streaming, favoritos, búsqueda, entretenimiento'
    document.head.appendChild(keywords)
  }
  
  // Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (!ogTitle) {
    const title = document.createElement('meta')
    title.setAttribute('property', 'og:title')
    title.content = 'TV Series App - Descubre las mejores series'
    document.head.appendChild(title)
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]')
  if (!ogDescription) {
    const description = document.createElement('meta')
    description.setAttribute('property', 'og:description')
    description.content = 'Explora, busca y guarda tus series de televisión favoritas'
    document.head.appendChild(description)
  }
  
  const ogType = document.querySelector('meta[property="og:type"]')
  if (!ogType) {
    const type = document.createElement('meta')
    type.setAttribute('property', 'og:type')
    type.content = 'website'
    document.head.appendChild(type)
  }
}

const setupErrorHandling = () => {
  // Manejo de errores globales de JavaScript
  window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error)
    
    // En producción, enviar a servicio de logging
    if (import.meta.env.PROD) {
      // errorService.log(event.error)
    }
  })
  
  // Manejo de promesas rechazadas no capturadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no capturada:', event.reason)
    
    // En producción, enviar a servicio de logging
    if (import.meta.env.PROD) {
      // errorService.log(event.reason)
    }
  })
}

const setupServiceWorker = () => {
  // Registrar service worker en producción
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registrado: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registro falló: ', registrationError)
        })
    })
  }
}

const cleanupGlobalListeners = () => {
  // Limpiar event listeners si los hay
  // Esto es importante para evitar memory leaks
}

// Función global para mostrar toasts (puede ser usada desde cualquier componente)
window.showToast = (message, type = 'info', duration = 3000) => {
  const container = document.getElementById('toast-container')
  if (!container) return
  
  const toast = document.createElement('div')
  toast.className = `toast toast-${type} px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`
  
  // Estilos según el tipo
  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white'
  }
  
  toast.className += ` ${styles[type] || styles.info}`
  toast.textContent = message
  
  container.appendChild(toast)
  
  // Animar entrada
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0')
  }, 100)
  
  // Remover después del tiempo especificado
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0')
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast)
      }
    }, 300)
  }, duration)
}
</script>

<style>
/* Estilos globales de la aplicación */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Scrollbar para Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

/* Transiciones globales */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Focus visible para accesibilidad */
*:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Mejoras de rendimiento */
img {
  content-visibility: auto;
}

/* Optimizaciones para dispositivos móviles */
@media (max-width: 768px) {
  #app {
    -webkit-tap-highlight-color: transparent;
  }
}

/* Modo de alto contraste */
@media (prefers-contrast: high) {
  * {
    border-color: currentColor !important;
  }
}

/* Reducir movimiento para usuarios que lo prefieren */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Estilos para toasts */
.toast {
  max-width: 300px;
  word-wrap: break-word;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* Mejoras de accesibilidad para lectores de pantalla */
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

/* Estilos para estados de carga */
.loading-skeleton {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Optimización de fuentes */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
}
</style>