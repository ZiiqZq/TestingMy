<template>
  <!-- Wrapper utama dengan drag & drop handler -->
  <div
    class="relative grid grid-cols-1 gap-5 pt-4 px-6 pb-6"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >

    <!-- OVERLAY saat drag masuk -->
    <Transition name="fade">
      <div
        v-if="isDragging && isDeviceReady"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center
               bg-green-500 bg-opacity-90 rounded-xl pointer-events-none mx-4 mt-2"
      >
        <svg class="w-16 h-16 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-white text-xl font-bold">Lepaskan file di sini</p>
        <p class="text-green-100 text-sm mt-1">Format: .xlsx atau .xls</p>
      </div>

      <!-- Overlay saat drag tapi device belum dipilih -->
      <div
        v-else-if="isDragging && !isDeviceReady"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center
               bg-gray-500 bg-opacity-90 rounded-xl pointer-events-none"
      >
        <svg class="w-16 h-16 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
        </svg>
        <p class="text-white text-xl font-bold">Pilih Device dulu</p>
        <p class="text-gray-200 text-sm mt-1">Pilih Device dan Test Type di panel kiri</p>
      </div>
    </Transition>

    <!-- Step indicator -->
    <div class="flex items-center gap-2 text-xs flex-wrap">
      <span :class="stepClass(1)">1. Pilih Device</span>
      <span class="text-gray-300">&rarr;</span>
      <span :class="stepClass(2)">2. Upload Excel</span>
      <span class="text-gray-300">&rarr;</span>
      <span :class="stepClass(3)">3. Pilih PO Number</span>
      <span class="text-gray-300">&rarr;</span>
      <span :class="stepClass(4)">4. Preview &amp; Lanjut</span>
    </div>

    <!-- STEP 1: Belum pilih device -->
    <div v-if="!isDeviceReady" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-sm text-yellow-700">
        Pilih <strong>Device</strong> dan <strong>Test Type</strong> di panel kiri terlebih dahulu.
      </p>
    </div>

    <template v-else>

      <!-- Info device terpilih -->
      <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-700">
          Device: <strong>{{ deviceLabel }}</strong> | Test: <strong>{{ selectedTestType?.name }}</strong>
        </p>
      </div>

      <!-- STEP 2: Upload file -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Upload File Excel</label>

        <!-- Drop zone visual (tetap ada sebagai alternatif klik) -->
        <div
          class="relative border-2 border-dashed rounded-lg p-6 text-center transition-colors"
          :class="isDragging
            ? 'border-green-400 bg-green-50'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50'"
          @click="fileInputRef?.click()"
          style="cursor: pointer"
        >
          <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          <p class="text-sm text-gray-500">
            <span class="text-green-600 font-medium">Klik untuk upload</span>
            atau drag &amp; drop file ke halaman ini
          </p>
          <p class="text-xs text-gray-400 mt-1">Format: .xlsx atau .xls</p>

          <!-- Nama file yang sudah dipilih -->
          <p v-if="selectedFileName" class="mt-2 text-xs font-medium text-green-700">
            File: {{ selectedFileName }}
          </p>
        </div>

        <!-- Input file hidden -->
        <input
          type="file"
          accept=".xlsx,.xls"
          ref="fileInputRef"
          @change="handleFileChange"
          :disabled="isLoading"
          class="hidden"
        />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-6">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-3 text-sm text-gray-500">Memproses file Excel...</p>
      </div>

      <!-- ERROR: Produk tidak cocok -->
      <div v-if="errors.productMismatch" class="p-4 bg-red-50 border border-red-300 rounded-lg">
        <p class="text-sm font-semibold text-red-700 mb-2">x File Excel tidak sesuai dengan device yang dipilih</p>
        <div class="text-xs text-red-600 space-y-1">
          <p>Device dipilih: <strong>{{ errors.productMismatch.selected }}</strong></p>
          <p>File Excel: <strong>{{ errors.productMismatch.found }}</strong></p>
        </div>
        <p class="text-xs text-gray-500 mt-2">Silakan pilih device yang benar atau upload file Excel yang sesuai.</p>
      </div>

      <!-- ERROR: Header tidak cocok -->
      <div v-if="errors.headerMismatch" class="p-4 bg-red-50 border border-red-300 rounded-lg">
        <p class="text-sm font-semibold text-red-700 mb-2">x Header Excel tidak sesuai dengan template</p>
        <div v-if="errors.headerMismatch.missing.length > 0" class="mb-2">
          <p class="text-xs font-medium text-red-600 mb-1">Kolom di template tidak ditemukan di Excel:</p>
          <ul class="text-xs text-red-500 list-disc ml-4 space-y-0.5">
            <li v-for="col in errors.headerMismatch.missing" :key="col">{{ col }}</li>
          </ul>
        </div>
        <div v-if="errors.headerMismatch.extra.length > 0">
          <p class="text-xs font-medium text-orange-600 mb-1">Kolom di Excel tidak ada di template:</p>
          <ul class="text-xs text-orange-500 list-disc ml-4 space-y-0.5">
            <li v-for="col in errors.headerMismatch.extra" :key="col">{{ col }}</li>
          </ul>
        </div>
        <p class="text-xs text-gray-500 mt-2">Apakah kamu salah pilih template? Coba ganti Test Type di panel kiri.</p>
      </div>

      <!-- ERROR: General -->
      <div v-if="errors.general" class="p-4 bg-red-50 border border-red-300 rounded-lg">
        <p class="text-sm text-red-600">x {{ errors.general }}</p>
      </div>

      <!-- STEP 3 & 4: Setelah validasi berhasil -->
      <template v-if="importReady && !isLoading">

        <!-- Summary file -->
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm font-semibold text-blue-700 mb-2">
            File valid - <strong>{{ allRows.length }}</strong> baris ditemukan
          </p>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="bg-white border border-blue-200 text-blue-600 rounded px-2 py-1">
              - Sheet: <strong>{{ detectedSheet }}</strong>
            </span>
            <span class="bg-white border border-blue-200 text-blue-600 rounded px-2 py-1">
              - <strong>{{ availablePONumbers.length }}</strong> PO Number
            </span>
          </div>
        </div>

        <!-- PILIH PO NUMBER -->
        <div v-if="!selectedPO">
          <label class="block text-sm font-medium text-gray-700 mb-3">Pilih PO Number</label>

          <!-- Search filter -->
          <div class="relative mb-3">
            <input
              v-model="poSearch"
              type="text"
              placeholder="Cari PO Number..."
              class="w-full border border-gray-200 rounded-lg px-3 py-2 pl-9 text-sm
                     focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <svg class="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <button
              v-if="poSearch"
              @click="poSearch = ''"
              class="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >x</button>
          </div>

          <p v-if="filteredPONumbers.length === 0" class="text-sm text-gray-400 text-center py-4">
            Tidak ada PO Number yang cocok dengan "{{ poSearch }}"
          </p>

          <div class="space-y-2">
            <button
              v-for="po in filteredPONumbers"
              :key="po.number"
              @click="selectPO(po.number)"
              class="w-full flex items-center justify-between p-3 border rounded-lg
                     bg-white border-gray-200 hover:bg-green-50 hover:border-green-300
                     transition-colors cursor-pointer text-left"
            >
              <div>
                <p class="text-sm font-medium text-gray-800">{{ po.number }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ po.count }} baris -
                  <span class="text-emerald-600">PASS: {{ po.pass }}</span> -
                  <span class="text-red-500">FAIL: {{ po.fail }}</span>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="po.pass === po.count
                    ? 'bg-emerald-100 text-emerald-700'
                    : po.fail === po.count
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ po.pass === po.count ? '100% Pass' : po.fail === po.count ? '100% Fail' : 'Mixed' }}
                </span>
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- STEP 4: PREVIEW TABEL LENGKAP -->
        <template v-if="selectedPO">

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-800">
                PO: <span class="text-blue-700">{{ selectedPO }}</span>
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ selectedRows.length }} baris -
                <span class="text-emerald-600">PASS: {{ selectedPassCount }}</span> -
                <span class="text-red-600">FAIL: {{ selectedFailCount }}</span>
              </p>
            </div>
            <button
              @click="selectedPO = null"
              class="text-xs px-3 py-1.5 border border-gray-200 rounded-lg
                     hover:bg-gray-50 text-gray-600 transition-colors"
            >
              &larr; Ganti PO
            </button>
          </div>

          <!-- Tabel preview lengkap -->
          <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div class="overflow-x-auto overflow-y-auto" style="max-height: 420px;">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="sticky-col-1">NO</th>
                    <th rowspan="2" class="sticky-col-2">SERIAL NO.</th>
                    <template v-for="(header, i) in previewHeaders" :key="i">
                      <th
                        v-if="!header.isSub"
                        :colspan="header.colspan || 1"
                        :rowspan="header.rowspan || 1"
                      >{{ header.name }}</th>
                    </template>
                    <th rowspan="2">STATUS</th>
                    <th rowspan="2">REMARKS</th>
                  </tr>
                  <tr v-if="hasSubHeaders">
                    <template v-for="(header, i) in previewHeaders" :key="`sub-${i}`">
                      <th v-if="header.isSub" class="sub-header">{{ header.name }}</th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in selectedRows"
                    :key="rowIndex"
                    :class="row.status === 'Pass' ? 'row-pass' : 'row-fail'"
                  >
                    <td class="sticky-col-1 text-center text-gray-500">{{ rowIndex + 1 }}</td>
                    <td class="sticky-col-2 text-center font-semibold text-gray-700">{{ row.serialNumber }}</td>
                    <td
                      v-for="(col, colIdx) in flatTemplateCols"
                      :key="colIdx"
                      class="text-center"
                      :class="getCellClass(row.testResults[col.id], col)"
                    >{{ row.testResults[col.id] ?? '-' }}</td>
                    <td class="text-center">
                      <span
                        class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold text-white"
                        :class="row.status === 'Pass' ? 'bg-emerald-500' : 'bg-red-500'"
                      >{{ row.status }}</span>
                    </td>
                    <td class="text-center text-gray-500 text-xs">{{ row.remarks || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tombol Lanjut -->
          <div class="flex justify-end pt-1">
            <button
              @click="handleLanjut"
              class="h-10 px-6 rounded-md text-white font-medium
                     bg-[#6BAF92] hover:bg-[#52796F] cursor-pointer transition-colors"
            >
              Lanjut ke Testing Table &rarr;
            </button>
          </div>

        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTestingPage } from '@/composables/useTestingPage'
import { useTestingSession } from '@/composables/useTestingSession'
import { useExcelImport } from '@/composables/useExcelImport'

const router = useRouter()
const { saveSession } = useTestingSession()
const fileInputRef = ref(null)

const {
  selectedProduct,
  selectedTestType,
  templateData,
  testParameters,
} = useTestingPage()

const {
  isLoading,
  validateAndMap,
  allRows,
  detectedSheet,
  importReady,
  reset: resetImport,
} = useExcelImport()

// State
const errors          = ref({ productMismatch: null, headerMismatch: null, general: null })
const selectedPO      = ref(null)
const poSearch        = ref('')
const isDragging      = ref(false)
const selectedFileName = ref('')
let dragCounter       = 0   // counter untuk handle child dragenter/dragleave

// ----------------------------------------------------------------
// Drag & Drop handlers
// ----------------------------------------------------------------
function onDragEnter(e) {
  dragCounter++
  // Cek apakah yang di-drag adalah file
  if (e.dataTransfer?.types?.includes('Files')) {
    isDragging.value = true
  }
}

function onDragOver(e) {
  // Wajib di-prevent agar drop bisa berfungsi
  e.dataTransfer.dropEffect = isDeviceReady.value ? 'copy' : 'none'
}

function onDragLeave() {
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    isDragging.value = false
  }
}

function onDrop(e) {
  dragCounter = 0
  isDragging.value = false

  if (!isDeviceReady.value) return

  const file = e.dataTransfer?.files?.[0]
  if (!file) return

  // Validasi extension
  const ext = file.name.split('.').pop().toLowerCase()
  if (!['xlsx', 'xls'].includes(ext)) {
    errors.value.general = `Format file tidak didukung: .${ext}. Gunakan .xlsx atau .xls`
    return
  }

  selectedFileName.value = file.name
  processFile(file)
}

// ----------------------------------------------------------------
// File input handler (klik)
// ----------------------------------------------------------------
function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  selectedFileName.value = file.name
  processFile(file)
}

