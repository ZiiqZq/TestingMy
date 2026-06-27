<!-- views/default/TestingDetail.vue -->
<template>
  <div class="h-full flex flex-col overflow-hidden bg-white">
    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-500">
      Loading...
    </div>
    <div v-else-if="!entries.length && !loading" class="flex-1 flex items-center justify-center text-gray-400">
      Tidak ada data detail untuk grup ini
    </div>
    <div v-else-if="entries.length" class="flex flex-col h-full overflow-hidden">

      <!-- Header row -->
      <div class="flex items-center justify-between px-5 pt-4 pb-0 flex-shrink-0">
        <div class="flex items-center gap-3">
          <!-- Back button -->
          <button
            @click="goBack"
            class="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors"
            title="Kembali ke Hasil Testing"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Test Matrix Detail</p>
            <p class="text-sm font-semibold text-gray-700 mt-0.5">{{ testInfo.testTypeName }} - {{ testInfo.poNumber }}</p>
          </div>
        </div>

        <!-- Export PDF button -->
        <button
          @click="exportModalRef?.show()"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Export PDF
        </button>
      </div>

      <!-- Data table -->
      <div class="flex-1 overflow-auto px-5 py-4 min-h-0">
        <div class="table-container border border-slate-300 rounded-2xl shadow-md bg-white">
          <table class="test-table">
            <thead class="sticky top-0">
              <tr>
                <th rowspan="2" class="p-3 border-b border-r text-center font-semibold">NO</th>
                <th rowspan="2" class="p-3 border-b border-r text-center font-semibold">SERIAL NO.</th>
                <template v-for="(header, idx) in tableHeaders" :key="'h1-'+idx">
                  <th
                    v-if="!header.isSub"
                    :colspan="header.colspan || 1"
                    :rowspan="header.rowspan || 1"
                    class="p-3 border-b border-r text-center font-semibold"
                  >
                    {{ header.name }}
                  </th>
                </template>
                <th rowspan="2" class="p-3 border-b border-r text-center font-semibold">STATUS</th>
                <th rowspan="2" class="p-3 border-b border-r text-center font-semibold">REMARKS</th>
              </tr>
              <tr v-if="hasSubHeaders">
                <template v-for="(header, idx) in tableHeaders" :key="'h2-'+idx">
                  <th
                    v-if="header.isSub"
                    class="p-3 border-b border-r text-center font-semibold sub-header"
                    @click="setCurrentColumn(header)"
                  >
                    {{ header.name }}
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in entries" :key="row.id">
                <td class="p-3 border-b border-r text-center disable">{{ rowIndex + 1 }}</td>
                <td class="p-3 border-b border-r text-center font-semibold disable">{{ row.original_serial_number }}</td>
                <td
                  v-for="(cell, cellIndex) in getRowCells(row)"
                  :key="cellIndex"
                  class="p-0 border-b border-r"
                  :class="getCellClass(cell)"
                >
                  <div class="w-full h-full text-center px-2 py-1">
                    {{ cell.value !== undefined && cell.value !== null ? cell.value : '' }}
                  </div>
                </td>
                <td class="border-b border-r text-center disable">
                  <div class="p-0.5 text-white">
                    <p :class="row.status === 'Pass' ? 'bg-green-600' : 'bg-red-600'" class="border rounded-md px-2 py-1">
                      {{ row.status || 'Fail' }}
                    </p>
                  </div>
                </td>
                <td class="p-0 border-b border-r">
                  <div class="w-full px-2 py-1 text-center">{{ row.remarks || '-' }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Export PDF Modal -->
    <ExportPdfModal
      ref="exportModalRef"
      :testInfo="testInfo"
      :entries="entries"
      :headers="tableHeaders"
      @exported="onExported"
      @error="onExportError"
    />

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toast.show"
          :class="[
            'fixed bottom-5 right-5 z-[99999] px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white flex items-center gap-2',
            toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'
          ]"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path v-if="toast.type === 'error'"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path v-else d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          </svg>
          {{ toast.msg }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExportPdfModal from '@/components/modals/ExportPdfModal.vue'

const route  = useRoute()
const router = useRouter()

const loading       = ref(false)
const testInfo      = ref({})
const entries       = ref([])
const tableHeaders  = ref([])
const hasSubHeaders = ref(false)
const exportModalRef = ref(null)
const toast = ref({ show: false, type: 'success', msg: '' })

const showToast = (type, msg) => {
  toast.value = { show: true, type, msg }
  setTimeout(() => (toast.value.show = false), 3500)
}

const setCurrentColumn = (column) => {
  const columnInfo = {
    name:           column.name || 'Kolom',
    lsl:            column.lsl  || '-',
    usl:            column.usl  || '-',
    unit:           column.unit || '',
    expectedValue:  column.expectedValue  || '',
    validationType: column.validationType || 'lsl_usl'
  }
  localStorage.setItem('currentColumn', JSON.stringify(columnInfo))
}

const getRowCells = (row) => {
  let results = row.test_results
  if (typeof results === 'string') {
    try { results = JSON.parse(results) } catch { results = [] }
  }
  if (!Array.isArray(results)) results = []
  return results
}

const goBack = () => router.back()

const getCellClass = (cell) => {
  if (cell.isValid === true)  return 'bg-green-50'
  if (cell.isValid === false) return 'bg-red-50'
  return ''
}

const generateHeadersFromColumns = (columns) => {
  const headers = []
  columns.forEach(col => {
    if (col.isSplit && col.sub?.length) {
      headers.push({ id: col.id, name: col.name, colspan: col.sub.length, rowspan: 1, isSub: false })
      col.sub.forEach(sub => {
        headers.push({
          id: sub.id, name: sub.name, colspan: 1, rowspan: 1, isSub: true,
          lsl: sub.lsl, usl: sub.usl, unit: sub.unit,
          validationType: sub.validationType, expectedValue: sub.expectedValue
        })
      })
    } else {
      headers.push({
        id: col.id, name: col.name, colspan: 1, rowspan: 2, isSub: false,
        lsl: col.lsl, usl: col.usl, unit: col.unit,
        validationType: col.validationType, expectedValue: col.expectedValue
      })
    }
  })
  return headers
}

const onExported = (filePath) => {
  showToast('success', `PDF saved: ${filePath.split(/[\\/]/).pop()}`)
}

const onExportError = (msg) => {
  showToast('error', `Export failed: ${msg}`)
}

const loadDetail = async () => {
  const groupData = sessionStorage.getItem('viewTestGroup')
  if (!groupData) { router.push({ name: 'TestResults' }); return }

  const group = JSON.parse(groupData)
  testInfo.value = { ...group, totalUnits: route.query.totalUnits || 0 }

  loading.value = true
  try {
    const detailRes = await window.electron.db.getTestDetail({
      productId:  group.productId,
      testTypeId: group.testTypeId,
      poNumber:   group.poNumber
    })
    if (detailRes.success && detailRes.data.length) {
      entries.value = detailRes.data
      if (detailRes.data[0]) {
        testInfo.value.operatorName = detailRes.data[0].operator_name
        testInfo.value.testDate     = detailRes.data[0].test_date
      }
    } else {
      entries.value = []
    }

    const templateRes = await window.electron.db.getTemplatesByProduct(group.productId)
    if (templateRes.success) {
      const template = templateRes.data.find(t => t.test_type_id === group.testTypeId)
      if (template && template.custom_columns?.columns) {
        const columns = template.custom_columns.columns.filter(col => !col.isReference)
        tableHeaders.value  = generateHeadersFromColumns(columns)
        hasSubHeaders.value = tableHeaders.value.some(h => h.isSub)
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadDetail() })
</script>

<style scoped>
.bg-red-600   { background-color: #dc2626; }
.bg-green-600 { background-color: #16a34a; }
.bg-green-50  { background-color: #f0fdf4; }
.bg-red-50    { background-color: #fef2f2; }

.table-container {
  overflow-x: auto; overflow-y: auto;
  border: 1px solid #cbd5e1; width: 100%;
  max-height: calc(100vh - 200px);
  position: relative; background: white;
}
.test-table {
  width: 100%; font-size: 0.875rem;
  border-collapse: separate; border-spacing: 0;
  font-family: 'Segoe UI', 'Calibri', Arial, sans-serif;
}
.test-table .disable { background-color: #f1f5f9; }
.test-table th {
  background: #2F855A; color: #fff; padding: 12px 8px;
  text-align: center; font-weight: 700; font-size: 11px;
  position: sticky; border: 1px solid #047857;
  border-bottom: 2px solid #047857; top: 0; z-index: 10;
  height: 44px; text-transform: uppercase; letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15); cursor: default;
  user-select: none; white-space: normal; word-break: break-word;
  max-width: 200px; min-width: 80px;
}
.test-table th.sub-header {
  background: #E6F4EE; border: 1px solid #3a5985;
  border-bottom: 2px solid #276749; color: #065F46;
  position: sticky; font-weight: 600; top: 44px; z-index: 10;
  height: 36px; text-transform: none; cursor: pointer; transition: all 0.2s ease;
}
.test-table th.sub-header:hover { background: linear-gradient(135deg, #a7f3d0, #6ee7b7); }
.test-table thead { position: sticky; top: 0; z-index: 20; }
.test-table tbody tr:nth-child(even) { background-color: #f8fafc; }
.test-table tbody tr:hover           { background-color: #f0fdf4; }
.test-table td {
  padding: 0; border: 1px solid #e2e8f0; text-align: center;
  background-color: white; transition: all 0.15s ease;
  height: 36px; vertical-align: middle; position: relative; user-select: none;
}
.test-table td.bg-green-50 { background-color: #ecfdf5 !important; border-color: #a7f3d0 !important; }
.test-table td.bg-red-50   { background-color: #fef2f2 !important; border-color: #fca5a5 !important; }
.table-container::-webkit-scrollbar       { width: 10px; height: 10px; }
.table-container::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 2px; }
.table-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #cbd5e1, #94a3b8); border-radius: 2px;
}
.table-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #94a3b8, #64748b);
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from,   .toast-leave-to     { opacity: 0; transform: translateY(8px); }
</style>