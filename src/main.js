// src/main.js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'  // Import router

// Gabungkan router ke aplikasi
createApp(App)
    .use(router)  // Tambahkan router
    .mount('#app')