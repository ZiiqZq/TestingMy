<!-- views/left/LeftTestResults.vue -->
<template>
    <div class="ml-4 mr-3 h-full overflow-y-auto bg-gray-50">
        <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <h3 class="font-semibold text-gray-700 border-b pb-2">Filter Test Results</h3>
            <div class="space-y-3">

                <!-- Family / Product -->
                <div>
                    <label class="text-xs font-medium text-gray-500">Family / Product</label>
                    <select v-model="filters.productId" class="w-full border rounded-md p-2 text-sm mt-1">
                        <option value="">All Families</option>
                        <optgroup
                            v-for="family in groupedProducts"
                            :key="family.name"
                            :label="family.name"
                        >
                            <option
                                v-for="p in family.items"
                                :key="p.id"
                                :value="p.id"
                            >
                                {{ p.product_name }}{{ p.series ? ` — ${p.series}` : '' }}{{ p.series_number ? ` (${p.series_number})` : '' }}
                            </option>
                        </optgroup>
                    </select>
                </div>

                <!-- Test Type -->
                <div>
                    <label class="text-xs font-medium text-gray-500">Test Type</label>
                    <select v-model="filters.testTypeId" class="w-full border rounded-md p-2 text-sm mt-1">
                        <option value="">All Types</option>
                        <option v-for="tt in testTypes" :key="tt.id" :value="tt.id">{{ tt.name }}</option>
                    </select>
                </div>

                <!-- Operator -->
                <div>
                    <label class="text-xs font-medium text-gray-500">Operator</label>
                    <select v-model="filters.operatorId" class="w-full border rounded-md p-2 text-sm mt-1">
                        <option value="">All Operators</option>
                        <option v-for="op in operators" :key="op.id" :value="op.id">{{ op.username }}</option>
                    </select>
                </div>

                <!-- Status -->
                <div>
                    <label class="text-xs font-medium text-gray-500">Status</label>
                    <select v-model="filters.status" class="w-full border rounded-md p-2 text-sm mt-1">
                        <option value="">All Status</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                    </select>
                </div>

                <!-- PO Number -->
                <div>
                    <label class="text-xs font-medium text-gray-500">PO Number</label>
                    <input
                        v-model="filters.poNumber"
                        placeholder="Search PO..."
                        class="w-full border rounded-md p-2 text-sm mt-1"
                    />
                </div>

                <!-- Date Range -->
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs font-medium text-gray-500">From Date</label>
                        <input type="date" v-model="filters.startDate" class="w-full border rounded-md p-2 text-sm mt-1" />
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500">To Date</label>
                        <input type="date" v-model="filters.endDate" class="w-full border rounded-md p-2 text-sm mt-1" />
                    </div>
                </div>

                <!-- Sort Order -->
                <div>
                    <label class="text-xs font-medium text-gray-500">Sort by Date</label>
                    <select v-model="filters.sortOrder" class="w-full border rounded-md p-2 text-sm mt-1">
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>

                <!-- Reset -->
                <button
                    @click="handleReset"
                    class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md py-2 text-sm font-medium transition-colors"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    </div>
    
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useTestResults } from '@/composables/useTestResults'

const { filters, products, testTypes, operators, loadSummary, loadFilters } = useTestResults()

const groupedProducts = computed(() => {
    const map = {}
    for (const p of products.value) {
        const key = p.product_name
        if (!map[key]) map[key] = { name: key, items: [] }
        map[key].items.push(p)
    }
    return Object.values(map)
})

const activeCount = computed(() => [
    filters.productId,
    filters.testTypeId,
    filters.operatorId,
    filters.poNumber,
    filters.startDate,
    filters.endDate,
    filters.status,
].filter(Boolean).length)

watch(filters, () => { loadSummary() }, { deep: true })

function handleReset() {
    filters.productId  = ''
    filters.testTypeId = ''
    filters.operatorId = ''
    filters.poNumber   = ''
    filters.startDate  = ''
    filters.endDate    = ''
    filters.status     = ''
    filters.sortOrder  = 'desc'
}

onMounted(async () => {
    await loadFilters()
    loadSummary()
})
</script>
