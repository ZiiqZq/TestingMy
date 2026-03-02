<!-- testing.vue -->
<template>
  <div class="flex flex-col h-full">

    <!-- Tab toggle di bagian atas -->
    <div class="px-6 pt-4 pb-0">
      <div class="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          @click="activeTab = 'manual'"
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === 'manual'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          Manual Testing
        </button>
        <button
          @click="activeTab = 'excel'"
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === 'excel'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          Import Excel
        </button>
      </div>
    </div>

    <!-- Tab: Manual (existing form) -->
    <div v-show="activeTab === 'manual'" class="flex-1 overflow-y-auto pb-16">
      <ManualTestForm />
    </div>

    <!-- Tab: Import Excel (new) -->
    <div v-show="activeTab === 'excel'" class="flex-1 overflow-y-auto pb-16">
      <ImportExcel />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import ManualTestForm from '@/views/default/ManualTest.vue'
import ImportExcel from '@/views/default/ImportExcel.vue'

const activeTab = ref('manual')
</script>