// ----------------------------------------------------------------
// Proses file (shared oleh drop & input)
// ----------------------------------------------------------------
async function processFile(file) {
  resetAll()
  selectedFileName.value = file.name

  try {
    const result = await validateAndMap(file, selectedProduct.value, templateData.value)
    if (!result.success) {
      if (result.errorType === 'productMismatch')     errors.value.productMismatch = result.detail
      else if (result.errorType === 'headerMismatch') errors.value.headerMismatch  = result.detail
      else                                            errors.value.general         = result.error
    }
  } catch (err) {
    errors.value.general = err.message
  }
}

// ----------------------------------------------------------------
// Computed
// ----------------------------------------------------------------
const currentStep = computed(() => {
  if (!isDeviceReady.value) return 1
  if (!importReady.value)   return 2
  if (!selectedPO.value)    return 3
  return 4
})

const stepClass = (n) => [
  'font-medium transition-colors',
  currentStep.value >= n ? 'text-green-600 font-semibold' : 'text-gray-400'
]

const isDeviceReady = computed(() =>
  !!selectedProduct.value && !!selectedTestType.value && !!templateData.value
)

const deviceLabel = computed(() => {
  if (!selectedProduct.value) return ''
  return `${selectedProduct.value.series}-${selectedProduct.value.series_number}`
})

