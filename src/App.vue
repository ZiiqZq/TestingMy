<template>
  <!-- Loading screen -->
  <AppLoading v-if="!isAppReady" />

  <!-- Confirm Quit Modal -->
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
    v-if="showQuitConfirm"
  >
    <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
      <div class="flex items-center mb-4">
        <div class="bg-yellow-100 p-2 rounded-full mr-3">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800">Keluar dari Aplikasi</h3>
      </div>
      
      <p class="text-sm text-gray-600 mb-6">
        Anda yakin ingin keluar dari aplikasi?
      </p>
      
      <div class="flex justify-end space-x-3">
        <button 
          @click="handleQuitCancel"
          class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors text-sm font-medium"
        >
          Batal
        </button>
        <button 
          @click="handleQuitConfirm"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Keluar
        </button>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div v-if="isAppReady" id="app-main">
    <MainLayout />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLoading from './components/layouts/AppLoading.vue'
import MainLayout from './components/layouts/MainLayout.vue'

const isAppReady = ref(false)
const showQuitConfirm = ref(false)

const handleQuitConfirm = () => {
  showQuitConfirm.value = false
  if (window.electron) {
    window.electron.confirmQuit()
  }
}

const handleQuitCancel = () => {
  showQuitConfirm.value = false
  if (window.electron) {
    window.electron.cancelQuit()
  }
}

onMounted(() => {
  if (window.electron) {
    // Setup listener untuk before quit event
    window.electron.onBeforeQuit(() => {
      showQuitConfirm.value = true
    })

    // Tunggu event dari Electron
    // Jika tidak ada event, timeout sebagai fallback
    setTimeout(() => {
      isAppReady.value = true
    }, 1000)
  } else {
    // Untuk web biasa
    setTimeout(() => {
      isAppReady.value = true
    }, 800)
  }
})
</script>

<style>
/* Global styles tetap di sini jika perlu */
</style>