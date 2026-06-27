// src/composables/useTestResults.js
import { ref, reactive } from 'vue'

// ─── Shared singleton state (di luar fungsi, tidak di-reset setiap call) ───
const summary   = ref([])
const loading   = ref(false)
const products  = ref([])
const testTypes = ref([])
const operators = ref([])

const filters = reactive({
    productId:  '',
    testTypeId: '',
    operatorId: '',
    poNumber:   '',
    startDate:  '',
    endDate:    '',
    status:     '',
    sortOrder:  'desc'
})
// ────────────────────────────────────────────────────────────────────────────

export function useTestResults() {

    async function loadFilters() {
        try {
            const [productsRes, testTypesRes, usersRes] = await Promise.all([
                window.electron.db.getProducts(),
                window.electron.db.getTestTypes(),
                window.electron.db.getUsers()
            ])
            if (productsRes.success)  products.value  = productsRes.data
            if (testTypesRes.success) testTypes.value = testTypesRes.data
            if (usersRes.success)     operators.value = usersRes.data
        } catch (err) {
            console.error(err)
        }
    }

    async function loadSummary() {
        loading.value = true
        try {
            const plainFilters = JSON.parse(JSON.stringify(filters))
            console.log('📤 Mengirim filter ke backend:', plainFilters)
            const result = await window.electron.db.getTestSummary(plainFilters)
            if (result.success) {
                summary.value = result.data
            } else {
                console.error(result.error)
            }
        } catch (err) {
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    async function deleteGroup(group) {
        try {
            const result = await window.electron.db.deleteTestGroup({
                productId:  group.product_id,
                testTypeId: group.test_type_id,
                testDate:   group.test_date,
                operatorId: group.operator_id,
                poNumber:   group.po_number
            })
            if (result.success) {
                await loadSummary()
                return { success: true, message: 'Data berhasil dihapus' }
            } else {
                return { success: false, message: result.error }
            }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    function resetFilters() {
        filters.productId  = ''
        filters.testTypeId = ''
        filters.operatorId = ''
        filters.poNumber   = ''
        filters.startDate  = ''
        filters.endDate    = ''
        filters.status     = ''
        filters.sortOrder  = 'desc'
        loadSummary()
    }

    return {
        summary,
        loading,
        filters,
        products,
        testTypes,
        operators,
        loadFilters,
        loadSummary,
        deleteGroup,
        resetFilters
    }
}