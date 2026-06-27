import { ref, reactive, computed } from 'vue'

const loading = ref(false)
const yieldData = ref([])
const paretoEntries = ref([])
const kpiSummary = ref({
    total_tested: 0, total_pass: 0, total_fail: 0, total_retest: 0,
    first_test_pass: 0, first_test_fail: 0, first_test_total: 0,
    final_test_pass: 0, final_test_fail: 0, final_test_total: 0
})

// Ganti computed KPI — hapus kpiFirstPassYield & kpiOverallPassRate, tambah dua ini:
const kpiFirstTestYield = computed(() => {
    const s = kpiSummary.value
    return s.first_test_total > 0
        ? Math.round((s.first_test_pass / s.first_test_total) * 10000) / 100
        : 0
})

const kpiFinalTestYield = computed(() => {
    const s = kpiSummary.value
    return s.final_test_total > 0
        ? Math.round((s.final_test_pass / s.final_test_total) * 10000) / 100
        : 0
})

const yieldViewMode = ref('total')
const paretoViewMode = ref('total')

const filters = reactive({ productId: '', testTypeId: '', startDate: '', endDate: '' })

const products = ref([])
const testTypes = ref([])

function toDateString(value) {
    if (value instanceof Date) {
        const yyyy = value.getFullYear()
        const mm = String(value.getMonth() + 1).padStart(2, '0')
        const dd = String(value.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }
    return value
}

const kpiOverallPassRate = computed(() => {
    const s = kpiSummary.value
    return s.total_tested > 0 ? Math.round((s.total_pass / s.total_tested) * 10000) / 100 : 0
})
const kpiFirstPassYield = computed(() => {
    const s = kpiSummary.value
    return s.first_attempt_count > 0 ? Math.round((s.first_pass_count / s.first_attempt_count) * 10000) / 100 : 0
})
const kpiRetestRate = computed(() => {
    const s = kpiSummary.value
    return s.total_tested > 0 ? Math.round((s.total_retest / s.total_tested) * 10000) / 100 : 0
})

const yieldDataTotal = computed(() => {
    const map = new Map()
    yieldData.value.forEach(row => {
        const key = row.test_date
        if (!map.has(key)) map.set(key, { test_date: key, total: 0, pass: 0, fail: 0, retest: 0 })
        const agg = map.get(key)
        agg.total += Number(row.total)
        agg.pass += Number(row.pass)
        agg.fail += Number(row.fail)
        agg.retest += Number(row.retest_count || 0)
    })
    return Array.from(map.values())
        .map(d => ({
            ...d,
            yield: d.total > 0 ? Math.round((d.pass / d.total) * 10000) / 100 : 0,
            retestRate: d.total > 0 ? Math.round((d.retest / d.total) * 10000) / 100 : 0
        }))
        .sort((a, b) => a.test_date.localeCompare(b.test_date))
})

const yieldDataByProduct = computed(() => {
    const dates = [...new Set(yieldData.value.map(d => d.test_date))].sort()
    const grouped = new Map()
    yieldData.value.forEach(row => {
        const key = row.product_name || `Produk #${row.product_id}`
        if (!grouped.has(key)) grouped.set(key, new Map())
        grouped.get(key).set(row.test_date, row)
    })
    const series = Array.from(grouped.entries()).map(([name, dateMap]) => ({
        name,
        data: dates.map(d => dateMap.has(d) ? Number(dateMap.get(d).yield) : null)
    }))
    return { dates, series }
})

const yieldByProductSnapshot = computed(() => {
    const map = new Map()
    yieldData.value.forEach(row => {
        const key = row.product_name || `Produk #${row.product_id}`
        if (!map.has(key)) map.set(key, { name: key, total: 0, pass: 0, fail: 0 })
        const agg = map.get(key)
        agg.total += Number(row.total)
        agg.pass += Number(row.pass)
        agg.fail += Number(row.fail)
    })
    return Array.from(map.values())
        .map(d => ({ ...d, yield: d.total > 0 ? Math.round((d.pass / d.total) * 10000) / 100 : 0 }))
        .sort((a, b) => a.yield - b.yield)
})

const yieldByTestTypeSnapshot = computed(() => {
    const map = new Map()
    yieldData.value.forEach(row => {
        const key = row.test_type_name || `Test Type #${row.test_type_id}`
        if (!map.has(key)) map.set(key, { name: key, total: 0, pass: 0, fail: 0 })
        const agg = map.get(key)
        agg.total += Number(row.total)
        agg.pass += Number(row.pass)
        agg.fail += Number(row.fail)
    })
    return Array.from(map.values())
        .map(d => ({ ...d, yield: d.total > 0 ? Math.round((d.pass / d.total) * 10000) / 100 : 0 }))
})

function buildParetoFromMap(map) {
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
    const total = sorted.reduce((sum, [, count]) => sum + count, 0)
    let cumulative = 0
    const cumulativeData = sorted.map(([, count]) => {
        cumulative += count
        return total > 0 ? Math.round((cumulative / total) * 100) : 0
    })
    return {
        categories: sorted.map(([name]) => name),
        counts: sorted.map(([, count]) => count),
        cumulative: cumulativeData,
        total
    }
}

function buildFailureMap(entries, byProduct = false) {
    const map = new Map()
    entries.forEach(entry => {
        let results = entry.test_results
        if (typeof results === 'string') {
            try { results = JSON.parse(results) } catch (e) { results = [] }
        }
        if (!Array.isArray(results)) results = Object.values(results)
        results.forEach(param => {
            if (param.isValid === false) {
                const name = param.name || 'Unknown'
                if (byProduct) {
                    const productName = entry.product_name || `Produk #${entry.product_id}`
                    const key = `${productName}::${name}`
                    map.set(key, (map.get(key) || 0) + 1)
                } else {
                    map.set(name, (map.get(name) || 0) + 1)
                }
            }
        })
    })
    return map
}

const paretoDataTotal = computed(() => buildParetoFromMap(buildFailureMap(paretoEntries.value, false)))

const paretoDataByProduct = computed(() => {
    const categories = paretoDataTotal.value.categories
    const byProductMap = buildFailureMap(paretoEntries.value, true)
    const productNames = [...new Set(Array.from(byProductMap.keys()).map(k => k.split('::')[0]))]
    const series = productNames.map(productName => ({
        name: productName,
        data: categories.map(cat => byProductMap.get(`${productName}::${cat}`) || 0)
    }))
    return { categories, series }
})

const paretoByPO = computed(() => {
    const map = new Map()
    paretoEntries.value.forEach(e => {
        const key = e.po_number || 'Tanpa PO'
        map.set(key, (map.get(key) || 0) + 1)
    })
    return buildParetoFromMap(map)
})

const paretoByOperator = computed(() => {
    const map = new Map()
    paretoEntries.value.forEach(e => {
        const key = e.operator_name || 'Tidak diketahui'
        map.set(key, (map.get(key) || 0) + 1)
    })
    return buildParetoFromMap(map)
})

export function useAnalytics() {
    async function loadFilters() {
        try {
            const [productsRes, testTypesRes] = await Promise.all([
                window.electron.db.getProducts(),
                window.electron.db.getTestTypes()
            ])
            if (productsRes.success) products.value = productsRes.data
            if (testTypesRes.success) testTypes.value = testTypesRes.data
        } catch (err) {
            console.error('Failed to load filters:', err)
        }
    }

    async function loadYieldData() {
        loading.value = true
        try {
            const plainFilters = JSON.parse(JSON.stringify(filters))
            const result = await window.electron.db.getYieldData(plainFilters)
            if (result.success) {
                yieldData.value = result.data.map(row => ({ ...row, test_date: toDateString(row.test_date) }))
            } else {
                console.error('❌ Yield error:', result.error)
            }
        } catch (e) { console.error(e) } finally { loading.value = false }
    }

    async function loadParetoData() {
        loading.value = true
        try {
            const plainFilters = JSON.parse(JSON.stringify(filters))
            const result = await window.electron.db.getParetoData(plainFilters)
            if (result.success) {
                paretoEntries.value = result.data
            } else {
                console.error('❌ Pareto error:', result.error)
            }
        } catch (e) { console.error(e) } finally { loading.value = false }
    }

    async function loadKpiSummary() {
        try {
            const plainFilters = JSON.parse(JSON.stringify(filters))
            const result = await window.electron.db.getKpiSummary(plainFilters)
            if (result.success) {
                kpiSummary.value = result.data
            } else {
                console.error('❌ KPI error:', result.error)
            }
        } catch (e) { console.error(e) }
    }

    function resetFilters() {
        filters.productId = ''
        filters.testTypeId = ''
        filters.startDate = ''
        filters.endDate = ''
        loadYieldData()
        loadParetoData()
        loadKpiSummary()
    }

    return {
        loading, yieldData, yieldDataTotal, yieldDataByProduct,
        yieldByProductSnapshot, yieldByTestTypeSnapshot, yieldViewMode,
        paretoDataTotal, paretoDataByProduct, paretoByPO, paretoByOperator, paretoViewMode,
        kpiSummary, kpiFirstTestYield, kpiFinalTestYield, kpiRetestRate,
        filters, products, testTypes,
        loadFilters, loadYieldData, loadParetoData, loadKpiSummary, resetFilters
    }
}