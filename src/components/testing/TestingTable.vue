<!-- testing/TestingTable.vue -->
<template>
    <div class="testing-table-container">
        <!-- Table Info Header -->
        <div class="bg-gray-50 rounded-md p-4 mb-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <span class="text-gray-600">Device:</span>
                    <span class="ml-2 font-medium">{{ displayProduct }}</span>
                </div>
                <div>
                    <span class="text-gray-600">Test Type:</span>
                    <span class="ml-2 font-medium">{{ testInfo.testType.name }}</span>
                </div>
                <div>
                    <span class="text-gray-600">Operator:</span>
                    <span class="ml-2 font-medium">{{ testInfo.operatorName }}</span>
                </div>
                <div>
                    <span class="text-gray-600">Date:</span>
                    <span class="ml-2 font-medium">{{ testInfo.testDate }}</span>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper border border-gray-300 rounded-md overflow-hidden">
            <table class="w-full text-sm">
                <thead class="bg-[#4a6fa5] text-white sticky top-0 z-10">
                    <tr>
                        <th class="border border-gray-400 px-2 py-2 text-center">NO</th>
                        <th class="border border-gray-400 px-2 py-2 text-center">SERIAL NO</th>
                        <th 
                            v-for="(header, idx) in tableHeaders" 
                            :key="idx"
                            class="border border-gray-400 px-2 py-2 text-center"
                            @click="selectColumn(idx)"
                        >
                            {{ header.name }}
                        </th>
                        <th class="border border-gray-400 px-2 py-2 text-center">STATUS</th>
                        <th class="border border-gray-400 px-2 py-2 text-center">REMARKS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="(row, rowIdx) in tableRows" 
                        :key="row.id"
                        class="hover:bg-gray-50"
                    >
                        <td class="border border-gray-300 px-2 py-1 text-center bg-gray-50 font-semibold">
                            {{ row.id }}
                        </td>
                        <td class="border border-gray-300 px-2 py-1 text-center bg-gray-50 font-semibold">
                            {{ row.serialNumber }}
                        </td>
                        <td 
                            v-for="(cell, cellIdx) in row.cells" 
                            :key="cellIdx"
                            class="border border-gray-300 p-0"
                            :class="getCellClass(cell)"
                            @click="handleCellClick(rowIdx, cellIdx)"
                        >
                            <select 
                                v-if="cell.type === 'select'"
                                v-model="cell.value"
                                @change="handleCellChange(rowIdx, cellIdx)"
                                @focus="updateColumnInfo(cell)"
                                class="w-full h-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">--</option>
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                            </select>
                            <input 
                                v-else
                                v-model="cell.value"
                                type="number"
                                step="any"
                                @input="handleCellChange(rowIdx, cellIdx)"
                                @focus="updateColumnInfo(cell)"
                                class="w-full h-full px-2 py-1 text-center border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                        <td class="border border-gray-300 px-2 py-1 text-center">
                            <span 
                                :class="row.status === 'Pass' ? 'status-pass' : 'status-fail'"
                                class="inline-block px-2 py-1 rounded text-xs font-semibold text-white"
                            >
                                {{ row.status }}
                            </span>
                        </td>
                        <td class="border border-gray-300 p-0">
                            <input 
                                v-model="row.remarks"
                                type="text"
                                class="w-full h-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Column Info Panel -->
        <div class="mt-4 bg-gray-50 rounded-md p-3">
            <div class="text-xs space-y-1">
                <div class="flex justify-between">
                    <span class="text-gray-600">Column:</span>
                    <span class="font-medium">{{ currentColumnInfo.name }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">LSL:</span>
                    <span class="font-medium">{{ currentColumnInfo.lsl }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">USL:</span>
                    <span class="font-medium">{{ currentColumnInfo.usl }}</span>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 mt-4">
            <button 
                @click="$emit('cancel')"
                class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
                Cancel
            </button>
            <button 
                @click="handleSubmit"
                class="px-4 py-2 bg-[#6BAF92] hover:bg-[#52796F] text-white rounded-md transition-colors"
            >
                Submit
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTestingTable } from '@/composables/useTestingTable'
import { useTestingSession } from '@/composables/useTestingSession'

const router = useRouter()
const { getSession, clearSession } = useTestingSession()

const props = defineProps({
    testInfo: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['cancel', 'submit'])

const {
    tableRows,
    currentColumnInfo,
    summaryStats,
    generateTableData,
    validateCell,
    validateRow,
    updateColumnInfo,
    applyToSelectedCells,
    submitTestResults
} = useTestingTable()

const testInfo = getSession()

// Computed
const displayProduct = computed(() => {
    const p = props.testInfo.product
    if (p.series && p.series_number) {
        return `${p.series} - ${p.series_number}`
    }
    return p.series_number || p.series || p.name
})

const tableHeaders = computed(() => {
    if (!props.testInfo.template?.custom_columns?.columns) return []
    
    const headers = []
    const columns = props.testInfo.template.custom_columns.columns.filter(
        col => !col.isReference
    )
    
    columns.forEach(col => {
        if (col.isSplit && col.sub?.length > 0) {
            col.sub.forEach(subCol => {
                headers.push({
                    name: subCol.name,
                    lsl: subCol.lsl,
                    usl: subCol.usl,
                    unit: subCol.unit
                })
            })
        } else {
            headers.push({
                name: col.name,
                lsl: col.lsl,
                usl: col.usl,
                unit: col.unit
            })
        }
    })
    
    return headers
})

// Methods
function getCellClass(cell) {
    if (cell.isValid === true) return 'bg-green-50'
    if (cell.isValid === false) return 'bg-red-50'
    return ''
}

function handleCellClick(rowIdx, cellIdx) {
    const cell = tableRows.value[rowIdx]?.cells[cellIdx]
    if (cell) {
        updateColumnInfo(cell)
    }
}

function handleCellChange(rowIdx, cellIdx) {
    const row = tableRows.value[rowIdx]
    const cell = row.cells[cellIdx]
    
    validateCell(cell)
    validateRow(row)
    
    // Apply to selected cells if multiple selected
    applyToSelectedCells(cell.value, rowIdx, cellIdx)
}

function selectColumn(colIdx) {
    // Future: implement column selection
    console.log('Column selected:', colIdx)
}

async function handleSubmit() {
    const result = await submitTestResults(props.testInfo)
    
    if (result.success) {
        emit('submit', {
            success: true,
            passCount: summaryStats.value.pass,
            failCount: summaryStats.value.fail
        })
    } else {
        emit('submit', {
            success: false,
            message: result.message
        })
    }
}

// Initialize
onMounted(() => {
    generateTableData(props.testInfo)
})
</script>

<style scoped>
.table-wrapper {
    max-height: calc(100vh - 400px);
    overflow: auto;
}

.status-pass {
    background: linear-gradient(to bottom, #10b981, #059669);
}

.status-fail {
    background: linear-gradient(to bottom, #ef4444, #dc2626);
}

/* Remove number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
}
</style>