<template>
  <!-- Loading screen -->
  <AppLoading v-if="!isAppReady" />

  <!-- Confirm Logout & Quit Modal (teks diubah) -->
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]"
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
        <h3 class="text-lg font-bold text-gray-800">Konfirmasi Logout</h3>
      </div>
      
      <p v-if="!isLoggedIn" class="text-sm text-gray-600 mb-6">
        Apakah Anda yakin akan keluar dari aplikasi?
      </p>

      <p v-else class="text-sm text-gray-600 mb-6">
        Apakah Anda yakin akan logout dari aplikasi?
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
          Ya
        </button>
      </div>
    </div>
  </div>

  <!-- Login Modal (sama seperti sebelumnya) -->
  <div 
    v-if="isAppReady && !isLoggedIn"
    class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[200] backdrop-blur-sm"
  >
    <div class="bg-white rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
      <div class="flex justify-center items-center mb-4">
        <h1 class="text-[28px] font-bold text-gray-800">Login</h1>
        <!-- <button 
          @click="quitApp"
          class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          title="Keluar Aplikasi"
        >&times;</button> -->
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Input Badge Number</label>
        <input 
          v-model="badgeNumber"
          type="text"
          placeholder="Masukkan badge number"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f3e46]"
          @keyup.enter="login"
          autofocus
        />
      </div>
      <button 
        @click="login"
        :disabled="loading"
        class="w-full mt-4 bg-[#2f3e46] hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {{ loading ? 'Loading...' : 'Continue' }}
      </button>
      <p v-if="errorMsg" class="text-red-500 text-sm mt-3 text-center">{{ errorMsg }}</p>
    </div>
  </div>

  <!-- Main Content (hanya tampil jika siap dan sudah login) -->
  <div v-if="isAppReady && isLoggedIn" id="app-main">
    <MainLayout />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLoading from './components/layouts/AppLoading.vue'
import MainLayout from './components/layouts/MainLayout.vue'
import { useTestingSession } from './composables/useTestingSession.js'

const { clearSession, logout: logoutSession } = useTestingSession()

const isAppReady = ref(false)
const showQuitConfirm = ref(false)
const isLoggedIn = ref(false)
const badgeNumber = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function login() {
  if (!badgeNumber.value.trim()) {
    errorMsg.value = 'Badge number tidak boleh kosong'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const result = await window.electron.db.login({ 
      badgeNumber: badgeNumber.value.trim() 
    })
    if (result.success) {
      localStorage.setItem('user', JSON.stringify(result.user))
      isLoggedIn.value = true
    } else {
      errorMsg.value = result.message || 'Login gagal'
    }
  } catch (err) {
    errorMsg.value = 'Terjadi kesalahan'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function logout() {
  localStorage.removeItem('user')
  clearSession()
  isLoggedIn.value = false
  badgeNumber.value = ''
  errorMsg.value = ''
}

function quitApp() {
  if (confirm('Keluar dari aplikasi?')) {
    if (window.electron) {
      window.electron.confirmQuit()
    } else {
      window.close()
    }
  }
}

// Handle konfirmasi keluar: logout dulu, baru tutup aplikasi
const handleQuitConfirm = () => {
  showQuitConfirm.value = false
  // 1. Logout (hapus user & session testing)
  logout()
  // 2. Tutup aplikasi
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
    window.electron.onBeforeQuit(() => {
      showQuitConfirm.value = true
    })

    const user = localStorage.getItem('user')
    if (user) {
      isLoggedIn.value = true
    }

    setTimeout(() => {
      isAppReady.value = true
    }, 1000)
  } else {
    setTimeout(() => {
      isAppReady.value = true
    }, 800)
  }
})

// Ekspos logout ke window agar bisa dipanggil dari komponen lain (Account.vue)
if (typeof window !== 'undefined') {
  window.__appLogout = logout
}
</script>