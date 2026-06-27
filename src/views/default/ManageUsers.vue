<template>
  <div class="manage-users">
    <div class="header">
      <div></div>
      <div class="header-actions">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by badge or username..."
            class="search-input"
          />
          <span v-if="searchQuery" class="search-clear" @click="clearSearch">×</span>
        </div>
        <button @click="openModal('add')" class="btn-add">+ Add User</button>
      </div>
    </div>

    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>Badge Number</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>{{ user.badge_number || '-' }}</td>
            <td>{{ user.username || '-' }}</td>
            <td>
              <span :class="['role-badge', getRoleClass(user.role)]">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="actions">
              <button @click="openModal('edit', user)" class="icon-btn icon-edit" title="Edit user" aria-label="Edit user">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                </svg>
              </button>
              <button @click="confirmDelete(user)" class="icon-btn icon-delete" title="Delete user" aria-label="Delete user">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="4" class="no-data">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">Previous</button>
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">Next</button>
    </div>

    <!-- Modal Add/Edit -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ modalTitle }}</h3>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Badge Number *</label>
            <input v-model="form.badgeNumber" type="text" required />
          </div>
          <div class="form-group">
            <label>Username *</label>
            <input v-model="form.username" type="text" required />
          </div>
          <div class="form-group">
            <label>Role *</label>
            <select v-model="form.role" required>
              <option value="super_admin">Super Admin (Full Access + User Management)</option>
              <option value="admin">Admin (No User Management)</option>
              <option value="operator">Operator (Testing Only)</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content delete-modal">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete user <strong>{{ userToDelete?.username }}</strong>?</p>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="btn-cancel">Cancel</button>
          <button @click="performDelete" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const users = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const mode = ref('add')
const form = ref({
  id: null,
  badgeNumber: '',
  username: '',
  role: 'operator'
})

const showDeleteModal = ref(false)
const userToDelete = ref(null)

const toast = ref({ show: false, message: '', type: 'success' })
let toastTimeout = null

function showToast(message, type = 'success') {
  if (toastTimeout) clearTimeout(toastTimeout)
  toast.value = { show: true, message, type }
  toastTimeout = setTimeout(() => { toast.value.show = false }, 3000)
}

const currentPage = ref(1)
const itemsPerPage = 10

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const requesterRole = currentUser.role

// Safe filtering against null values
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value
  const q = searchQuery.value.toLowerCase().trim()
  return users.value.filter(u => {
    const badge = (u.badge_number || '').toLowerCase()
    const username = (u.username || '').toLowerCase()
    return badge.includes(q) || username.includes(q)
  })
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredUsers.value.slice(start, start + itemsPerPage)
})

const modalTitle = computed(() => mode.value === 'add' ? 'Add User' : 'Edit User')

async function loadUsers() {
  try {
    const result = await window.electron.db.getAllUsers(requesterRole)
    if (result.success) {
      users.value = result.data || []
      currentPage.value = 1
    } else {
      showToast(result.message || 'Failed to load users', 'error')
    }
  } catch {
    showToast('Error loading users', 'error')
  }
}

function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
}

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

function openModal(type, user = null) {
  mode.value = type
  if (type === 'edit' && user) {
    form.value = {
      id: user.id,
      badgeNumber: user.badge_number || '',
      username: user.username || '',
      role: user.role || 'operator'
    }
  } else {
    form.value = { id: null, badgeNumber: '', username: '', role: 'operator' }
  }
  showModal.value = true
}

