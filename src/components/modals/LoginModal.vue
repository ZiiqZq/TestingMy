<!-- src/components/modals/LoginModal.vue -->
<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Login Aplikasi</h2>
        <button class="close-btn" @click="quitApp" title="Keluar Aplikasi">✕</button>
      </div>
      <div class="modal-body">
        <div class="input-group">
          <label>Badge Number</label>
          <input 
            v-model="badgeNumber" 
            type="text" 
            placeholder="Masukkan badge number"
            @keyup.enter="login"
            autofocus
          />
        </div>
        <button @click="login" :disabled="loading" class="login-btn">
          {{ loading ? 'Memproses...' : 'Continue' }}
        </button>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps(['visible'])
const emit = defineEmits(['login-success', 'close'])

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
    const result = await window.electron.db.login({ badgeNumber: badgeNumber.value.trim() })
    if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user))
        emit('login-success', result.user)
    } else {
        errorMsg.value = result.message || 'Login gagal'
    }
  } catch (err) {
    errorMsg.value = 'Terjadi kesalahan'
  } finally {
    loading.value = false
  }
}

function quitApp() {
  if (confirm('Keluar dari aplikasi?')) {
    window.electron.confirmQuit()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 20px 35px rgba(0,0,0,0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #dc3545;
}

.modal-body {
  padding: 24px 20px 28px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 16px;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

.login-btn {
  width: 100%;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #dc3545;
  font-size: 13px;
  margin-top: 16px;
  text-align: center;
}
</style>