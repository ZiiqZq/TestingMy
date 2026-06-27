<!-- AddProduct.vue -->
<template>
  <div class="h-full flex flex-col overflow-hidden bg-white mb-24">

    <!-- Empty state -->
    <div v-if="!activeTest"
      class="flex-1 flex flex-col items-center justify-center gap-3 mt-4 text-[#808080] select-none">
      <svg viewBox="0 0 24 24" fill="none" class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" stroke="#808080"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.2798 22H7.00977C5.9489 22 4.93148 21.5785 4.18134 20.8284C3.43119 20.0782 3.00977 19.0609 3.00977 18V14.89C3.00977 11.4713 4.36781 8.19273 6.78516 5.77539C9.2025 3.35805 12.4811 2 15.8998 2H17.0098C18.0706 2 19.0881 2.42142 19.8382 3.17157C20.5883 3.92172 21.0098 4.93913 21.0098 6V11.4399" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3 15.06C3 9.9 8.50004 14.0599 11.73 10.8199C14.96 7.57995 10.83 2 15.98 2" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15.2793 22L21.2793 16" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15.2793 16L21.2793 22" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      <p class="text-sm">Select a test sequence from the left to start</p>
    </div>

    <template v-else>
      <div class="flex flex-col h-full overflow-hidden">
        <!-- Upper area (62%) -->
        <div class="flex flex-col overflow-hidden" style="height:62%">
          <!-- Header row -->
          <div class="flex items-center justify-between px-5 pt-4 pb-0 flex-shrink-0">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Test Matrix Setup</p>
              <p class="text-sm font-semibold text-gray-700 mt-0.5">{{ activeTest.testTypeName }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="refParams.length"
                class="text-[10px] bg-blue-50 border border-blue-100 text-blue-500 font-semibold px-2 py-0.5 rounded-full">
                {{ refParams.length }} ref param{{ refParams.length > 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <!-- Tab bar dengan tombol add di akhir -->
          <div class="px-5 pt-3 flex-shrink-0">
            <div class="flex items-center overflow-x-auto tab-scroll">
              <button
                v-for="(col, idx) in roots"
                :key="col.id"
                @click="activeTabId = col.id"
                :class="['tab', activeTabId === col.id ? 'tab--active' : 'tab--idle']">
                  <span class="tab-label">{{ col.name || `Column ${idx + 1}` }}</span>
                  <span v-if="col.isSplit && col.sub.length" class="tab-badge">{{ col.sub.length }}</span>
                  <span @click.stop="askDelete(col.id)" class="tab-close">×</span>
              </button>
              <!-- Tombol add column sebagai tab khusus -->
              <button @click="addRoot" class="tab-add-btn" title="Add column">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
            <div class="border-b border-gray-200 -mt-px"></div>
          </div>

          <!-- Column form scrollable -->
          <div class="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            <div v-if="!roots.length"
              class="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
              <p class="text-sm text-gray-300">Click "+" to add your first column</p>
            </div>
            <template v-else-if="activeCol">
              <!-- Parent column (split) -->
              <template v-if="activeCol.isSplit">
                <div class="col-card col-card--parent mb-4">
                  <div class="col-card-header">
                    <span class="col-badge col-badge--parent">PARENT</span>
                    <div class="ml-auto flex gap-2">
                      <button @click="addSub(activeCol.id)" class="btn-sm btn-sm--teal">+ Add Sub</button>
                      <button @click="askDelete(activeCol.id)" class="btn-sm btn-sm--red">Delete</button>
                    </div>
                  </div>
                  <div class="mt-3">
                    <label class="field-label">Parent Name *</label>
                    <input :value="activeCol.name"
                      @input="upd(activeCol.id, 'name', $event.target.value)"
                      type="text" placeholder="e.g. Output Voltage" class="field-input" />
                  </div>
                </div>
                <!-- Sub-column pills -->
                <div class="flex gap-1.5 mb-3 overflow-x-auto sub-scroll pb-0.5">
                  <button
                    v-for="(sub, si) in activeCol.sub"
                    :key="sub.id"
                    @click="activeSubId = sub.id"
                    :class="['sub-pill', activeSubId === sub.id ? 'sub-pill--on' : 'sub-pill--off']">
                    <span class="sub-pill-num">{{ si + 1 }}</span>
                    <span v-if="sub.name" class="sub-pill-name"> · {{ sub.name }}</span>
                  </button>
                </div>
                <!-- Active sub form -->
                <div v-if="activeSub" class="col-card col-card--sub">
                  <div class="col-card-header">
                    <span class="text-xs text-yellow-600 mr-1">└─</span>
                    <span class="text-sm font-bold text-gray-700">
                      Sub {{ activeCol.sub.findIndex(s => s.id === activeSub.id) + 1 }}
                    </span>
                    <span class="col-badge col-badge--sub ml-1.5">SUB</span>
                    <button @click="askDelete(activeSub.id)" class="btn-sm btn-sm--red ml-auto">Delete</button>
                  </div>
                  <div class="mt-3 space-y-3">
                    <div>
                      <label class="field-label">Column Name *</label>
                      <input :value="activeSub.name"
                        @input="upd(activeSub.id, 'name', $event.target.value)"
                        type="text" placeholder="Column Name" class="field-input" />
                    </div>
                    <validation-fields :col="activeSub" @update="upd" />
                  </div>
                </div>
              </template>

              <!-- Regular column (non-split) -->
              <template v-else>
                <div class="col-card">
                  <div class="col-card-header">
                    <span class="text-sm font-bold text-gray-700">
                      Column {{ roots.findIndex(c => c.id === activeCol.id) + 1 }}
                    </span>
                    <div class="ml-auto flex gap-2">
                      <button @click="split(activeCol.id)" class="btn-sm btn-sm--teal">Split</button>
                      <button @click="askDelete(activeCol.id)" class="btn-sm btn-sm--red">Delete</button>
                    </div>
                  </div>
                  <div class="mt-3 space-y-3">
                    <div>
                      <label class="field-label">Column Name *</label>
                      <input :value="activeCol.name"
                        @input="upd(activeCol.id, 'name', $event.target.value)"
                        type="text" placeholder="Column Name" class="field-input" />
                    </div>
                    <validation-fields :col="activeCol" @update="upd" />
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>

        <!-- Lower area (38%): preview table -->
        <div class="border-t border-gray-100 flex flex-col overflow-hidden" style="height:38%">
          <div class="flex items-center justify-between px-5 pt-3 pb-1.5 flex-shrink-0">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preview Table</p>
            <button @click="save" class="btn-save-template">Save Template</button>
          </div>
          <div class="flex-1 overflow-auto px-5 pb-3 min-h-0">
            <table class="preview-table">
              <thead>
                <tr>
                  <th v-for="h in DEFAULT_HEADERS" :key="h" rowspan="2" class="th-default">{{ h }}</th>
                  <template v-for="col in roots" :key="'r1-'+col.id">
                    <th v-if="col.isSplit && col.sub.length" :colspan="col.sub.length" class="th-custom-parent">
                      {{ col.name || 'Parent' }}
                    </th>
                    <th v-else rowspan="2" class="th-custom" style="min-width:80px; white-space:pre-line">
                      {{ previewLabel(col) }}
                    </th>
                  </template>
                  <th rowspan="2" class="th-status">Status</th>
                  <th rowspan="2" class="th-default">Remarks</th>
                </tr>
                <tr v-if="hasSubs">
                  <template v-for="col in roots" :key="'r2-'+col.id">
                    <template v-if="col.isSplit && col.sub.length">
                      <th v-for="sub in col.sub" :key="sub.id" class="th-custom-sub" style="min-width:70px; white-space:pre-line">
                        {{ previewLabel(sub) }}
                      </th>
                    </template>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr class="text-gray-200 text-center">
                  <td v-for="h in DEFAULT_HEADERS" :key="'dd-'+h" class="td">—</td>
                  <template v-for="col in roots" :key="'dv-'+col.id">
                    <template v-if="col.isSplit && col.sub.length">
                      <td v-for="sub in col.sub" :key="sub.id" class="td">—</td>
                    </template>
                    <td v-else class="td">—</td>
                  </template>
                  <td class="td">—</td>
                  <td class="td">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete confirmation modal -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="deleteModal.show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="deleteModal.show = false">
          <div class="bg-white rounded-2xl shadow-2xl w-80 p-6 mx-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-800">Delete Column</h3>
            </div>
            <p class="text-sm text-gray-500 mb-5">This will also remove all sub-columns.</p>
            <div class="flex gap-2">
              <button @click="doDelete" class="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">Delete</button>
              <button @click="deleteModal.show = false" class="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Toast notification -->
    <teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" :class="['fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white', toast.type === 'error' ? 'bg-red-500' : 'bg-green-600']">
          {{ toast.msg }}
        </div>
      </transition>
    </teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, defineComponent, toRaw, onUnmounted } from 'vue'
import { useAddProductState } from '@/composables/useAddProductState'

onUnmounted(() => {
  // Jika produk memiliki ID null (belum tersimpan), hapus semua data test sequence
  if (selectedProduct.value && !selectedProduct.value.id) {
    setSequence([])
    setParameters({})
    selectTest(null)
    existingTemplateIds.value = new Set()
    // Opsional: reset juga selectedProduct menjadi null agar form kosong saat kembali
    // setProduct(null)
  }
});

// ValidationFields component (inline dengan template string, butuh alias vue di vite.config)
const ValidationFields = defineComponent({
  name: 'ValidationFields',
  props: { col: { type: Object, required: true } },
  emits: ['update'],
  setup(props, { emit }) {
    function numInput(e) {
      let v = e.target.value.replace(/[^0-9.-]/g, '')
      const m = (v.match(/-/g) || []).length
      if (m > 1) v = v.replace(/-/g, (c, o) => o === 0 ? c : '')
      if (v.indexOf('-') > 0) { v = v.replace(/-/g, ''); v = '-' + v }
      const d = (v.match(/\./g) || []).length
      if (d > 1) { const p = v.split('.'); v = p[0] + '.' + p.slice(1).join('') }
      e.target.value = v
    }
    return { numInput, emit }
  },
  template: `
    <div class="space-y-3">
      <div>
        <label class="field-label">Validation Type *</label>
        <select :value="col.validationType"
          @change="emit('update', col.id, 'validationType', $event.target.value)"
          class="field-input">
          <option value="lsl_usl">Number (LSL / USL)</option>
          <option value="pass_fail">Pass / Fail (Pass/Fail)</option>
          <option value="text_match">Text Match (Custom)</option>
        </select>
      </div>

      <template v-if="col.validationType === 'lsl_usl'">
        <div>
          <label class="field-label">Unit</label>
          <input :value="col.unit"
            @input="emit('update', col.id, 'unit', $event.target.value)"
            type="text" placeholder="e.g. kV, mA, V"
            class="field-input" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">LSL</label>
            <input :value="col.lsl"
              @input="numInput($event); emit('update', col.id, 'lsl', $event.target.value)"
              type="text" placeholder="0.00"
              class="field-input" />
          </div>
          <div>
            <label class="field-label">USL</label>
            <input :value="col.usl"
              @input="numInput($event); emit('update', col.id, 'usl', $event.target.value)"
              type="text" placeholder="0.00"
              class="field-input" />
          </div>
        </div>
        <p class="text-xs text-red-400">* At least one of LSL or USL must be filled</p>
      </template>

      <template v-else-if="col.validationType === 'pass_fail'">
        <div>
          <label class="field-label">Expected Value</label>
          <select :value="col.expectedValue"
            @change="emit('update', col.id, 'expectedValue', $event.target.value)"
            class="field-input">
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </select>
        </div>
      </template>

      <template v-else-if="col.validationType === 'text_match'">
        <div>
          <label class="field-label">Expected Text (Case‑sensitive)</label>
          <input :value="col.expectedValue"
            @input="emit('update', col.id, 'expectedValue', $event.target.value)"
            type="text"
            placeholder="e.g. No ignition, OK, 123"
            class="field-input" />
        </div>
      </template>
    </div>
  `
})

// Shared state from composable
const { activeTest, selectedProduct, setProduct, sequence, parameters } = useAddProductState()

// Local column state
const store       = ref({})
const activeTabId = ref(null)
const activeSubId = ref(null)
const refParams   = ref([])
let count = 0

const deleteModal = reactive({ show: false, colId: null })
const toast = reactive({ show: false, type: '', msg: '' })
const DEFAULT_HEADERS = ['No', 'Operator', 'Test Date', 'PO Number', 'Serial Number']

// Column factory
function mkCol(parentId = null) {
  return {
    id: 'col_' + count++,
    name: '',
    isSplit: false,
    validationType: 'lsl_usl',
    lsl: '',
    usl: '',
    unit: '',
    expectedValue: '',
    parentId,
    sub: [],
    isReference: false,
  }
}

// Computed
const flat = computed(() => activeTest.value ? (store.value[activeTest.value.testTypeId] || []) : [])
const roots = computed(() => flat.value.filter(c => !c.parentId))
const activeCol = computed(() => {
  if (!activeTabId.value) return roots.value[0] || null
  return flat.value.find(c => c.id === activeTabId.value) || null
})
const activeSub = computed(() => {
  if (!activeCol.value?.isSplit) return null
  const sub = activeCol.value.sub
  return sub.find(s => s.id === activeSubId.value) || sub[0] || null
})
const hasSubs = computed(() => roots.value.some(c => c.isSplit && c.sub.length))

// Watchers
watch(activeTest, async (t) => {
  if (!t) return
  store.value[t.testTypeId] = store.value[t.testTypeId] || []
  activeTabId.value = roots.value[0]?.id || null
  activeSubId.value = null
  if (selectedProduct.value) {
    try {
      const r = await window.electron.db.getTestParameters({ productId: selectedProduct.value.id, testTypeId: t.testTypeId })
      refParams.value = r.success ? r.data : []
    } catch { refParams.value = [] }
  }
}, { immediate: true })

watch(activeCol, (col) => {
  if (!col?.isSplit) { activeSubId.value = null; return }
  if (!col.sub.find(s => s.id === activeSubId.value)) activeSubId.value = col.sub[0]?.id || null
})

// Column operations
function addRoot() {
  if (!activeTest.value) return
  const tid = activeTest.value.testTypeId
  const col = mkCol()
  store.value[tid] = store.value[tid] || []
  store.value[tid].push(col)
  activeTabId.value = col.id
}

function addSub(parentId) {
  const parent = flat.value.find(c => c.id === parentId)
  if (!parent) return
  const sub = mkCol(parentId)
  parent.sub.push(sub)
  store.value[activeTest.value.testTypeId].push(sub)
  activeSubId.value = sub.id
}

function split(colId) {
  const col = flat.value.find(c => c.id === colId)
  if (!col || col.parentId) return
  col.isSplit = true; col.validationType = null
  const s1 = mkCol(colId), s2 = mkCol(colId)
  col.sub = [s1, s2]
  store.value[activeTest.value.testTypeId].push(s1, s2)
  activeSubId.value = s1.id
}

function upd(id, prop, value) {
  const col = flat.value.find(c => c.id === id)
  if (!col) return
  col[prop] = value
  if (prop === 'validationType') {
    // Reset fields that are not relevant for the new type
    if (value === 'lsl_usl') {
      col.expectedValue = ''
      // keep lsl, usl, unit
    } else if (value === 'pass_fail') {
      col.lsl = ''
      col.usl = ''
      col.unit = ''
      col.expectedValue = 'Pass'
    } else if (value === 'text_match') {
      col.lsl = ''
      col.usl = ''
      col.unit = ''
      col.expectedValue = ''
    }
  }
}

function askDelete(colId) { deleteModal.colId = colId; deleteModal.show = true }

function doDelete() {
  const colId = deleteModal.colId
  const tid = activeTest.value?.testTypeId
  if (!colId || !tid) return
  const col = flat.value.find(c => c.id === colId)
  if (!col) return
  const rm = new Set()
  const collect = (c) => { rm.add(c.id); c.sub?.forEach(collect) }
  collect(col)
  if (col.parentId) {
    const parent = flat.value.find(c => c.id === col.parentId)
    if (parent) {
      parent.sub = parent.sub.filter(s => s.id !== colId)
      if (!parent.sub.length) { parent.isSplit = false; parent.validationType = 'lsl_usl' }
    }
  }
  store.value[tid] = store.value[tid].filter(c => !rm.has(c.id))
  if (rm.has(activeTabId.value)) activeTabId.value = store.value[tid].filter(c => !c.parentId)[0]?.id || null
  if (rm.has(activeSubId.value)) activeSubId.value = activeCol.value?.sub?.[0]?.id || null
  deleteModal.show = false; deleteModal.colId = null
}

// Preview label helper
function previewLabel(col) {
  let t = col.name || 'Column'
  if (col.unit && col.validationType === 'lsl_usl') t += ` (${col.unit})`
  if (col.validationType === 'lsl_usl' && (col.lsl || col.usl)) {
    t += '\n'
    if (col.lsl) t += `LSL: ${col.lsl} `
    if (col.usl) t += `USL: ${col.usl}`
  }
  if (col.validationType === 'pass_fail' && col.expectedValue) {
    t += `\nExpected: ${col.expectedValue}`
  }
  if (col.validationType === 'text_match' && col.expectedValue) {
    t += `\nExpected text: "${col.expectedValue}"`
  }
  return t
}

// Validation before save
function validate(cols) {
  for (const c of cols) {
    if (!c.name.trim()) { showToast('error', 'All columns must have a name'); return false }
    if (!c.isSplit) {
      if (c.validationType === 'lsl_usl' && !c.lsl && !c.usl) {
        showToast('error', `"${c.name}": fill LSL or USL`); return false
      }
      if (c.validationType === 'pass_fail' && !c.expectedValue) {
        showToast('error', `"${c.name}": Expected value (Pass/Fail) is required`); return false
      }
      if (c.validationType === 'text_match' && !c.expectedValue.trim()) {
        showToast('error', `"${c.name}": Expected text is required`); return false
      }
    }
    if (c.sub?.length && !validate(c.sub)) return false
  }
  return true
}

// Save product (if new) and template
async function save() {
  if (!activeTest.value) { showToast('error', 'No test selected'); return }
  if (!selectedProduct.value) { showToast('error', 'Product information is missing'); return }

  let productId = selectedProduct.value.id

  // 1. Handle product baru
  if (!productId) {
    const seqList = sequence.value
    if (!seqList.length) {
      showToast('error', 'Please add at least one test sequence before saving')
      return
    }
    const plainParams = JSON.parse(JSON.stringify(toRaw(parameters.value)))
    const productResult = await window.electron.db.saveProductWithSequence({
      productName: selectedProduct.value.name,
      seriesNumber: selectedProduct.value.series_number,
      seriesName: selectedProduct.value.series,
      testSequence: seqList.map(s => ({ testTypeId: s.testTypeId, sequenceOrder: s.sequenceOrder })),
      testParameters: plainParams,
      productId: null
    })
    if (!productResult.success) {
      showToast('error', 'Failed to save product: ' + productResult.error)
      return
    }
    productId = productResult.productId
    setProduct({ ...selectedProduct.value, id: productId })
    showToast('success', 'Product saved successfully')
  } 
  // 2. Handle product existing – validasi apakah test type sudah terdaftar
  else {
    try {
      const existingSeq = await window.electron.db.getProductTestTypes(productId)
      if (!existingSeq.success) throw new Error(existingSeq.error)
      const existingIds = existingSeq.data.map(st => st.id)
      const currentTestTypeId = activeTest.value.testTypeId
      if (!existingIds.includes(currentTestTypeId)) {
        showToast('error', `Test type "${activeTest.value.testTypeName}" is not added to this product. Please add it via product sequence.`)
        return
      }
    } catch (err) {
      showToast('error', 'Failed to validate product test sequence')
      return
    }
  }

  // 3. Validasi template columns
  if (!roots.value.length) { showToast('error', 'Add at least one column'); return }
  if (!validate(roots.value)) return

  // 4. Simpan template
  const productFamily = selectedProduct.value.name
  const device = selectedProduct.value.series
  const seriesNum = selectedProduct.value.series_number
  const devicePart = device + (seriesNum ? ` (${seriesNum})` : '')
  const tname = [productFamily, devicePart, '-', activeTest.value.testTypeName].filter(Boolean).join(' - ')

  const toPlain = (obj) => JSON.parse(JSON.stringify(toRaw(obj)))
  const refParamsPlain = refParams.value.map(p => ({ /* ... */ }))
  const rootsPlain = toPlain(roots.value)
  const allCols = [...refParamsPlain, ...rootsPlain]

  try {
    const r = await window.electron.db.saveTemplate({ productId, testTypeId: activeTest.value.testTypeId, templateName: tname, columns: allCols })
    if (r.success) {
      showToast('success', 'Template saved!')
      store.value[activeTest.value.testTypeId] = []
      activeTabId.value = null
      setTimeout(() => window.location.reload(), 1500)
    } else {
      showToast('error', r.error || 'Failed to save template')
    }
  } catch (e) {
    console.error(e)
    showToast('error', e.message)
  }
}

function showToast(type, msg) { toast.type = type; toast.msg = msg; toast.show = true; setTimeout(() => toast.show = false, 3500) }
</script>

<style scoped>
/* Field styles */
.field-input { @apply w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-100 transition-all duration-150; }
.field-label { @apply block text-xs font-semibold text-gray-600 mb-1.5; }

/* Tab bar - modern web design */
.tab-scroll { scrollbar-width: thin; display: flex; align-items: center; gap: 0.1rem; overflow-x: auto; padding-bottom: 2px; }
.tab { @apply relative flex items-center border-gray-200 border-2 gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer select-none flex-shrink-0 transition-all; background: transparent; border-bottom: 2px solid transparent; font-size: 0.75rem; font-weight: 500; color: #6b7280; }
.tab:hover { color: #374151; border-bottom-color: #d1d5db; }
.tab--active { color: #374151; border-bottom-color: #52796F; font-weight: 600; background: #EFEFEF; }
.tab--idle { color: #9ca3af; }
.tab-label { @apply text-xs font-medium truncate max-w-[100px]; }
.tab-badge { @apply text-[10px] bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 ml-1; }
.tab-close { @apply w-3.5 h-3.5 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs font-bold cursor-pointer ml-1; }
.tab-add-btn { @apply w-7 h-7 rounded-full bg-[#52796F] hover:bg-[#2F3E46] text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm hover:shadow-md; border: none; cursor: pointer; }

/* Sub pills */
.sub-pill { @apply flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all flex-shrink-0 border; }
.sub-pill--on { @apply bg-[#2F3E46] text-white border-[#2F3E46]; }
.sub-pill--off { @apply bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600; }
.sub-pill-num { @apply leading-none; }
.sub-pill-name { @apply font-normal truncate max-w-[55px]; }

/* Column cards */
.col-card { @apply bg-[#f8f9fa] border border-[#CAD2C5] rounded-xl p-4; }
.col-card--parent { @apply bg-blue-50 border-2 border-blue-300; }
.col-card--sub { @apply bg-yellow-50 border-l-4 border-yellow-400 ml-4; }
.col-card-header { @apply flex items-center; }
.col-badge { @apply text-xs font-bold px-1.5 py-0.5 rounded; }
.col-badge--parent { @apply bg-blue-600 text-white; }
.col-badge--sub { @apply bg-yellow-500 text-white; }

/* Buttons */
.btn-sm { @apply px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors; }
.btn-sm--teal { @apply bg-[#52796F] hover:bg-[#2F3E46] text-white; }
.btn-sm--red { @apply bg-[#800f2f] hover:bg-[#590d22] text-white; }
.btn-save-template { @apply px-4 py-1.5 bg-[#52796F] hover:bg-[#2F3E46] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors; }

/* Preview table */
.preview-table { @apply w-full border-collapse text-[11px]; min-width: max-content; }
.th-default { @apply px-3 py-2 bg-gray-200 text-gray-800 font-semibold border border-gray-300 text-center whitespace-nowrap; }
.th-custom { @apply px-3 py-2 bg-blue-100 text-blue-800 font-semibold border border-blue-200 text-center; }
.th-custom-parent { @apply px-3 py-2 bg-blue-100 text-blue-800 font-semibold border border-blue-200 text-center; }
.th-custom-sub { @apply px-3 py-1.5 bg-blue-50 text-blue-700 font-medium border border-blue-100 text-center; }
.th-status { @apply px-3 py-2 bg-green-100 text-green-800 font-semibold border border-green-200 text-center; }
.td { @apply px-3 py-2 border border-gray-100 text-center; }

/* Scrollbars */
.tab-scroll::-webkit-scrollbar, .sub-scroll::-webkit-scrollbar { display: none; }
.tab-scroll, .sub-scroll { scrollbar-width: none; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>