<!-- Barra de búsqueda avanzada con sugerencias y filtros rápidos -->
<template>
  <div class="search-bar relative">
    
    <!-- Contenedor principal de búsqueda -->
    <div :class="containerClasses">
      
      <!-- Icono de búsqueda -->
      <div class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Search 
          :size="20" 
          :class="iconClasses"
        />
      </div>

      <!-- Input de búsqueda -->
      <input
        ref="searchInput"
        v-model="localQuery"
        type="text"
        :placeholder="placeholder"
        :class="inputClasses"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
        :disabled="disabled"
        autocomplete="off"
        spellcheck="false"
      />

      <!-- Botones de acción -->
      <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        
        <!-- Indicador de carga -->
        <div 
          v-if="isLoading"
          class="p-2"
        >
          <LoadingSpinner size="xs" color="gray" />
        </div>

        <!-- Botón de limpiar -->
        <button
          v-if="localQuery && !isLoading"
          @click="clearSearch"
          :class="clearButtonClasses"
          :aria-label="'Limpiar búsqueda'"
        >
          <X :size="16" />
        </button>

        <!-- Botón de búsqueda -->
        <button
          v-if="showSearchButton"
          @click="handleSearch"
          :disabled="!canSearch || isLoading"
          :class="searchButtonClasses"
          :aria-label="'Buscar series'"
        >
          <Search :size="16" />
        </button>
      </div>
    </div>

    <!-- Panel de sugerencias -->
    <Transition name="suggestions">
      <div
        v-if="showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)"
        :class="suggestionsClasses"
      >
        
        <!-- Búsquedas recientes -->
        <div 
          v-if="recentSearches.length > 0 && !localQuery"
          class="p-2"
        >
          <h4 class="text-xs font-medium text-gray-400 mb-2 px-2">
            Búsquedas recientes
          </h4>
          <button
            v-for="search in recentSearches.slice(0, 5)"
            :key="search"
            @click="selectSuggestion(search)"
            :class="suggestionItemClasses"
          >
            <Clock :size="14" class="text-gray-500" />
            <span>{{ search }}</span>
            <button
              @click.stop="removeFromHistory(search)"
              class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
            >
              <X :size="12" />
            </button>
          </button>
        </div>

        <!-- Sugerencias de búsqueda -->
        <div 
          v-if="suggestions.length > 0"
          class="p-2"
        >
          <h4 
            v-if="!localQuery"
            class="text-xs font-medium text-gray-400 mb-2 px-2"
          >
            Sugerencias
          </h4>
          <button
            v-for="(suggestion, index) in suggestions"
            :key="suggestion"
            @click="selectSuggestion(suggestion)"
            :class="getSuggestionItemClasses(index)"
            :ref="el => suggestionRefs[index] = el"
          >
            <Search :size="14" class="text-gray-500" />
            <span v-html="highlightMatch(suggestion)"></span>
          </button>
        </div>

        <!-- Filtros rápidos -->
        <div 
          v-if="showQuickFilters && quickFilters.length > 0"
          class="border-t border-gray-700 p-2"
        >
          <h4 class="text-xs font-medium text-gray-400 mb-2 px-2">
            Filtros rápidos
          </h4>
          <div class="flex flex-wrap gap-1 px-2">
            <button
              v-for="filter in quickFilters"
              :key="filter.value"
              @click="applyQuickFilter(filter)"
              class="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- Acciones adicionales -->
        <div 
          v-if="localQuery"
          class="border-t border-gray-700 p-2"
        >
          <button
            @click="handleAdvancedSearch"
            class="w-full text-left px-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <Settings :size="14" class="inline mr-2" />
            Búsqueda avanzada para "{{ localQuery }}"
          </button>
        </div>
      </div>
    </Transition>

    <!-- Overlay para cerrar sugerencias en móvil -->
    <div
      v-if="showSuggestions && isMobile"
      class="fixed inset-0 z-10 bg-black/20"
      @click="hideSuggestions"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Search, X, Clock, Settings } from 'lucide-vue-next'
import { useSearch } from '@/composables/useSearch.js'
import LoadingSpinner from './LoadingSpinner.vue'

