<!-- Header principal de la aplicación con navegación y búsqueda -->
<template>
  <header :class="headerClasses">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo y navegación principal -->
        <div class="flex items-center space-x-8">
          <!-- Logo -->
          <router-link 
            to="/" 
            class="flex items-center space-x-2 group"
            @click="handleLogoClick"
          >
            <div class="relative">
              <Tv 
                :size="32" 
                class="text-primary-500 group-hover:text-primary-400 transition-colors duration-200"
              />
              <div class="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
            </div>
            <span class="text-xl font-bold text-white group-hover:text-primary-400 transition-colors duration-200">
              TVApi
            </span>
          </router-link>

          <!-- Navegación principal (desktop) -->
          <nav class="hidden md:flex items-center space-x-6">
            <router-link
              v-for="item in navigationItems"
              :key="item.path"
              :to="item.path"
              :class="getNavLinkClasses(item.path)"
              @click="handleNavClick(item)"
            >
              <component :is="item.icon" :size="18" />
              <span>{{ item.label }}</span>
            </router-link>
          </nav>
        </div>

        <!-- Barra de búsqueda (desktop) -->
        <div class="hidden lg:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <Search 
              :size="20" 
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar series..."
              :class="searchInputClasses"
              @keyup.enter="handleSearch"
              @focus="showSearchSuggestions = true"
              @blur="hideSearchSuggestions"
            />
            
            <!-- Botón de limpiar búsqueda -->
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X :size="16" />
            </button>

            <!-- Sugerencias de búsqueda -->
            <div
              v-if="showSearchSuggestions && searchSuggestions.length > 0"
              :class="suggestionsClasses"
            >
              <button
                v-for="suggestion in searchSuggestions"
                :key="suggestion"
                @click="selectSuggestion(suggestion)"
                class="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-sm"
              >
                <Search :size="14" class="inline mr-2 text-gray-400" />
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <!-- Acciones del header -->
        <div class="flex items-center space-x-4">
          
          <!-- Contador de favoritos -->
          <router-link
            to="/favoritos"
            :class="favoritesButtonClasses"
          >
            <div class="relative">
              <Heart 
                :size="20" 
                :class="{ 'fill-current': favoritesCount > 0 }"
              />
              <span
                v-if="favoritesCount > 0"
                class="absolute -top-2 -right-2 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
              >
                {{ favoritesCount > 99 ? '99+' : favoritesCount }}
              </span>
            </div>
            <span class="hidden sm:inline">Favoritos</span>
          </router-link>

          <!-- Botón de búsqueda móvil -->
          <button
            @click="toggleMobileSearch"
            class="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            <Search :size="20" />
          </button>

          <!-- Menú móvil -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            <Menu v-if="!showMobileMenu" :size="20" />
            <X v-else :size="20" />
          </button>
        </div>
      </div>

      <!-- Búsqueda móvil -->
      <div
        v-if="showMobileSearch"
        class="lg:hidden py-4 border-t border-gray-700"
      >
        <div class="relative">
          <Search 
            :size="20" 
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar series..."
            :class="searchInputClasses"
            @keyup.enter="handleSearch"
            ref="mobileSearchInput"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- Navegación móvil -->
      <nav
        v-if="showMobileMenu"
        class="md:hidden py-4 border-t border-gray-700"
      >
        <div class="space-y-2">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            :class="getMobileNavLinkClasses(item.path)"
            @click="closeMobileMenu"
          >
            <component :is="item.icon" :size="18" />
            <span>{{ item.label }}</span>
          </router-link>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tv, Search, Heart, Menu, X, Home, Star } from 'lucide-vue-next'
import { useSearch } from '@/composables/useSearch.js'
import { useFavorites } from '@/composables/useFavorites.js'

// Composables
const route = useRoute()
const router = useRouter()
const { searchQuery, updateSearchQuery, getSearchSuggestions } = useSearch()
const { favoritesCount } = useFavorites()

