<!-- views/default/TestResults.vue -->
<template>
    <div class="p-4 h-full flex flex-col">

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8 text-gray-400">Loading...</div>

        <template v-else>
            <div class="mb-1 mt-2 items-center gap-6 flex justify-end">
                <p class="text-sm mx-3 text-gray-600">Test Results Will Be Displayed Here</p>
            </div>

            <!-- Table wrapper — overflow-visible so dropdown can escape -->
            <div class="bg-white rounded-xl shadow-sm flex-1 overflow-auto border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200 text-sm ">
                    <thead class="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Family</th>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Device</th>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Test Type</th>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Operator</th>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PO Number</th>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Serial</th>
                            <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pass</th>
                            <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fail</th>
                            <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                        <tr
                            v-for="(group, idx) in summary"
                            :key="idx"
                            class="hover:bg-gray-50 transition-colors"
                        >
                            <td class="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{{ group.product_name }}</td>
                            <td class="px-3 py-2 text-gray-600 whitespace-nowrap">
                                {{ group.series }}
                                <span v-if="group.series_number" class="text-gray-400">({{ group.series_number }})</span>
                            </td>
                            <td class="px-3 py-2 whitespace-nowrap">
                                <span
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                    :class="group.test_type_name === 'First Test'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-purple-50 text-purple-700'"
                                >
                                    {{ group.test_type_name }}
                                </span>
                            </td>
                            <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ formatDate(group.test_date) }}</td>
                            <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ group.operator_name }}</td>
                            <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ group.po_number }}</td>
                            <td class="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                                {{ group.min_serial === group.max_serial
                                    ? group.min_serial
                                    : `${group.min_serial} — ${group.max_serial}` }}
                            </td>
                            <td class="px-3 py-2 text-center text-green-600 font-semibold">{{ group.total_pass }}</td>
                            <td class="px-3 py-2 text-center font-semibold" :class="group.total_fail > 0 ? 'text-red-500' : 'text-gray-300'">{{ group.total_fail }}</td>
                            <td class="px-3 py-2 text-center text-gray-500">{{ group.total_units }}</td>

                            <!-- Action cell — position relative so dropdown anchors here -->
                            <td class="px-3 py-2 text-center relative">
                                <button
                                    @click.stop="toggleDropdown(idx, $event)"
                                    class="text-gray-400 hover:text-gray-700 px-2 py-1 rounded focus:outline-none hover:bg-gray-100 transition-colors"
                                >
                                    &#x22EE;
                                </button>
                            </td>
                        </tr>

                        <tr v-if="summary.length === 0">
                            <td colspan="11" class="text-center py-10 text-gray-400">No test data found</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <!-- ── Dropdown rendered in body via Teleport so it's never clipped ── -->
        <Teleport to="body">
            <div
                v-if="activeDropdown !== null"
                class="fixed z-[9999] w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1"
                :style="dropdownPos"
                @click.stop
            >
                <button
                    @click="viewDetail(summary[activeDropdown])"
                    class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    View
                </button>
                <button
                    @click="openRetest(summary[activeDropdown])"
                    class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                    </svg>
                    Retest
                </button>
                <div class="border-t border-gray-100 my-1"></div>
                <button
                    @click="confirmDelete(summary[activeDropdown])"
                    class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                    </svg>
                    Delete
                </button>
            </div>
        </Teleport>

        <!-- Delete Confirmation Modal -->
        <ConfirmModal
            ref="deleteModalRef"
            :message="deleteMessage"
            confirmText="Delete"
            cancelText="Cancel"
            @confirm="performDelete"
        />

        <!-- Toast -->
        <Teleport to="body">
            <transition name="toast">
                <div
                    v-if="toast.show"
                    :class="[
                        'fixed bottom-5 right-5 z-[99999] px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white',
                        toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'
                    ]"
                >
                    {{ toast.msg }}
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTestResults } from '@/composables/useTestResults'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const router = useRouter()
const { summary, loading, loadSummary, deleteGroup } = useTestResults()

const activeDropdown = ref(null)
const dropdownPos    = ref({})
const selectedGroup  = ref(null)
const deleteModalRef = ref(null)
const deleteMessage  = ref('')
const toast          = ref({ show: false, type: 'success', msg: '' })

/* Aggregate stats */
const totalPass  = computed(() => summary.value.reduce((s, g) => s + Number(g.total_pass  || 0), 0))
const totalFail  = computed(() => summary.value.reduce((s, g) => s + Number(g.total_fail  || 0), 0))
const totalUnits = computed(() => summary.value.reduce((s, g) => s + Number(g.total_units || 0), 0))

const showToast = (type, msg) => {
    toast.value = { show: true, type, msg }
    setTimeout(() => (toast.value.show = false), 3000)
}

const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* Toggle dropdown — calculate position from button rect so it always appears above the viewport fold */
function toggleDropdown(idx, event) {
    if (activeDropdown.value === idx) {
        activeDropdown.value = null
        return
    }

    const btn  = event.currentTarget
    const rect = btn.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom

    // Dropdown is ~130px tall; show above if not enough space below
    if (spaceBelow < 150) {
        dropdownPos.value = {
            bottom: (window.innerHeight - rect.top + 4) + 'px',
            right:  (window.innerWidth  - rect.right)  + 'px',
        }
    } else {
        dropdownPos.value = {
            top:   (rect.bottom + 4) + 'px',
            right: (window.innerWidth - rect.right) + 'px',
        }
    }

    activeDropdown.value = idx
}

function viewDetail(group) {
    activeDropdown.value = null
    sessionStorage.setItem('viewTestGroup', JSON.stringify({
        productId:      group.product_id,
        testTypeId:     group.test_type_id,
        poNumber:       group.po_number,
        productName:    group.product_name,
        testTypeName:   group.test_type_name,
        operatorName:   group.operator_name,
        testDate:       group.test_date,
        series:         group.series,
        series_number:  group.series_number
    }))
    router.push({ name: 'TestingDetail', query: { totalUnits: group.total_units } })
}

function openRetest(group) {
    activeDropdown.value = null
    showToast('success', 'Retest feature coming soon')
}

function confirmDelete(group) {
    activeDropdown.value = null
    selectedGroup.value  = group
    deleteMessage.value  = `Delete all test data for:\nProduct: ${group.product_name}\nDate: ${formatDate(group.test_date)}\nPO: ${group.po_number}?`
    deleteModalRef.value?.show()
}

async function performDelete() {
    if (!selectedGroup.value) return
    const result = await deleteGroup(selectedGroup.value)
    showToast(result.success ? 'success' : 'error', result.success ? 'Data deleted successfully' : (result.message || 'Failed to delete'))
    selectedGroup.value = null
    activeDropdown.value = null
}

/* Close dropdown on outside click */
const closeDropdown = () => { activeDropdown.value = null }

onMounted(() => {
    document.addEventListener('click', closeDropdown)
    loadSummary()
})
onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from,  .toast-leave-to      { opacity: 0; transform: translateY(8px); }
</style>