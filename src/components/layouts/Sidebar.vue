<template>
  <div 
    class="mt-2 fixed inset-y-0 left-0 z-10 flex flex-col items-center w-[3.75rem] h-screen overflow-y-auto overflow-x-visible sidebar-scroll text-[#52796F] bg-gray-100 border-r border-gray-100" 
    id="sidebar"
  >
    <!-- Logo -->
    <router-link to="/" class="flex items-center justify-center mt-4 mb-2" title="Home"
      :class="{ 'active': $route.path === '/' }">
      <svg class="w-8 h-8 fill-current text-[#354F52]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
        fill="currentColor">
        <path
          d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
      </svg>
    </router-link>

    <!-- Main Navigation (tanpa Menu) -->
    <div class="flex flex-col items-center border-t pt-2 border-gray-300 w-full">
      <!-- Dashboard -->
      <router-link to="/"
        class="sidebar-btn flex items-center justify-center w-12 h-12 mt-2 rounded-lg hover:bg-[#CAD2C5] transition-colors"
        :class="{ 
          'active': $route.path === '/' || $route.path === '/dashboard',
          'bg-[#dad7cd] text-[#2f3e46]': $route.path === '/' || $route.path === '/dashboard'
        }" title="Dashboard">
        <svg class="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </router-link>

      <!-- Testing -->
      <router-link
        to="/testing"
        class="sidebar-btn grid place-items-center w-12 h-12 mt-2 rounded-lg hover:bg-[#CAD2C5] transition-colors"
        :class="{
          'active': $route.path === '/testing',
          'bg-[#dad7cd] text-[#2f3e46]': $route.path === '/testing'
        }" title="Testing">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 386 386" xmlns="http://www.w3.org/2000/svg">
          <path d="M298.666667,85.3333333 L298.666667,384 L1.42108547e-14,384 L1.42108547e-14,85.3333333 L298.666667,85.3333333 Z M256,128 L42.6666667,128 L42.6666667,341.333333 L256,341.333333 L256,128 Z M196.674799,157.339839 L229.991868,183.993494 L131.331707,307.318696 L72.0065057,259.858535 L98.660161,226.541465 L124.650667,247.36 L196.674799,157.339839 Z M384,0 L384,256 L341.333333,256 L341.333333,42.6666667 L128,42.6666667 L128,0 L384,0 Z" />
        </svg>
      </router-link>

      <!-- View -->
      <router-link to="/test-result"
        class="sidebar-btn flex items-center justify-center w-12 h-12 mt-2 rounded-lg hover:bg-[#CAD2C5] transition-colors"
        :class="{ 
          'active': $route.path === '/test-result',
          'bg-[#dad7cd] text-[#2f3e46]': $route.path === '/test-result'
        }" title="View">
        <svg class="w-6 h-6 stroke-current" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" />
          <path d="M21 12C21 12 20 4 12 4C4 4 3 12 3 12" stroke="currentColor" />
        </svg>
      </router-link>

      <!-- Analytics -->
      <router-link
        v-if="canViewResults"
        to="/analytics"
        class="sidebar-btn grid place-items-center w-12 h-12 mt-2 rounded-lg hover:bg-[#CAD2C5] transition-colors"
        :class="{ 
          'active': $route.path === '/analytics',
          'bg-[#dad7cd] text-[#2f3e46]': $route.path === '/analytics'
        }" title="Analytics">
        <svg class="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor" stroke-width="2">
          <path d="M3 3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 16L12.25 10.75L15.75 14.25L21 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </router-link>

    </div>

    <!-- Bagian bawah: Menu, About, Account -->
    <div class="mt-auto mb-4 flex flex-col items-center">
      <!-- Menu Button dengan Dropdown -->
      <div class="dropdown-container relative w-full flex justify-center" v-if="canManage">
        <button 
          ref="menuButtonRef"
          @click="toggleMenu"
          class="sidebar-btn menu-dropdown-btn flex items-center justify-center w-12 h-12 rounded-full hover:bg-[#CAD2C5] transition-colors"
          :class="{ 
            'active': isMenuActive,
            'bg-[#dad7cd] text-[#2f3e46]': isMenuActive
          }" title="Menu">
          <svg class="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </button>

        <!-- Dropdown Menu dengan posisi fixed dinamis -->
        <div 
          v-show="isMenuOpen" 
          class="dropdown-menu-fixed" 
          :style="dropdownStyle"
        >
          <router-link v-if="canManage" to="/add-product"
            class="dropdown-item flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#f8fafc] transition-colors border-b border-gray-100"
            :class="{ 'bg-[#f1f5f9]': $route.path === '/add-product' }" @click="closeMenu">
            <svg class="w-6 h-6 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 10C3 8.34315 4.34315 7 6 7H14C15.6569 7 17 8.34315 17 10V18C17 19.6569 15.6569 21 14 21H6C4.34315 21 3 19.6569 3 18V10Z"
                stroke="#84A98C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M10 14V11M10 14V17M10 14H13M10 14H7" stroke="#84A98C" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M7 3L18 3C19.6569 3 21 4.34315 21 6L21 17" stroke="#84A98C" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="flex flex-col items-start">
              <span class="font-medium">Add Product</span>
            </div>
          </router-link>

          <router-link v-if="canManage" to="/generate"
            class="dropdown-item flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#f8fafc] transition-colors border-b border-gray-100"
            :class="{ 'bg-[#f1f5f9]': $route.path === '/generate' }" @click="closeMenu">
            <svg class="w-6 h-6 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 9L20 9M8 9V20M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.0799 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z"
                stroke="#84A98C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="flex flex-col items-start">
              <span class="font-medium">Generate Column</span>
            </div>
          </router-link>

          <router-link v-if="canManageUsers" to="/manage-users"
            class="dropdown-item flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#f8fafc] transition-colors border-b border-gray-100"
            :class="{ 'bg-[#f1f5f9]': $route.path === '/manage' }" @click="closeMenu">
            <svg class="w-6 h-6 mr-4" fill="#84A98C" viewBox="0 -64 640 640" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M610.5 373.3c2.6-14.1 2.6-28.5 0-42.6l25.8-14.9c3-1.7 4.3-5.2 3.3-8.5-6.7-21.6-18.2-41.2-33.2-57.4-2.3-2.5-6-3.1-9-1.4l-25.8 14.9c-10.9-9.3-23.4-16.5-36.9-21.3v-29.8c0-3.4-2.4-6.4-5.7-7.1-22.3-5-45-4.8-66.2 0-3.3.7-5.7 3.7-5.7 7.1v29.8c-13.5 4.8-26 12-36.9 21.3l-25.8-14.9c-2.9-1.7-6.7-1.1-9 1.4-15 16.2-26.5 35.8-33.2 57.4-1 3.3.4 6.8 3.3 8.5l25.8 14.9c-2.6 14.1-2.6 28.5 0 42.6l-25.8 14.9c-3 1.7-4.3 5.2-3.3 8.5 6.7 21.6 18.2 41.1 33.2 57.4 2.3 2.5 6 3.1 9 1.4l25.8-14.9c10.9 9.3 23.4 16.5 36.9 21.3v29.8c0 3.4 2.4 6.4 5.7 7.1 22.3 5 45 4.8 66.2 0 3.3-.7 5.7-3.7 5.7-7.1v-29.8c13.5-4.8 26-12 36.9-21.3l25.8 14.9c2.9 1.7 6.7 1.1 9-1.4 15-16.2 26.5-35.8 33.2-57.4 1-3.3-.4-6.8-3.3-8.5l-25.8-14.9zM496 400.5c-26.8 0-48.5-21.8-48.5-48.5s21.8-48.5 48.5-48.5 48.5 21.8 48.5 48.5-21.7 48.5-48.5 48.5zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm201.2 226.5c-2.3-1.2-4.6-2.6-6.8-3.9l-7.9 4.6c-6 3.4-12.8 5.3-19.6 5.3-10.9 0-21.4-4.6-28.9-12.6-18.3-19.8-32.3-43.9-40.2-69.6-5.5-17.7 1.9-36.4 17.9-45.7l7.9-4.6c-.1-2.6-.1-5.2 0-7.8l-7.9-4.6c-16-9.2-23.4-28-17.9-45.7.9-2.9 2.2-5.8 3.2-8.7-3.8-.3-7.5-1.2-11.4-1.2h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c10.1 0 19.5-3.2 27.2-8.5-1.2-3.8-2-7.7-2-11.8v-9.2z" />
            </svg>
            <div class="flex flex-col items-start">
              <span class="font-medium">Manage Users</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- About -->
      <router-link to="/about"
        class="sidebar-btn flex items-center justify-center w-12 h-12 mt-2 rounded-full hover:bg-[#CAD2C5] transition-colors"
        :class="{ 
          'active': $route.path === '/about',
          'bg-[#dad7cd] text-[#2f3e46]': $route.path === '/about'
        }" title="About">
        <svg class="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </router-link>

      <!-- Account -->
      <router-link to="/account"
        class="sidebar-btn flex items-center justify-center w-12 h-12 mt-2 rounded-full hover:bg-[#CAD2C5] transition-colors"
        :class="{ 
          'bg-[#dad7cd]': $route.path === '/account'
        }" title="Account">
        <svg class="w-6 h-6 stroke-current text-[#52796F]" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const isMenuOpen = ref(false)
  const menuButtonRef = ref(null)
  const dropdownStyle = ref({
    display: 'none'
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const canManage = computed(() => user.role === 'super_admin' || user.role === 'admin')
  const canManageUsers = computed(() => user.role === 'super_admin')
  const canViewResults = computed(() => user.role === 'super_admin' || user.role === 'admin')

  const isMenuActive = computed(() => {
    const menuPages = ['/add-product', '/generate', '/manage']
    return menuPages.includes(route.path)
  })

  function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
    if (isMenuOpen.value) {
      nextTick(() => {
        const rect = menuButtonRef.value?.getBoundingClientRect()
        if (rect) {
          dropdownStyle.value = {
            position: 'fixed',
            left: (rect.right + 8) + 'px',
            top: (rect.top + rect.height / 2) + 'px',
            transform: 'translateY(-50%)',
            zIndex: 99999,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            padding: '8px 0',
            width: '240px',
            display: 'block'
          }
        }
      })
    } else {
      dropdownStyle.value = {
        display: 'none'
      }
    }
  }

  function closeMenu() {
    isMenuOpen.value = false
    dropdownStyle.value = {
      display: 'none'
    }
  }

  function handleClickOutside(event) {
    const container = document.querySelector('.dropdown-container')
    const button = document.querySelector('.menu-dropdown-btn')
    if (container && !container.contains(event.target) && !button?.contains(event.target)) {
      closeMenu()
    }
  }

  watch(() => route.path, closeMenu)

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen.value) closeMenu()
    })
    // Update posisi dropdown jika window di-resize
    window.addEventListener('resize', () => {
      if (isMenuOpen.value) {
        // tutup dan buka ulang agar posisi update
        closeMenu()
        // setelah close, kita bisa buka lagi? lebih baik tidak otomatis, biar user klik ulang
        // alternatif: hitung ulang posisi tanpa toggle
        const rect = menuButtonRef.value?.getBoundingClientRect()
        if (rect) {
          dropdownStyle.value = {
            ...dropdownStyle.value,
            left: (rect.right + 8) + 'px',
            top: (rect.top + rect.height / 2) + 'px',
          }
        }
      }
    })
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', () => {})
    window.removeEventListener('resize', () => {})
  })
</script>

<style scoped>
  .sidebar-btn.active {
    background-color: #dad7cd !important;
    color: #2f3e46 !important;
  }

  .sidebar-btn {
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    outline: none;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .router-link-active.sidebar-btn {
    background-color: #dad7cd !important;
    color: #2f3e46 !important;
  }

  .dropdown-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .dropdown-menu-fixed {
    transition: opacity 0.2s ease;
  }

  .dropdown-item {
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    background: none;
    text-align: left;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 12px 16px;
    text-decoration: none;
  }

  .dropdown-item:hover {
    background-color: #f1f5f9;
  }

  .router-link-active.dropdown-item {
    background-color: #f1f5f9 !important;
  }

  .sidebar-scroll {
    overflow-x: visible;
    overflow-y: auto;
  }

  .sidebar-scroll::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }

  .sidebar-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .sidebar-scroll>* {
    max-width: 100%;
    box-sizing: border-box;
  }
</style>