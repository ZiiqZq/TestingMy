<!-- LeftAnalytics.vue -->
<template>
    <div class="pl-4 pr-3 h-full overflow-y-auto bg-gray-50">
        <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <h3 class="font-semibold text-gray-700 border-b pb-2">Filter Analytics</h3>
            <div class="space-y-3">
                <div>
                    <label class="text-xs font-medium text-gray-500">Produk</label>
                    <select v-model="filters.productId" class="w-full border rounded-md p-2 text-sm">
                        <option value="">Semua</option>
                        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.product_name }}</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs font-medium text-gray-500">Test Type</label>
                    <select v-model="filters.testTypeId" class="w-full border rounded-md p-2 text-sm">
                        <option value="">Semua</option>
                        <option v-for="tt in testTypes" :key="tt.id" :value="tt.id">{{ tt.name }}</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs font-medium text-gray-500">Dari</label>
                        <input type="date" v-model="filters.startDate" class="w-full border rounded-md p-2 text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500">Sampai</label>
                        <input type="date" v-model="filters.endDate" class="w-full border rounded-md p-2 text-sm">
                    </div>
                </div>
                <button @click="applyFilters" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-sm font-medium">
                    Terapkan Filter
                </button>
                <button @click="resetFilters" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md py-2 text-sm font-medium">
                    Reset
                </button>
            </div>
        </div>
    </div>
    
</template>

<script setup>
import { useAnalytics } from '@/composables/useAnalytics'
import { onMounted } from 'vue'

const { filters, products, testTypes, loadYieldData, loadParetoData, loadKpiSummary, resetFilters, loadFilters } = useAnalytics()

function applyFilters() {
    loadYieldData()
    loadParetoData()
    loadKpiSummary()
}

onMounted(async () => {
    await loadFilters()
    await loadYieldData()
    await loadParetoData()
    await loadKpiSummary()
})
</script>