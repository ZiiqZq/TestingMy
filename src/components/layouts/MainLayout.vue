<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden h-screen bg-gray-100 pt-2">

    <!-- Split -->
    <template v-if="route.meta.layout === 'grid'">
      <!-- Main Content Area -->
      <main class="flex main-content overflow-hidden bg-gray-100 border border-gray-300 rounded-tl-lg">
        
        <!-- Left Panel -->
        <div class="left-panel py-4 flex flex-col h-full" :style="{ width: leftPanelWidth + 'px' }">
          <!-- Title -->
          <div class=" px-6 flex-shrink-0">
            <p class="text-xl text-[#444D59] font-bold mb-3 ">
              {{ pageTitle }}
            </p>
          </div>
          
          <!-- Content dengan scroll -->
          <div class="flex-1 scroll-container">
            <RouterView name="LeftSidebar"/>
          </div>
        </div>
        
        <!-- Right Panel -->
        <div class="right-panel-container mx-1 mt-1 mb-4 flex-1 relative">
          <!-- Resize Handle -->
          <div class="resize-handle" @mousedown="startResize"></div>
          
          <Transition name="slide-fade">
            <div 
              class="right-panel backdrop-blur-xs border border-gray-300/50 rounded-md bg-white shadow-md overflow-hidden h-full" 
              ref="rightPanel"
              :key="route.path"
            >
              <div 
                v-if="route.meta.showNavbar === true" 
                class="sticky top-0 bg-white border-b border-[#ebecea] shadow-sm p-3 pl-8 font-bold text-xl text-[#444D59]"
              >
                <p>{{navTitle}}</p>
              </div>
              <div class="scroll-container h-full right-panel">
                <div class="mb-12">
                  <RouterView />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </main>
    </template>

    <!-- Full -->
    <template v-else>
      <!-- FULL WIDTH LAYOUT -->
      <main class="main-content overflow-hidden bg-white border border-gray-300 rounded-tl-lg">
        <Transition name="fade">
          <div 
            class="px-6 py-4 full-panel scroll-container h-full" 
            :key="route.path"
          >
            <p class="text-xl font-medium">
              {{ pageTitle }}
            </p>
            <RouterView />
          </div>
        </Transition>
      </main>
    </template>
    </div>
  </div>
</template>

<script setup>
// Script tetap sama, tidak diubah
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'

const route = useRoute()

// Gunakan pageTitle dari meta atau fallback
const pageTitle = computed(() => 
  route.meta.pageTitle || 
  route.name
)

const navTitle = computed(() => 
  route.meta.navTitle 
)

// Tentukan apakah show title di full layout
const showTitleInFullLayout = computed(() => {
  const hideTitlePages = ['/account', '/settings']
  return !hideTitlePages.includes(route.path)
})

// Resizable state
const leftPanelWidth = ref(300) // Default width in pixels
const isResizing = ref(false)

// Resize functions
function startResize(e) {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'ew-resize'
  document.body.classList.add('resizing')
  e.preventDefault()
}

function handleResize(e) {
  if (!isResizing.value) return
  
  // Dapatkan posisi dan dimensi container parent
  const containerRect = document.querySelector('.main-content').getBoundingClientRect()
  
  // Hitung lebar baru untuk left panel berdasarkan posisi mouse
  const newWidth = e.clientX - containerRect.left
  
  // Min dan max width constraints
  const minWidth = 280
  const maxWidth = containerRect.width * 0.5
  
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    leftPanelWidth.value = newWidth
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.classList.remove('resizing')
  
  // Save to localStorage
  localStorage.setItem('leftPanelWidth', leftPanelWidth.value)
}

// Load saved width
onMounted(() => {
  const savedWidth = localStorage.getItem('leftPanelWidth')
  if (savedWidth) {
    leftPanelWidth.value = parseInt(savedWidth)
  }
})

// Cleanup
onUnmounted(() => {
  stopResize()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.main-content {
  flex: 1;
  margin-left: 3.75rem; /* sama dengan di sidebar */
  min-height: 100vh;
  position: relative;
}

/* Left Panel */
.left-panel {
  flex-shrink: 0;
  position: relative;
  min-width: 200px;
  max-width: 50%;
  transition: width 0.1s ease;
}

/* Container untuk right panel */
.right-panel-container {
  position: relative;
  flex: 1;
  min-width: 0;
}

/* Right Panel */
.right-panel {
  height: 100%;
  width: 100%;
}

/* Resize Handle */
.resize-handle {
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  background: transparent;
  z-index: 20;
}

/* Saat resize aktif */
.resizing {
  user-select: none !important;
}

.resizing * {
  cursor: ew-resize !important;
  user-select: none !important;
}

/* ========== SCROLLBAR ========== */
.scroll-container {
  overflow-y: auto;
  position: relative;
}

.scroll-container::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.scroll-container:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}

.scroll-container {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.scroll-container:hover {
  scrollbar-color: rgba(224, 224, 225, 0.6) transparent;
}

.scroll-container::-webkit-scrollbar-button,
.scroll-container::-webkit-scrollbar-corner {
  display: none;
}

/* Slide Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Fade untuk full width layout */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>