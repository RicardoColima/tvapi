# 📺 TV Series App

Una aplicación web moderna para descubrir, explorar y gestionar tu colección de series de televisión favoritas. Construida con Vue.js 3 y diseñada con una interfaz elegante y responsiva.

## ✨ Características Principales

- 🔍 **Búsqueda Inteligente**: Busca series por nombre con resultados en tiempo real
- 📱 **Diseño Responsivo**: Interfaz optimizada para dispositivos móviles y desktop
- ⭐ **Sistema de Favoritos**: Guarda y gestiona tus series favoritas
- 📊 **Información Detallada**: Visualiza información completa de cada serie
- 🎨 **Interfaz Moderna**: Diseño elegante con Tailwind CSS
- ⚡ **Rendimiento Optimizado**: Carga rápida y navegación fluida
- 🌐 **API Externa**: Integración con TVMaze API para datos actualizados

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Vue.js 3** - Framework progresivo de JavaScript
- **Vue Router 4** - Enrutamiento oficial para Vue.js
- **Composition API** - API moderna de Vue para mejor organización del código

### Estilos y UI
- **Tailwind CSS** - Framework de CSS utilitario
- **Lucide Vue Next** - Iconos modernos y elegantes
- **PostCSS** - Procesador de CSS
- **Autoprefixer** - Prefijos automáticos para compatibilidad

### Herramientas de Desarrollo
- **Vite** - Herramienta de construcción rápida
- **Node.js** - Entorno de ejecución
- **npm** - Gestor de paquetes

### API Externa
- **TVMaze API** - Base de datos de series de televisión

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/RicardoColima/tvapi.git
   cd tvapi
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**
   ```
   http://localhost:3000
   ```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run preview      # Previsualiza la build de producción
```

## 📖 Uso de la Aplicación

### Página Principal
- **Series Populares**: Explora una selección curada de series populares
- **Búsqueda**: Utiliza la barra de búsqueda para encontrar series específicas
- **Filtros**: Filtra series por género, estado, y otros criterios

### Búsqueda de Series
1. Escribe el nombre de la serie en la barra de búsqueda
2. Los resultados aparecen automáticamente mientras escribes
3. Haz clic en cualquier serie para ver sus detalles completos

### Detalles de Serie
- **Información General**: Título, resumen, géneros, calificación
- **Datos Técnicos**: Fecha de estreno, estado, red de transmisión
- **Episodios**: Lista completa de episodios organizados por temporadas
- **Reparto**: Información del elenco principal

### Gestión de Favoritos
- Haz clic en el ícono de corazón para agregar/quitar de favoritos
- Accede a tu lista de favoritos desde el menú principal
- Gestiona tu colección personal de series

## 📁 Estructura del Proyecto

```
tvapi/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── AppHeader.vue    # Cabecera de la aplicación
│   │   ├── AppLayout.vue    # Layout principal
│   │   ├── SearchBar.vue    # Barra de búsqueda
│   │   ├── SearchResults.vue # Resultados de búsqueda
│   │   ├── SerieCard.vue    # Tarjeta de serie
│   │   ├── SerieDetail.vue  # Detalles de serie
│   │   └── ...
│   ├── composables/         # Lógica reutilizable
│   │   ├── useApi.js        # Gestión de API
│   │   ├── useSearch.js     # Lógica de búsqueda
│   │   └── useFavorites.js  # Gestión de favoritos
│   ├── views/               # Páginas principales
│   │   ├── HomeView.vue     # Página de inicio
│   │   ├── SerieDetailView.vue # Página de detalles
│   │   └── FavoritesView.vue # Página de favoritos
│   ├── router/              # Configuración de rutas
│   ├── utils/               # Utilidades y helpers
│   └── assets/              # Recursos estáticos
├── public/                  # Archivos públicos
└── ...
```

## 🔌 API y Datos

### TVMaze API
La aplicación utiliza la [TVMaze API](https://www.tvmaze.com/api) para obtener información actualizada sobre series de televisión:

- **Búsqueda de Series**: `GET /search/shows?q={query}`
- **Detalles de Serie**: `GET /shows/{id}`
- **Episodios**: `GET /shows/{id}/episodes`
- **Reparto**: `GET /shows/{id}/cast`

### Gestión de Estado
- **Composables**: Utiliza la Composition API para gestionar estado reactivo
- **Cache Local**: Implementa cache para optimizar las consultas a la API
- **Persistencia**: Los favoritos se guardan en localStorage

## ✅ Funcionalidades Implementadas

### Core Features
- ✅ Búsqueda de series en tiempo real
- ✅ Visualización de series populares
- ✅ Detalles completos de series
- ✅ Sistema de favoritos
- ✅ Navegación entre páginas
- ✅ Diseño responsivo

### Características Técnicas
- ✅ Debounce en búsquedas
- ✅ Lazy loading de imágenes
- ✅ Manejo de errores
- ✅ Estados de carga
- ✅ Cache de resultados
- ✅ Optimización de rendimiento

### UI/UX
- ✅ Interfaz moderna y elegante
- ✅ Animaciones suaves
- ✅ Feedback visual
- ✅ Accesibilidad básica
- ✅ Modo oscuro por defecto

## 🔮 Próximas Funcionalidades

- [ ] Sistema de recomendaciones
- [ ] Filtros avanzados
- [ ] Modo claro/oscuro
- [ ] Compartir series en redes sociales
- [ ] Notificaciones de nuevos episodios
- [ ] Integración con más APIs
- [ ] PWA (Progressive Web App)

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Ricardo Colima**
- GitHub: [@RicardoColima](https://github.com/RicardoColima)

## 🙏 Agradecimientos

- [TVMaze](https://www.tvmaze.com/) por proporcionar la API gratuita
- [Vue.js](https://vuejs.org/) por el excelente framework
- [Tailwind CSS](https://tailwindcss.com/) por el sistema de diseño
- [Lucide](https://lucide.dev/) por los iconos elegantes

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!