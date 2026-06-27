<template>
  <div class="account-container">
    <div class="account-card">
      <div class="account-header">
        <div class="avatar">
          <span>{{ userInitials }}</span>
        </div>
        <h2>{{ user.username }}</h2>
        <p class="badge">Badge: {{ user.badge_number }}</p>
      </div>
      
      <div class="account-info">
        <div class="info-row">
          <span class="label">Registered As:</span>
          <span class="value role-badge" :class="roleClass">
            {{ roleLabel }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Created at:</span>
          <span class="value">{{ formattedDate }}</span>
        </div>
      </div>
      
      <button @click="logout" class="logout-btn">
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const user = ref({})

const userInitials = computed(() => {
  return user.value.username ? user.value.username.charAt(0).toUpperCase() : '?'
})

const roleLabel = computed(() => {
  const roles = {
    super_admin: 'Super Admin (Full Access)',
    admin: 'Admin (Without User Management)',
    operator: 'Operator (Only Testing)'
  }
  return roles[user.value.role] || user.value.role
})

const roleClass = computed(() => {
  return {
    'role-super': user.value.role === 'super_admin',
    'role-admin': user.value.role === 'admin',
    'role-operator': user.value.role === 'operator'
  }
})

const formattedDate = computed(() => {
  if (!user.value.created_at) return '-'
  return new Date(user.value.created_at).toLocaleDateString('id-ID')
})

function logout() {
  if (window.__appLogout) {
    window.__appLogout()
  } else {
    localStorage.removeItem('user')
    window.location.reload()
  }
}

onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) {
    user.value = JSON.parse(stored)
  }
})
</script>

<style scoped>
.account-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.account-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  padding: 32px;
  text-align: center;
}

.account-header {
  margin-bottom: 32px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.avatar span {
  font-size: 36px;
  font-weight: bold;
  color: white;
}

.account-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.badge {
  color: #666;
  font-size: 14px;
}

.account-info {
  text-align: left;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
}

.value {
  color: #333;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.role-super {
  background: #dc3545;
  color: white;
}

.role-admin {
  background: #ffc107;
  color: #333;
}

.role-operator {
  background: #28a745;
  color: white;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c82333;
}
</style>