const availablePONumbers = computed(() => {
  const map = new Map()
  for (const row of allRows.value) {
    const po = row.poNumber || 'Unknown'
    if (!map.has(po)) map.set(po, { number: po, count: 0, pass: 0, fail: 0 })
    const e = map.get(po)
    e.count++
    row.status === 'Pass' ? e.pass++ : e.fail++
  }
  return Array.from(map.values()).sort((a, b) => a.number.localeCompare(b.number))
})

const filteredPONumbers = computed(() => {
  if (!poSearch.value.trim()) return availablePONumbers.value
  const q = poSearch.value.toLowerCase().trim()
  return availablePONumbers.value.filter(po => po.number.toLowerCase().includes(q))
})

const selectedRows = computed(() =>
  selectedPO.value
    ? allRows.value.filter(r => (r.poNumber || 'Unknown') === selectedPO.value)
    : []
)

const selectedPassCount = computed(() => selectedRows.value.filter(r => r.status === 'Pass').length)
const selectedFailCount = computed(() => selectedRows.value.filter(r => r.status === 'Fail').length)

const flatTemplateCols = computed(() => {
  const columns = templateData.value?.custom_columns?.columns || []
  const result  = []
  function walk(cols) {
    for (const col of cols) {
      if (col.isReference) continue
      if (col.isSplit && col.sub?.length > 0) walk(col.sub)
      else result.push(col)
    }
  }
  walk(columns)
  return result
})

