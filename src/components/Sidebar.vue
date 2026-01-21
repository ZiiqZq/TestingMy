<template>
  <div class="mt-2 fixed inset-y-0 left-0 z-10 flex flex-col items-center w-[3.75rem] h-screen overflow-y-hidden sidebar-scroll 
              text-[#52796F] bg-gray-100 border-r border-gray-100" id="sidebar">

    <!-- Logo -->
    <router-link to="/" class="flex items-center justify-center mt-4 mb-2" title="Home"
      :class="{ 'active': $route.path === '/' }">
      <svg class="w-8 h-8 fill-current text-[#354F52]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
        fill="currentColor">
        <path
          d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
      </svg>
    </router-link>

    <!-- Main Navigation -->
    <div class="flex flex-col items-center border-t pt-2 border-gray-300 w-full">

      <!-- Dashboard Button -->
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

      <!-- Menu Button with Dropdown -->
      <div class="dropdown-container relative w-full">
        <button @click="toggleMenu"
          class="sidebar-btn menu-dropdown-btn flex items-center justify-center w-12 h-12 mt-2 rounded-lg hover:bg-[#CAD2C5] transition-colors"
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

        <!-- Dropdown Menu -->
        <div v-show="isMenuOpen" class="dropdown-menu bg-[#CAD2C5]">

          <router-link to="/add-product"
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

          <router-link to="/generate"
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

          <router-link to="/manage"
            class="dropdown-item flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#f8fafc] transition-colors border-b border-gray-100"
            :class="{ 'bg-[#f1f5f9]': $route.path === '/manage' }" @click="closeMenu">
            <svg class="w-6 h-6 mr-4" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <title>product-management</title>
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="icon" fill="#84A98C" transform="translate(42.666667, 34.346667)">
                    <path
                      d="M426.247658,366.986259 C426.477599,368.072636 426.613335,369.17172 426.653805,370.281095 L426.666667,370.986667 L426.666667,392.32 C426.666667,415.884149 383.686003,434.986667 330.666667,434.986667 C278.177524,434.986667 235.527284,416.264289 234.679528,393.025571 L234.666667,392.32 L234.666667,370.986667 L234.679528,370.281095 C234.719905,369.174279 234.855108,368.077708 235.081684,366.992917 C240.961696,371.41162 248.119437,375.487081 256.413327,378.976167 C275.772109,387.120048 301.875889,392.32 330.666667,392.32 C360.599038,392.32 387.623237,386.691188 407.213205,377.984536 C414.535528,374.73017 420.909655,371.002541 426.247658,366.986259 Z M192,7.10542736e-15 L384,106.666667 L384.001134,185.388691 C368.274441,181.351277 350.081492,178.986667 330.666667,178.986667 C301.427978,178.986667 274.9627,184.361969 255.43909,193.039129 C228.705759,204.92061 215.096345,223.091357 213.375754,241.480019 L213.327253,242.037312 L213.449,414.75 L192,426.666667 L-2.13162821e-14,320 L-2.13162821e-14,106.666667 L192,7.10542736e-15 Z M426.247658,302.986259 C426.477599,304.072636 426.613335,305.17172 426.653805,306.281095 L426.666667,306.986667 L426.666667,328.32 C426.666667,351.884149 383.686003,370.986667 330.666667,370.986667 C278.177524,370.986667 235.527284,352.264289 234.679528,329.025571 L234.666667,328.32 L234.666667,306.986667 L234.679528,306.281095 C234.719905,305.174279 234.855108,304.077708 235.081684,302.992917 C240.961696,307.41162 248.119437,311.487081 256.413327,314.976167 C275.772109,323.120048 301.875889,328.32 330.666667,328.32 C360.599038,328.32 387.623237,322.691188 407.213205,313.984536 C414.535528,310.73017 420.909655,307.002541 426.247658,302.986259 Z M127.999,199.108 L128,343.706 L170.666667,367.410315 L170.666667,222.811016 L127.999,199.108 Z M42.6666667,151.701991 L42.6666667,296.296296 L85.333,320.001 L85.333,175.405 L42.6666667,151.701991 Z M330.666667,200.32 C383.155809,200.32 425.80605,219.042377 426.653805,242.281095 L426.666667,242.986667 L426.666667,264.32 C426.666667,287.884149 383.686003,306.986667 330.666667,306.986667 C278.177524,306.986667 235.527284,288.264289 234.679528,265.025571 L234.666667,264.32 L234.666667,242.986667 L234.808715,240.645666 C237.543198,218.170241 279.414642,200.32 330.666667,200.32 Z M275.991,94.069 L150.412,164.155 L192,187.259259 L317.866667,117.333333 L275.991,94.069 Z M192,47.4074074 L66.1333333,117.333333 L107.795,140.479 L233.373,70.393 L192,47.4074074 Z"
                      id="Combined-Shape"> </path>
                  </g>
                </g>
              </g>
            </svg>
            <div class="flex flex-col items-start">
              <span class="font-medium">Manage Product</span>
            </div>
          </router-link>

        </div>
      </div>

      <!-- Test Button -->
      <router-link to="/testing"
        class="sidebar-btn flex items-center justify-center w-12 h-12 mt-2 rounded-lg hover:bg-[#CAD2C5] transition-colors"
        :class="{ 'active': $route.path === '/testing','bg-[#dad7cd] text-[#2f3e46]': $route.path === '/testing'}"
        title="Testing">
        <svg class="w-6 h-6 stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </router-link>

      <!-- View Button -->
      <router-link to="/view"
        class="sidebar-btn flex items-center justify-center w-12 h-12 mt-2 rounded-lg hover:bg-[#CAD2C5] transition-colors"
        :class="{ 
          'active': $route.path === '/view',
          'bg-[#dad7cd] text-[#2f3e46]': $route.path === '/view'
        }" title="View">
        <svg class="w-6 h-6 stroke-current" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" />
          <path d="M21 12C21 12 20 4 12 4C4 4 3 12 3 12" stroke="currentColor" />
        </svg>
      </router-link>


    </div>

    <div class="mt-auto mb-4">
      <!-- About Button -->
      <router-link to="/about"
        class="sidebar-btn flex items-center justify-center w-12 h-12 mb-1 rounded-full hover:bg-[#CAD2C5] transition-colors"
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
        class="sidebar-btn flex items-center justify-center w-12 h-12 rounded-full hover:bg-[#CAD2C5] transition-colors"
        :class="{ 
          'bg-[#dad7cd]': $route.path === '/account'
        }" title="My Account">
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
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const isMenuOpen = ref(false)

  // Computed property untuk cek apakah menu button harus aktif
  const isMenuActive = computed(() => {
    const menuPages = ['/add-product', '/generate', '/manage']
    return menuPages.includes(route.path)
  })

  // Toggle dropdown menu
  function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
  }

  function closeMenu() {
    isMenuOpen.value = false
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    const dropdown = document.querySelector('.dropdown-container')
    const button = document.querySelector('.menu-dropdown-btn')

    if (dropdown &&
      !dropdown.contains(event.target) &&
      !button.contains(event.target)) {
      isMenuOpen.value = false
    }
  }

  // Auto close dropdown when route changes
  watch(() => route.path, () => {
    isMenuOpen.value = false
  })

  // Setup click outside listener
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)

    // Close dropdown with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen.value) {
        isMenuOpen.value = false
      }
    })
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', () => { })
  })
</script>

<style scoped>
  /* Active state styling */
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

  /* Router link active class */
  .router-link-active.sidebar-btn {
    background-color: #dad7cd !important;
    color: #2f3e46 !important;
  }

  /* Dropdown Styles */
  .dropdown-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .dropdown-menu {
    position: fixed !important;
    left: 60px !important;
    top: 96px !important;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    width: 240px;
    z-index: 10000;
    opacity: 1;
    transform: translateY(0);
    transition: all 0.2s ease-in-out;
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

  /* Active state untuk dropdown items */
  .router-link-active.dropdown-item {
    background-color: #f1f5f9 !important;
  }

  /* Scrollbar */
  .sidebar-scroll {
    overflow-x: hidden;
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