// Props del componente
const props = defineProps({
  /**
   * Valor inicial de búsqueda
   */
  modelValue: {
    type: String,
    default: ''
  },

  /**
   * Placeholder del input
   */
  placeholder: {
    type: String,
    default: 'Buscar series, actores, géneros...'
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
   * Si debe mostrar el botón de búsqueda
   */
  showSearchButton: {
    type: Boolean,
    default: false
  },

  /**
   * Si debe mostrar filtros rápidos
   */
  showQuickFilters: {
    type: Boolean,
    default: true
  },

  /**
   * Si está deshabilitado
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * Si debe hacer foco automático
   */
  autofocus: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'search', 'focus', 'blur', 'clear'])

// Composable de búsqueda
const {
  searchQuery,
  updateSearchQuery,
  isLoading,
  getSearchSuggestions,
  searchHistory,
  searchFromSuggestion,
  clearSearchHistory
} = useSearch()

// Referencias
const searchInput = ref(null)
const suggestionRefs = ref([])

// Estado local
const localQuery = ref(props.modelValue)
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)
const isMobile = ref(false)

// Configuraciones de tamaño
const sizeConfig = {
  sm: {
    height: 'h-10',
    text: 'text-sm',
    padding: 'pl-10 pr-16'
  },
  md: {
    height: 'h-12',
    text: 'text-base',
    padding: 'pl-12 pr-20'
  },
  lg: {
    height: 'h-14',
    text: 'text-lg',
    padding: 'pl-14 pr-24'
  }
}

// Filtros rápidos
const quickFilters = [
  { label: 'Drama', value: 'Drama' },
  { label: 'Comedia', value: 'Comedy' },
  { label: 'Acción', value: 'Action' },
  { label: 'Thriller', value: 'Thriller' },
  { label: 'Sci-Fi', value: 'Science-Fiction' },
  { label: 'Romance', value: 'Romance' }
]

// Propiedades computadas
const config = computed(() => sizeConfig[props.size])

const canSearch = computed(() => 
  localQuery.value.trim().length >= 2
)

const suggestions = computed(() => {
  if (!localQuery.value || localQuery.value.length < 2) {
    return []
  }
  return getSearchSuggestions(localQuery.value).slice(0, 8)
})

const recentSearches = computed(() => 
  searchHistory.value.slice(0, 5)
)

// Clases CSS
const containerClasses = computed(() => [
  'relative w-full',
  {
    'max-w-2xl mx-auto': props.size === 'lg'
  }
])

const inputClasses = computed(() => [
  'w-full bg-gray-800 border border-gray-700 rounded-lg',
  'text-white placeholder-gray-400',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  'transition-all duration-200',
  config.value.height,
  config.value.text,
  config.value.padding,
  {
    'opacity-50 cursor-not-allowed': props.disabled,
    'border-primary-500 ring-2 ring-primary-500/20': showSuggestions.value
  }
])

const iconClasses = computed(() => [
  'text-gray-400 transition-colors duration-200',
  {
    'text-primary-500': showSuggestions.value || localQuery.value
  }
])

const clearButtonClasses = computed(() => [
  'p-2 text-gray-400 hover:text-white transition-colors duration-200',
  'hover:bg-gray-700 rounded-full'
])

const searchButtonClasses = computed(() => [
  'p-2 text-white bg-primary-600 hover:bg-primary-700',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'rounded-full transition-colors duration-200'
])

const suggestionsClasses = computed(() => [
  'absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700',
  'rounded-lg shadow-xl max-h-80 overflow-y-auto z-50',
  'backdrop-blur-sm'
])

const suggestionItemClasses = computed(() => [
  'group w-full flex items-center space-x-3 px-3 py-2 text-left',
  'text-gray-300 hover:text-white hover:bg-gray-700',
  'transition-colors duration-150'
])

const getSuggestionItemClasses = (index) => [
  ...suggestionItemClasses.value,
  {
    'bg-gray-700 text-white': index === selectedSuggestionIndex.value
  }
]