// Estado local
const showMobileMenu = ref(false)
const showMobileSearch = ref(false)
const showSearchSuggestions = ref(false)
const mobileSearchInput = ref(null)

// Elementos de navegación
const navigationItems = [
  {
    path: '/',
    label: 'Inicio',
    icon: Home
  },
  {
    path: '/favoritos',
    label: 'Favoritos',
    icon: Heart
  }
]

// Propiedades computadas
const headerClasses = computed(() => [
  'sticky top-0 z-40 bg-dark-900/95 backdrop-blur-md border-b border-gray-800',
  'transition-all duration-300'
])

const searchInputClasses = computed(() => [
  'w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700',
  'rounded-lg text-white placeholder-gray-400',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  'transition-all duration-200'
])

const suggestionsClasses = computed(() => [
  'absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700',
  'rounded-lg shadow-lg max-h-60 overflow-y-auto z-50'
])

const favoritesButtonClasses = computed(() => [
  'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200',
  'text-gray-300 hover:text-white hover:bg-gray-800',
  {
    'text-accent-400 bg-gray-800': route.path === '/favoritos'
  }
])

// Sugerencias de búsqueda
const searchSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    return []
  }
  return getSearchSuggestions(searchQuery.value).slice(0, 5)
})

// Métodos de navegación
const getNavLinkClasses = (path) => [
  'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200',
  'text-gray-300 hover:text-white hover:bg-gray-800',
  {
    'text-primary-400 bg-gray-800': route.path === path
  }
]

const getMobileNavLinkClasses = (path) => [
  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200',
  'text-gray-300 hover:text-white hover:bg-gray-800',
  {
    'text-primary-400 bg-gray-800': route.path === path
  }
]

// Métodos de eventos
const handleLogoClick = () => {
  closeMobileMenu()
  if (route.path === '/') {
    // Si ya estamos en home, hacer scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleNavClick = (item) => {
  closeMobileMenu()
  // Aquí se puede agregar lógica adicional si es necesario
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    updateSearchQuery(searchQuery.value)
    
    // Navegar a la página de inicio si no estamos ahí
    if (route.path !== '/') {
      router.push('/')
    }
    
    closeMobileSearch()
    hideSearchSuggestions()
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  updateSearchQuery('')
  hideSearchSuggestions()
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  handleSearch()
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    showMobileSearch.value = false
  }
}

const toggleMobileSearch = async () => {
  showMobileSearch.value = !showMobileSearch.value
  if (showMobileSearch.value) {
    showMobileMenu.value = false
    await nextTick()
    mobileSearchInput.value?.focus()
  }
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const closeMobileSearch = () => {
  showMobileSearch.value = false
}

const hideSearchSuggestions = () => {
  // Delay para permitir clicks en sugerencias
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

// Watchers
watch(() => route.path, () => {
  closeMobileMenu()
  closeMobileSearch()
})

// Cerrar menús al hacer click fuera
const handleClickOutside = (event) => {
  const header = event.target.closest('header')
  if (!header) {
    showMobileMenu.value = false
    showMobileSearch.value = false
    showSearchSuggestions.value = false
  }
}

// Lifecycle
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Animaciones para el menú móvil */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Efectos de hover mejorados */
.group:hover .animate-pulse {
  animation-duration: 0.8s;
}

/* Scroll suave para el header sticky */
.sticky {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Estilos para las sugerencias */
.suggestions-enter-active,
.suggestions-leave-active {
  transition: all 0.2s ease;
}

.suggestions-enter-from,
.suggestions-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Responsive mejorado */
@media (max-width: 768px) {
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}

/* Accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors {
    transition: none;
  }
  
  .animate-pulse {
    animation: none;
  }
}

/* Focus visible mejorado */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Modo oscuro adicional */
@media (prefers-color-scheme: dark) {
  .bg-gray-800 {
    background-color: #111827;
  }
  
  .border-gray-700 {
    border-color: #4b5563;
  }
}
</style>