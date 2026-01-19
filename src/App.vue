<template>
  <!-- Loading screen -->
  <AppLoading v-if="!isAppReady" />

  <!-- Main Content -->
  <div v-else id="app-main">
    <MainLayout />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLoading from '@/components/AppLoading.vue'
import MainLayout from './components/layouts/MainLayout.vue'

const isAppReady = ref(false)

onMounted(() => {
  if (window.electron) {
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