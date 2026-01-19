<script setup>
  import { ref } from 'vue'

  defineProps({
    msg: String,
  })

  const count = ref(0)
</script>

<template>
  <div class="w-full min-h-full bg-gradient-to-b from-gray-900 to-black">

    <!-- Hero Section -->
    <div class="hero-section w-full">
      <!-- HAPUS container dari div ini, biarkan konten langsung -->
      <div class="px-6 py-16 w-full"> <!-- ← w-full dan px untuk padding -->
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 text-center">
          {{ msg }}
        </h1>
        <p class="text-xl text-gray-300 mb-10 text-center max-w-3xl mx-auto">
          Aplikasi desktop modern dengan Vue 3, Electron, dan Tailwind CSS
        </p>
      </div>
    </div>

    <!-- Content Sections - GUNAKAN w-full TANPA container mx-auto -->
    <div class="w-full px-6 py-12"> <!-- ← HAPUS container, GUNAKAN w-full -->

      <!-- Counter Card - PAKAI mx-auto UNTUK PUSATKAN TAPI BACKGROUND FULL -->
      <div class="w-full mb-12">
        <div class="max-w-4xl mx-auto"> <!-- ← mx-auto hanya untuk lebar konten -->
          <div class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl">
            <h2 class="text-3xl font-bold text-white mb-6 text-center">Counter Demo</h2>
            <div class="flex flex-col md:flex-row items-center justify-center gap-6">
              <button type="button" @click="count++"
                class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                🎯 Count is {{ count }}
              </button>
              <p class="text-gray-300">
                Coba klik tombol! Counter: <span class="text-2xl font-bold text-green-400">{{ count }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Grid - FULL WIDTH -->
      <div class="w-full mb-12 px-4"> <!-- ← w-full -->
        <h2 class="text-4xl font-bold text-white mb-8 text-center">✨ Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div class="feature-card">
            <div class="p-8 bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-2xl border border-blue-700/30">
              <div class="text-4xl mb-4">⚡</div>
              <h3 class="text-2xl font-bold text-white mb-3">Super Fast</h3>
              <p class="text-gray-300">Dibangun dengan Vite untuk kecepatan development maksimal</p>
            </div>
          </div>

          <div class="feature-card">
            <div
              class="p-8 bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-2xl border border-purple-700/30">
              <div class="text-4xl mb-4">💻</div>
              <h3 class="text-2xl font-bold text-white mb-3">Cross Platform</h3>
              <p class="text-gray-300">Berjalan di Windows, macOS, dan Linux dengan Electron</p>
            </div>
          </div>

          <div class="feature-card">
            <div class="p-8 bg-gradient-to-br from-teal-900/50 to-teal-800/30 rounded-2xl border border-teal-700/30">
              <div class="text-4xl mb-4">🎨</div>
              <h3 class="text-2xl font-bold text-white mb-3">Modern UI</h3>
              <p class="text-gray-300">Tailwind CSS untuk design yang responsif dan menarik</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TEST Section - FULL WIDTH TANPA CONTAINER -->
      <div class="w-full mb-12 px-4"> <!-- ← w-full -->
        <div class="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-10 text-center">
          <p class="text-3xl font-bold text-white">🎉 TEST MUNCUL dengan Tailwind! 🎉</p>
          <p class="text-xl text-white/90 mt-4">Semua berjalan dengan sempurna!</p>
        </div>
      </div>

      <!-- Documentation Links -->
      <div class="w-full mb-12 px-4"> <!-- ← w-full -->
        <h2 class="text-3xl font-bold text-white mb-8 text-center">Documentation & Resources</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank" class="doc-card group">
            <div
              class="p-8 bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-2xl border border-blue-700/30 hover:border-blue-500 transition-all">
              <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-blue-300">Vue.js Documentation</h3>
              <p class="text-gray-300 mb-4">Pelajari framework Vue.js dengan contoh dan tutorial interaktif</p>
              <span class="inline-flex items-center text-blue-400">
                Buka dokumentasi
                <svg class="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </a>

          <a href="https://tailwindcss.com/docs" target="_blank" class="doc-card group">
            <div
              class="p-8 bg-gradient-to-br from-teal-900/40 to-teal-800/20 rounded-2xl border border-teal-700/30 hover:border-teal-500 transition-all">
              <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-teal-300">Tailwind CSS Docs</h3>
              <p class="text-gray-300 mb-4">Utility-first CSS framework untuk development yang cepat</p>
              <span class="inline-flex items-center text-teal-400">
                Buka dokumentasi
                <svg class="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </div>

      <!-- Navigation to About -->
      <div class="w-full text-center py-12 px-4"> <!-- ← w-full -->
        <router-link to="/about"
          class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
          <span>🚀 Explore About Page</span>
          <svg class="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
  /* Hero Section dengan gradient - UPDATE KE 100% */
  .hero-section {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    width: 100%;
    /* ← PASTIKAN 100% */
  }

  /* Animasi untuk cards */
  .feature-card {
    transition: transform 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-10px);
  }
</style>