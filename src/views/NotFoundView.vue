<!-- Vista para páginas no encontradas (404) -->
<template>
  <AppLayout>
    <div class="not-found-view min-h-screen flex items-center justify-center">
      <div class="text-center max-w-md mx-auto px-4">
        
        <!-- Ilustración 404 -->
        <div class="mb-8">
          <div class="relative">
            <!-- Número 404 grande -->
            <div class="text-8xl md:text-9xl font-bold text-gray-800 select-none">
              404
            </div>
            
            <!-- Icono de TV roto -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="bg-gray-700 rounded-lg p-4 transform rotate-12">
                <MonitorX :size="48" class="text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje principal -->
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Página no encontrada
        </h1>
        
        <p class="text-gray-400 text-lg mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <!-- Sugerencias -->
        <div class="space-y-4 mb-8">
          <p class="text-gray-500 text-sm">
            ¿Qué te gustaría hacer?
          </p>
          
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <!-- Botón volver al inicio -->
            <router-link
              to="/"
              class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <Home :size="20" />
              Ir al inicio
            </router-link>
            
            <!-- Botón volver atrás -->
            <button
              @click="goBack"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <ArrowLeft :size="20" />
              Volver atrás
            </button>
          </div>
        </div>

        <!-- Enlaces útiles -->
        <div class="border-t border-gray-700 pt-6">
          <p class="text-gray-500 text-sm mb-4">
            Enlaces útiles:
          </p>
          
          <div class="flex flex-wrap justify-center gap-4 text-sm">
            <router-link
              to="/"
              class="text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              Explorar series
            </router-link>
            
            <router-link
              to="/favoritos"
              class="text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              Mis favoritos
            </router-link>
            
            <button
              @click="searchPopular"
              class="text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              Series populares
            </button>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <div class="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <AlertCircle :size="16" />
            <span>
              Si crees que esto es un error, 
              <button 
                @click="reportError"
                class="text-primary-400 hover:text-primary-300 underline"
              >
                repórtalo aquí
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MonitorX,
  Home,
  ArrowLeft,
  AlertCircle
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'

// Router
const router = useRouter()

// Métodos
const goBack = () => {
  // Verificar si hay historial para volver
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // Si no hay historial, ir al inicio
    router.push('/')
  }
}

const searchPopular = () => {
  // Redirigir al inicio con una búsqueda popular
  router.push({ 
    name: 'Search', 
    query: { q: 'popular' } 
  })
}

const reportError = () => {
  // En una aplicación real, esto abriría un modal o formulario
  // Por ahora, simplemente mostrar un alert
  alert('Gracias por reportar el error. Nuestro equipo lo revisará pronto.')
}

// Lifecycle
onMounted(() => {
  // Log del error 404 para analytics
  if (import.meta.env.PROD) {
    console.warn('404 Error:', window.location.pathname)
    // Aquí podrías enviar el error a un servicio de analytics
    // analytics.track('404_error', { path: window.location.pathname })
  }
})
</script>

<style scoped>
/* Animaciones para la vista 404 */
.not-found-view {
  animation: fadeInUp 0.6s ease-out;
}

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

/* Efecto de glitch para el número 404 */
.text-8xl,
.text-9xl {
  position: relative;
  animation: glitch 2s infinite;
}

@keyframes glitch {
  0%, 90%, 100% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(-2px);
  }
  20% {
    transform: translateX(2px);
  }
  30% {
    transform: translateX(-1px);
  }
  40% {
    transform: translateX(1px);
  }
  50% {
    transform: translateX(-2px);
  }
  60% {
    transform: translateX(2px);
  }
  70% {
    transform: translateX(-1px);
  }
  80% {
    transform: translateX(1px);
  }
}

/* Hover effects */
.inline-flex:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .text-8xl {
    font-size: 4rem;
  }
  
  .flex-col.sm\:flex-row {
    flex-direction: column;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .not-found-view,
  .text-8xl,
  .text-9xl {
    animation: none;
  }
  
  .inline-flex:hover {
    transform: none;
  }
}

/* Focus states */
button:focus-visible,
a:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Dark mode optimizations */
@media (prefers-color-scheme: dark) {
  .bg-gray-800\/50 {
    background-color: rgba(31, 41, 55, 0.7);
  }
}
</style>