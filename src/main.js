import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

// Crear la aplicación Vue
const app = createApp(App)

// Usar el router
app.use(router)

// Montar la aplicación
app.mount('#app')