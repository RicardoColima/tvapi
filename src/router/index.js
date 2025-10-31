// Configuración de Vue Router para la aplicación de series de TV
import { createRouter, createWebHistory } from 'vue-router'

// Importar vistas
import HomeView from '@/views/HomeView.vue'
import SerieDetailView from '@/views/SerieDetailView.vue'
import FavoritesView from '@/views/FavoritesView.vue'

// Definir rutas
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'Inicio - TV Series App',
      description: 'Descubre y explora las mejores series de televisión'
    }
  },
  {
    path: '/serie/:id',
    name: 'SerieDetail',
    component: SerieDetailView,
    meta: {
      title: 'Detalles de Serie - TV Series App',
      description: 'Información detallada de la serie'
    },
    props: route => ({
      id: parseInt(route.params.id) || 0
    })
  },
  {
    path: '/favoritos',
    name: 'Favorites',
    component: FavoritesView,
    meta: {
      title: 'Mis Favoritos - TV Series App',
      description: 'Tu colección personal de series favoritas'
    }
  },
  {
    path: '/buscar',
    name: 'Search',
    component: HomeView,
    meta: {
      title: 'Buscar Series - TV Series App',
      description: 'Busca tus series favoritas'
    },
    props: route => ({
      initialQuery: route.query.q || ''
    })
  },
  // Ruta para manejar URLs no encontradas
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Página no encontrada - TV Series App',
      description: 'La página que buscas no existe'
    }
  }
]

// Crear instancia del router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Comportamiento de scroll personalizado
    if (savedPosition) {
      // Si hay una posición guardada (navegación con botones del navegador)
      return savedPosition
    } else if (to.hash) {
      // Si hay un hash en la URL, hacer scroll al elemento
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      // Por defecto, ir al inicio de la página
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Guards de navegación
router.beforeEach((to, from, next) => {
  // Actualizar el título de la página
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Actualizar meta description
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description)
    }
  }

  // Validar parámetros de ruta
  if (to.name === 'SerieDetail') {
    const id = parseInt(to.params.id)
    if (!id || id <= 0) {
      // Redirigir al inicio si el ID no es válido
      next({ name: 'Home' })
      return
    }
  }

  next()
})

// Guard después de la navegación
router.afterEach((to, from) => {
  // Limpiar cualquier estado de loading global si existe
  // Esto se puede usar para ocultar spinners de navegación
  
  // Log de navegación en desarrollo
  if (import.meta.env.DEV) {
    console.log(`Navegando de ${from.name || 'unknown'} a ${to.name || 'unknown'}`)
  }
})

// Manejo de errores de navegación
router.onError((error) => {
  console.error('Error de navegación:', error)
  
  // En producción, podrías enviar esto a un servicio de logging
  if (import.meta.env.PROD) {
    // Ejemplo: enviar error a servicio de monitoreo
    // errorService.log(error)
  }
})

export default router