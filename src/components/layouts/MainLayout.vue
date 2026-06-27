<!-- mainlayout.vue -->
<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden h-screen bg-gray-100 pt-2">

    <!-- Split -->
    <template v-if="route.meta.layout === 'grid'">
      <!-- Main Content Area -->
      <main class="flex main-content overflow-hidden bg-[#faf9f5] border border-gray-300 rounded-tl-lg">
        
        <!-- panel kiri -->
        <div class="left-panel  flex flex-col h-full" :style="{ width: leftPanelWidth + 'px' }">
          <!-- Title -->
          <div v-if="route.meta.showPageTitle === true" class=" px-7 pt-4 flex-shrink-0">
            <p class="text-xl text-[#444D59] font-bold mb-3 ">
              {{ pageTitle }}
            </p>
          </div>
          
          <div class="flex-1 scroll-container left-scroll h-full  left-panel">
            <RouterView
              name="LeftSidebar"
              ref="leftPanelRef"
            />
          </div>
        </div>
        
        <!-- panel kanan -->
        <div class="right-panel-container mr-2 ml-1 mt-1 mb-4 flex-1 relative">
          <!-- Resize Handle -->
          <div class="resize-handle" @mousedown="startResize"></div>
          
          <Transition name="slide-fade">
            <div
              class="right-panel backdrop-blur-xs border border-gray-300/50 rounded-3xl bg-[#FDFDFD] shadow-md overflow-hidden h-full" 
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
                <div >
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
import { ref } from 'vue'
import { useMainLayout } from '@/composables/MainLayout.js'
import Sidebar from './Sidebar.vue'

const {
  pageTitle,
  navTitle,
  showTitleInFullLayout,
  leftPanelWidth,
  startResize,
  route
} = useMainLayout()

const leftPanelRef = ref(null)
</script>

<style src="../../styles/MainLayout.css" scoped></style>