const previewHeaders = computed(() => {
  const columns = templateData.value?.custom_columns?.columns || []
  const headers = []
  for (const col of columns) {
    if (col.isReference) continue
    if (col.isSplit && col.sub?.length > 0) {
      headers.push({ name: col.name, colspan: col.sub.length, rowspan: 1, isSub: false })
      col.sub.forEach(sub => headers.push({ name: sub.name, colspan: 1, rowspan: 1, isSub: true, lsl: sub.lsl, usl: sub.usl }))
    } else {
      headers.push({ name: col.name, colspan: 1, rowspan: 2, isSub: false, lsl: col.lsl, usl: col.usl })
    }
  }
  return headers
})

const hasSubHeaders = computed(() => previewHeaders.value.some(h => h.isSub))

// ----------------------------------------------------------------
// Watchers
// ----------------------------------------------------------------
watch([selectedProduct, selectedTestType], () => resetAll())

// ----------------------------------------------------------------
// Methods
// ----------------------------------------------------------------
function resetAll() {
  resetImport()
  errors.value          = { productMismatch: null, headerMismatch: null, general: null }
  selectedPO.value      = null
  poSearch.value        = ''
  selectedFileName.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function selectPO(po) {
  selectedPO.value = po
}

function getCellClass(value, col) {
  if (value === undefined || value === null || value === '') return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  const belowLSL = !isNaN(parseFloat(col.lsl)) && num < parseFloat(col.lsl)
  const aboveUSL = !isNaN(parseFloat(col.usl)) && num > parseFloat(col.usl)
  return (belowLSL || aboveUSL) ? 'cell-fail' : 'cell-pass'
}

function handleLanjut() {
  if (!selectedRows.value.length) return
  const rows     = selectedRows.value
  const firstRow = rows[0]

  saveSession({
    operatorName:   firstRow.operator   || 'Unknown',
    testDate:       firstRow.testDate   || new Date().toISOString().split('T')[0],
    poNumber:       firstRow.poNumber   || '',
    lotNumber:      '',
    multimeterSN:   '',
    oscilloscopeSN: '',
    product:        selectedProduct.value,
    testType:       selectedTestType.value,
    template:       templateData.value,
    parameters:     testParameters.value,
    quantity:       rows.length,
    serialNumber:   firstRow.serialNumber || 0,
    fromExcel:      true,
    excelRows:      rows,
  })

  router.push({ name: 'TestingTable' })
}
</script>

<style scoped>
/* Fade transition untuk overlay */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.preview-table {
  width: 100%;
  font-size: 0.75rem;
  border-collapse: separate;
  border-spacing: 0;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.preview-table th {
  background: #2F855A;
  color: #fff;
  padding: 8px 6px;
  text-align: center;
  font-weight: 700;
  font-size: 11px;
  border: 1px solid #047857;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: normal;
  word-break: break-word;
  min-width: 70px;
  max-width: 140px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.preview-table th.sub-header {
  background: #E6F4EE;
  color: #065F46;
  font-weight: 600;
  text-transform: none;
  top: 36px;
  border: 1px solid #a7f3d0;
}
.preview-table td {
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  vertical-align: middle;
  white-space: nowrap;
}
.preview-table tbody tr:hover { background-color: #f0fdf4; }
.row-pass { background-color: #f0fdf4; }
.row-fail { background-color: #fff5f5; }
.cell-pass { background-color: #d1fae5 !important; color: #065f46; font-weight: 600; }
.cell-fail { background-color: #fee2e2 !important; color: #991b1b; font-weight: 600; }
.sticky-col-1 {
  position: sticky; left: 0;
  background: #2F855A; z-index: 11; min-width: 40px;
}
.sticky-col-2 {
  position: sticky; left: 40px;
  background: #2F855A; z-index: 11; min-width: 100px;
}
.preview-table tbody .sticky-col-1,
.preview-table tbody .sticky-col-2 { background: #f1f5f9; z-index: 5; }
.preview-table tbody tr:hover .sticky-col-1,
.preview-table tbody tr:hover .sticky-col-2 { background: #e2e8f0; }
</style>