// Métodos
const handleInput = () => {
  emit('update:modelValue', localQuery.value)
  selectedSuggestionIndex.value = -1
  
  if (localQuery.value.length >= 2) {
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}

const handleKeydown = (event) => {
  const suggestionsCount = suggestions.value.length + recentSearches.value.length

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (suggestionsCount > 0) {
        selectedSuggestionIndex.value = Math.min(
          selectedSuggestionIndex.value + 1,
          suggestionsCount - 1
        )
        scrollToSelectedSuggestion()
      }
      break

    case 'ArrowUp':
      event.preventDefault()
      if (suggestionsCount > 0) {
        selectedSuggestionIndex.value = Math.max(
          selectedSuggestionIndex.value - 1,
          -1
        )
        scrollToSelectedSuggestion()
      }
      break

    case 'Enter':
      event.preventDefault()
      if (selectedSuggestionIndex.value >= 0) {
        const allSuggestions = [
          ...(!localQuery.value ? recentSearches.value : []),
          ...suggestions.value
        ]
        selectSuggestion(allSuggestions[selectedSuggestionIndex.value])
      } else {
        handleSearch()
      }
      break

    case 'Escape':
      hideSuggestions()
      searchInput.value?.blur()
      break

    case 'Tab':
      if (showSuggestions.value) {
        hideSuggestions()
      }
      break
  }
}

const handleFocus = () => {
  showSuggestions.value = true
  emit('focus')
}

const handleBlur = () => {
  // Delay para permitir clicks en sugerencias
  setTimeout(() => {
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }, 200)
  emit('blur')
}

const handleSearch = () => {
  if (!canSearch.value || props.disabled) return

  updateSearchQuery(localQuery.value)
  hideSuggestions()
  emit('search', localQuery.value)
}

const clearSearch = () => {
  localQuery.value = ''
  emit('update:modelValue', '')
  emit('clear')
  updateSearchQuery('')
  hideSuggestions()
  searchInput.value?.focus()
}

const selectSuggestion = (suggestion) => {
  localQuery.value = suggestion
  emit('update:modelValue', suggestion)
  searchFromSuggestion(suggestion)
  hideSuggestions()
  emit('search', suggestion)
}

const removeFromHistory = (search) => {
  const index = searchHistory.value.indexOf(search)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
}

const applyQuickFilter = (filter) => {
  localQuery.value = filter.value
  emit('update:modelValue', filter.value)
  handleSearch()
}

const handleAdvancedSearch = () => {
  // Aquí se puede implementar lógica para búsqueda avanzada
  handleSearch()
}

const hideSuggestions = () => {
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
}

const scrollToSelectedSuggestion = () => {
  nextTick(() => {
    const selectedElement = suggestionRefs.value[selectedSuggestionIndex.value]
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  })
}

const highlightMatch = (text) => {
  if (!localQuery.value) return text
  
  const regex = new RegExp(`(${localQuery.value})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary-500/30 text-primary-300">$1</mark>')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  localQuery.value = newValue
})

watch(localQuery, (newValue) => {
  if (newValue !== searchQuery.value) {
    // Sync con el composable si es diferente
  }
})

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  if (props.autofocus) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Exponer métodos
defineExpose({
  focus: () => searchInput.value?.focus(),
  blur: () => searchInput.value?.blur(),
  clear: clearSearch
})
</script>

<style scoped>
/* Animaciones para sugerencias */
.suggestions-enter-active,
.suggestions-leave-active {
  transition: all 0.2s ease;
}

.suggestions-enter-from,
.suggestions-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Estilos para el highlight */
:deep(mark) {
  background-color: rgba(99, 102, 241, 0.3);
  color: rgb(165, 180, 252);
  border-radius: 2px;
  padding: 0 1px;
}

/* Scroll personalizado para sugerencias */
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

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors {
    transition: none;
  }
}

/* Focus visible mejorado */
input:focus-visible,
button:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .absolute.top-full {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    border-radius: 0.5rem 0.5rem 0 0;
    max-height: 60vh;
  }
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

/* Optimización de rendimiento */
.search-bar {
  contain: layout style paint;
}

/* Estados de hover mejorados */
.group:hover .opacity-0 {
  opacity: 1;
}

/* Backdrop blur para navegadores que lo soporten */
@supports (backdrop-filter: blur(4px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
}
</style>