async function saveUser() {
  try {
    let result
    if (mode.value === 'add') {
      result = await window.electron.db.createUser({
        badgeNumber: form.value.badgeNumber,
        username: form.value.username,
        role: form.value.role,
        requesterRole
      })
    } else {
      result = await window.electron.db.updateUser({
        userId: form.value.id,
        username: form.value.username,
        badgeNumber: form.value.badgeNumber,
        role: form.value.role,
        requesterRole
      })
    }
    if (result.success) {
      showToast('User saved successfully', 'success')
      closeModal()
      loadUsers()
    } else {
      showToast(result.message || 'Failed to save user', 'error')
    }
  } catch {
    showToast('Error saving user', 'error')
  }
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function performDelete() {
  if (!userToDelete.value) return

  // Cegah hapus user sendiri
  if (userToDelete.value.id === currentUser.id) {
    showToast('You cannot delete your own account', 'error')
    closeDeleteModal()
    return
  }

  try {
    const result = await window.electron.db.deleteUser({
      userId: userToDelete.value.id,
      requesterRole: currentUser.role
    })
    if (result.success) {
      showToast('User deleted successfully', 'success')
      loadUsers()
    } else {
      showToast(result.message || 'Failed to delete user', 'error')
    }
  } catch {
    showToast('Error deleting user', 'error')
  } finally {
    closeDeleteModal()
  }
}

function closeModal() { showModal.value = false }
function closeDeleteModal() {
  showDeleteModal.value = false
  userToDelete.value = null
}

function getRoleLabel(role) {
  const labels = { super_admin: 'Super Admin', admin: 'Admin', operator: 'Operator' }
  return labels[role] || role
}

function getRoleClass(role) {
  return {
    'role-super': role === 'super_admin',
    'role-admin': role === 'admin',
    'role-operator': role === 'operator'
  }
}

onMounted(() => loadUsers())
</script>

<style scoped>
.manage-users {
  padding: 20px;
  font-family: 'Inter', system-ui, sans-serif;
  background: #ffffff;
  color: #1f2a24;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2f4f3f;
}

.header-actions { display: flex; gap: 12px; align-items: center; }

.search-wrapper { position: relative; }

.search-input {
  padding: 8px 30px 8px 12px;
  border: 1px solid #d8e0db;
  border-radius: 8px;
  width: 260px;
  font-size: 14px;
  background: #ffffff;
  color: #1f2a24;
}

.search-input:focus {
  outline: none;
  border-color: #3c6e54;
  box-shadow: 0 0 0 2px rgba(60, 110, 84, 0.15);
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #8a958e;
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
}

.search-clear:hover { color: #7f1d1d; }

.btn-add {
  background: #2f4f3f;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-add:hover { background: #25402f; }

.user-table {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e3e9e5;
  background: #ffffff;
}

table { width: 100%; border-collapse: collapse; }

th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e3e9e5; }

th {
  background: #f4f7f5;
  font-weight: 600;
  color: #2f4f3f;
}

tbody tr:hover { background: #f7faf8; }

.actions { display: flex; gap: 8px; }

.icon-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8e0db;
  border-radius: 6px;
  background: #ffffff;
  color: #6f7d76;
  cursor: pointer;
  padding: 0;
}

.icon-btn svg { width: 15px; height: 15px; }

.icon-edit:hover { color: #2f4f3f; border-color: #2f4f3f; background: #eef3f0; }
.icon-delete:hover { color: #7f1d1d; border-color: #7f1d1d; background: #fbeeee; }

.no-data { text-align: center; color: #6b7280; padding: 32px; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #d8e0db;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  color: #1f2a24;
}

.page-btn:hover:not(:disabled) { background: #f4f7f5; border-color: #2f4f3f; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.page-info { font-size: 14px; color: #6f7d76; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(20, 35, 28, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin: 0 0 18px;
  color: #2f4f3f;
  font-size: 18px;
}

.form-group { margin-bottom: 16px; }

.form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #374151; }

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d8e0db;
  border-radius: 8px;
  color: #1f2a24;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3c6e54;
  box-shadow: 0 0 0 2px rgba(60, 110, 84, 0.15);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  background: #9ca3af;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel:hover { background: #6b7280; }

.btn-save {
  background: #2f4f3f;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save:hover { background: #25402f; }

.btn-delete {
  background: #7f1d1d;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-delete:hover { background: #651616; }

.role-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  color: #ffffff;
}

.role-super { background: #2f4f3f; }
.role-admin { background: #5a7864; }
.role-operator { background: #8fa599; }

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  z-index: 1100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.success { background: #2f4f3f; }
.toast.error { background: #7f1d1d; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { transform: translateX(100%); opacity: 0; }

.delete-modal p { margin: 16px 0; color: #374151; }
</style>