<!-- leftaddproduct.vue -->
<template>
  <div class="pl-4 pr-3 h-full overflow-y-auto bg-gray-50">

    <!-- Product Information -->
    <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Product Information</h3>
      <div class="space-y-4">
        <div>
          <label class="field-label">Family</label>
          <div class="relative">
            <input
              v-model="productSearchInput"
              @focus="showProductDropdown = true"
              @blur="onProductBlur"
              @input="onProductInput"
              type="text"
              placeholder="e.g. Transformer"
              class="field-input"
            />
            <div
              v-if="showProductDropdown && filteredFamilyNames.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              <div
                v-for="name in filteredFamilyNames"
                :key="name"
                @mousedown.prevent="selectFamily(name)"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors"
              >
                {{ name }}
              </div>
            </div>
          </div>
        </div>
        <!-- Device -->
        <div>
          <label class="field-label">Device</label>
          <div class="relative">
            <input
              v-model="deviceSearchInput"
              @focus="showDeviceDropdown = true"
              @blur="onDeviceBlur"
              @input="onDeviceInput"
              type="text"
              placeholder="e.g. 201-Series"
              class="field-input"
            />
            <div
              v-if="showDeviceDropdown && filteredDevices.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              <div
                v-for="device in filteredDevices"
                :key="device"
                @mousedown.prevent="selectDevice(device)"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors"
              >
                {{ device }}
              </div>
            </div>
          </div>
        </div>

        <!-- Device's Series -->
        <div>
          <label class="field-label">Device's Series</label>
          <div class="relative">
            <input
              v-model="seriesSearchInput"
              @focus="showSeriesDropdown = true"
              @blur="onSeriesBlur"
              @input="onSeriesInput"
              type="text"
              placeholder="e.g. 1101"
              class="field-input"
            />
            <div
              v-if="showSeriesDropdown && filteredSeriesNumbers.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              <div
                v-for="series in filteredSeriesNumbers"
                :key="series"
                @mousedown.prevent="selectSeriesNumber(series)"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors"
              >
                {{ series }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

   <!-- Test Sequence -->
    <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-700">Test Sequence</h3>
        <button 
          @click="openAddTestModal" 
          class="btn-icon-sm"
          :class="{ 'opacity-50 bg-gray-400': !isProductInfoComplete }"
          title="Add test type">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>

      <!-- Sequence list -->
      <div class="space-y-2 mb-6">
        <div v-for="test in sequence" :key="test.id"
          @click="!isTestTypeBlocked(test.testTypeId) && selectTest(test)"
          :class="[
            'test-seq-item', 
            activeTest?.testTypeId === test.testTypeId ? 'test-seq-item--active' : '',
            isTestTypeBlocked(test.testTypeId) ? 'test-seq-item--blocked' : ''
          ]">
          <div class="flex items-center gap-3 flex-1">
            <div :class="['test-radio', activeTest?.testTypeId === test.testTypeId ? 'test-radio--on' : '']">
              <div v-if="activeTest?.testTypeId === test.testTypeId" class="test-radio-dot"></div>
            </div>
            <span class="text-sm font-medium">{{ test.testTypeName }}</span>
            <span v-if="test.isNew" class="badge-new">New</span>
            <span v-if="isTestTypeBlocked(test.testTypeId)" class="badge-blocked text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full ml-2">Matrix exists</span>
          </div>
          <button @click.stop="removeTest(test.id)" class="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">×</button>
        </div>
        <div v-if="!sequence.length" class="text-xs text-gray-300 text-center py-3">
          No test sequence yet. Click + to add.
        </div>
      </div>

      <!-- Test Parameters -->
      <div class="border-t border-gray-100 pt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-md font-medium text-gray-700">Test Parameters</h4>
          <button 
            @click="openAddParamModal" 
            class="btn-icon-sm"
            :class="{ 'opacity-50 bg-gray-400': !activeTest }"
            title="Add parameter">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
        <div v-if="!currentParams.length" class="text-xs text-gray-300 text-center py-3">
          No parameters yet
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div v-for="(param, idx) in currentParams" :key="idx"
            class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
            <span class="font-medium text-gray-700">{{ param.name }}</span>
            <span class="text-gray-500 truncate max-w-[120px] mx-2">{{ param.value }}</span>
            <button @click="removeParameter(idx)"
              class="text-gray-300 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add Test Type -->
    <Teleport to="body">
      <div v-if="modalAddTest"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        @click.self="modalAddTest = false">
        <div class="bg-white rounded-2xl shadow-2xl w-96 p-5">
          <h3 class="text-lg font-bold mb-3">Add Test Type</h3>
          <div class="space-y-3">
            <div>
              <label class="field-label">Select existing</label>
              <select v-model="selectedTestTypeId" class="field-input">
                <option value="">— Select —</option>
                <option v-for="tt in allTestTypes" :key="tt.id" :value="tt.id">{{ tt.name }}</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 border-t border-gray-100"></div>
              <span class="text-xs text-gray-300">or</span>
              <div class="flex-1 border-t border-gray-100"></div>
            </div>
            <div>
              <label class="field-label">Create new</label>
              <input v-model="newTestName" type="text" placeholder="e.g. Hi-Pot Test"
                class="field-input" @keyup.enter="confirmAddTest" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="modalAddTest = false" class="btn-ghost">Cancel</button>
            <button @click="confirmAddTest" class="btn-primary">Add</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Add Parameter -->
    <Teleport to="body">
      <div v-if="modalAddParam"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        @click.self="modalAddParam = false">
        <div class="bg-white rounded-2xl shadow-2xl w-96 p-5">
          <h3 class="text-lg font-bold mb-3">Add Parameter</h3>
          <div class="space-y-3">
            <div>
              <label class="field-label">Name</label>
              <input v-model="newParam.name" type="text" class="field-input" />
            </div>
            <div>
              <label class="field-label">Value</label>
              <input v-model="newParam.value" type="text" class="field-input" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="modalAddParam = false" class="btn-ghost">Cancel</button>
            <button @click="addParameter" class="btn-primary">Add</button>
          </div>
        </div>
      </div>
    </Teleport>
    

    <!-- Toast Notification (pojok kanan bawah) -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show"
          :class="['fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white',
                   toast.type === 'error' ? 'bg-red-500' : 'bg-green-600']">
          {{ toast.msg }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAddProductState } from '@/composables/useAddProductState'

const {
  selectedProduct,
  setProduct,
  sequence,
  setSequence,
  parameters,
  setParameters,
  activeTest,
  selectTest,
} = useAddProductState()

// Product list untuk autocomplete (ambil semua produk dari DB)
const productList = ref([])
const showProductDropdown = ref(false)
const productSearchInput = ref('')

const showDeviceDropdown = ref(false)
const deviceSearchInput = ref('')
const showSeriesDropdown = ref(false)
const seriesSearchInput = ref('')

const existingTemplateIds = ref(new Set()) // Set of testTypeId that have templates

// Local state
const form = reactive({ productName: '', device: '', seriesNumber: '' })
const allTestTypes       = ref([])
const modalAddTest       = ref(false)
const modalAddParam      = ref(false)
const selectedTestTypeId = ref('')
const newTestName        = ref('')
const newParam           = reactive({ name: '', value: '' })

// Daftar device unik dari semua produk
const allDevices = computed(() => {
  if (!form.productName) return []
  const devices = productList.value
    .filter(p => p.product_name === form.productName)
    .map(p => p.series)
    .filter(Boolean)
  return [...new Set(devices)].sort()
})

// Filter device berdasarkan input
const filteredDevices = computed(() => {
  const q = deviceSearchInput.value.toLowerCase().trim()
  if (!q) return allDevices.value
  return allDevices.value.filter(d => d.toLowerCase().includes(q))
})

// Daftar series number unik
const allSeriesNumbers = computed(() => {
  if (!form.productName) return []
  const series = productList.value
    .filter(p => p.product_name === form.productName)
    .map(p => p.series_number)
    .filter(Boolean)
  return [...new Set(series)].sort()
})

// Filter series berdasarkan input
const filteredSeriesNumbers = computed(() => {
  const q = seriesSearchInput.value.toLowerCase().trim()
  if (!q) return allSeriesNumbers.value
  return allSeriesNumbers.value.filter(s => s.toLowerCase().includes(q))
})

async function isTestTypeHasMatrix(productId, testTypeId) {
  if (!productId) return false
  try {
    const res = await window.electron.db.getTemplatesByProduct(productId)
    if (res.success && res.data.length) {
      return res.data.some(t => t.test_type_id === testTypeId)
    }
    return false
  } catch (err) {
    console.error(err)
    return false
  }
}

// Fungsi untuk mencari product existing
async function loadExistingProduct(family, device, seriesNumber) {
  try {
    const res = await window.electron.db.getProducts()
    if (!res.success) return null
    const matched = res.data.find(p => 
      p.product_name === family && 
      p.series === device && 
      p.series_number === seriesNumber
    )
    if (!matched) return null

    // Load templates (matrix) untuk product ini
    await loadProductTemplates(matched.id)

    // Load test sequence
    const seqRes = await window.electron.db.getProductTestTypes(matched.id)
    if (seqRes.success && seqRes.data.length) {
      const seqList = seqRes.data.map((st, idx) => ({
        id: `seq_${Date.now()}_${idx}`,
        testTypeId: st.id,
        testTypeName: st.name,
        sequenceOrder: st.sequence_order,
        isNew: false
      }))
      setSequence(seqList)

      // Load parameters
      const paramsObj = {}
      for (const st of seqRes.data) {
        const paramRes = await window.electron.db.getTestParameters({
          productId: matched.id,
          testTypeId: st.id
        })
        if (paramRes.success) {
          paramsObj[st.id] = paramRes.data.map(p => ({
            name: p.parameter_name,
            value: p.parameter_value,
            displayOrder: p.display_order
          }))
        }
      }
      setParameters(paramsObj)
    }
    return matched
  } catch (err) {
    console.error('Load existing product error:', err)
    return null
  }
}

// Modifikasi selectFamily
async function selectFamily(name) {
  productSearchInput.value = name
  form.productName = name
  form.device = ''
  form.seriesNumber = ''
  deviceSearchInput.value = ''
  seriesSearchInput.value = ''
  showProductDropdown.value = false
  showDeviceDropdown.value = false
  showSeriesDropdown.value = false

  setProduct({ id: null, name: name, series: '', series_number: '' })
  setSequence([])
  setParameters({})
  selectTest(null)
  existingTemplateIds.value = new Set() // Reset matrix
}

// Toast state
const toast = reactive({ show: false, type: '', msg: '' })
function showToast(type, msg) {
  toast.type = type
  toast.msg = msg
  toast.show = true
  setTimeout(() => toast.show = false, 3500)
}

// Computed: apakah semua field product information sudah diisi
const isProductInfoComplete = computed(() => {
  return form.productName.trim() !== '' &&
         form.device.trim() !== '' &&
         form.seriesNumber.trim() !== ''
})

// Daftar nama family unik (berdasarkan product_name)
const uniqueFamilyNames = computed(() => {
  const names = productList.value.map(p => p.product_name)
  return [...new Set(names)].sort()
})

// Filter berdasarkan input user
const filteredFamilyNames = computed(() => {
  const query = productSearchInput.value.toLowerCase().trim()
  if (!query) return uniqueFamilyNames.value
  return uniqueFamilyNames.value.filter(name =>
    name.toLowerCase().includes(query)
  )
})

// Current parameters untuk test yang aktif
const currentParams = computed(() => {
  if (!activeTest.value) return []
  return parameters.value[activeTest.value.testTypeId] || []
})

// Load products dari database
async function loadProductList() {
  try {
    const res = await window.electron.db.getProducts()
    if (res.success) {
      productList.value = res.data
    }
  } catch (err) {
    console.error('Failed to load products:', err)
  }
}
async function loadProductTemplates(productId) {
  if (!productId) return
  try {
    const res = await window.electron.db.getTemplatesByProduct(productId)
    if (res.success && res.data.length) {
      const ids = res.data.map(t => t.test_type_id)
      existingTemplateIds.value = new Set(ids)
    } else {
      existingTemplateIds.value = new Set()
    }
  } catch (err) {
    console.error('Failed to load templates:', err)
    existingTemplateIds.value = new Set()
  }
}

// Device handlers
function onDeviceInput() {
  form.device = deviceSearchInput.value
  showDeviceDropdown.value = true
  updateProduct()
}

function onDeviceBlur() {
  setTimeout(() => {
    showDeviceDropdown.value = false
    form.device = deviceSearchInput.value
    updateProduct()
  }, 150)
}

function selectDevice(device) {
  deviceSearchInput.value = device
  form.device = device
  showDeviceDropdown.value = false
  updateProduct()
}

// Series handlers
function onSeriesInput() {
  form.seriesNumber = seriesSearchInput.value
  showSeriesDropdown.value = true
  updateProduct()
}

function onSeriesBlur() {
  setTimeout(() => {
    showSeriesDropdown.value = false
    form.seriesNumber = seriesSearchInput.value
    updateProduct()
  }, 150)
}

function selectSeriesNumber(series) {
  seriesSearchInput.value = series
  form.seriesNumber = series
  showSeriesDropdown.value = false
  updateProduct()
}

// Product selection handlers
function onProductInput() {
  // Jika sebelumnya sudah ada id produk (produk existing), reset ke mode produk baru
  if (selectedProduct.value?.id) {
    form.device = ''
    form.seriesNumber = ''
    setProduct({
      id: null,
      name: productSearchInput.value,
      series: '',
      series_number: ''
    })
  }
  showProductDropdown.value = true
}

function onProductBlur() {
  setTimeout(() => {
    showProductDropdown.value = false
    if (!productSearchInput.value.trim()) {
      setProduct({
        id: null,
        name: '',
        series: '',
        series_number: ''
      })
    } else {
      setProduct({
        ...selectedProduct.value,
        name: productSearchInput.value
      })
    }
  }, 150)
}

async function updateProduct() {
  const newProd = {
    id: selectedProduct.value?.id || null,
    name: form.productName,
    series: form.device,
    series_number: form.seriesNumber,
  }

  if (form.productName && form.device && form.seriesNumber) {
    const existing = await loadExistingProduct(form.productName, form.device, form.seriesNumber)
    if (existing) {
      deviceSearchInput.value = existing.series || ''
      seriesSearchInput.value = existing.series_number || ''
      await loadProductTemplates(existing.id)
      setProduct({
        id: existing.id,
        name: existing.product_name,
        series: existing.series,
        series_number: existing.series_number
      })
      showToast('success', `Loaded existing product: ${existing.product_name} - ${existing.series} (${existing.series_number})`)
      return
    } else {
      // Reset semua state test sequence untuk produk baru
      setSequence([])
      setParameters({})
      selectTest(null)
      existingTemplateIds.value = new Set()
      // 🔥 PASTIKAN ID PRODUK BARU NULL (menimpa ID lama)
      newProd.id = null
    }
  }
  
  // Set produk baru (id bisa null)
  setProduct(newProd)
}

// Watcher untuk sinkronisasi input Family dengan form.productName
watch(() => form.productName, (newVal) => {
  if (productSearchInput.value !== newVal) {
    productSearchInput.value = newVal
  }
})

// Watcher untuk sinkronisasi selectedProduct ke form (jika ada produk yang sudah dipilih sebelumnya)
watch(selectedProduct, (prod) => {
  if (prod) {
    form.productName  = prod.name          || ''
    form.device       = prod.series        || ''
    form.seriesNumber = prod.series_number || ''
    // Sinkronkan juga productSearchInput
    productSearchInput.value = form.productName
  }
}, { immediate: true })

function isTestTypeBlocked(testTypeId) {
  return existingTemplateIds.value.has(testTypeId)
}

// ── Test Sequence ──────────────────────────────────────────────────
function openAddTestModal() {
  if (!isProductInfoComplete.value) {
    showToast('error', 'Please fill all product information first before adding test sequence')
    return
  }
  selectedTestTypeId.value = ''
  newTestName.value = ''
  modalAddTest.value = true
}

async function confirmAddTest() {
  const newName = newTestName.value.trim()
  const selId   = selectedTestTypeId.value
  let id, name

  if (newName) {
    const res = await window.electron.db.addCustomTestType(newName)
    if (!res.success) { showToast('error', 'Failed to add test type: ' + res.error); return }
    id   = res.id
    name = newName
  } else if (selId) {
    id   = parseInt(selId)
    name = allTestTypes.value.find(t => t.id === id)?.name || ''
  } else {
    showToast('error', 'Please select an existing test type or enter a new name')
    return
  }

  // Validasi duplikat dengan product yang sudah ada di database
   if (selectedProduct.value?.id) {
    try {
      const existingSeq = await window.electron.db.getProductTestTypes(selectedProduct.value.id)
      if (existingSeq.success && existingSeq.data.some(st => st.id === id)) {
        showToast('error', `Test type "${name}" already exists for this product. Cannot add duplicate.`)
        return
      }
      const hasMatrix = await isTestTypeHasMatrix(selectedProduct.value.id, id)
      if (hasMatrix) {
        showToast('error', `Test sequence "${name}" already has a matrix for this product. Cannot add.`)
        return
      }
    } catch (err) { 
      console.error(err)
      showToast('error', 'Failed to validate product data')
      return
    }
  }

  // Cek duplikat di sequence lokal
  if (sequence.value.some(t => t.testTypeId === id)) {
    showToast('error', 'Test type already added')
    return
  }

  // Tambahkan test type baru ke sequence
  const newTest = {
    id:            `seq_${Date.now()}`,
    testTypeId:    id,
    testTypeName:  name,
    sequenceOrder: sequence.value.length + 1,
    isNew:         !!newName,
  }
  setSequence([...sequence.value, newTest])
  if (!parameters.value[id]) {
    setParameters({ ...parameters.value, [id]: [] })
  }
  selectTest(newTest)
  modalAddTest.value = false
  showToast('success', `Test sequence "${name}" added`)
}

function removeTest(seqId) {
  const test    = sequence.value.find(t => t.id === seqId)
  const newSeq  = sequence.value.filter(t => t.id !== seqId)
  newSeq.forEach((t, i) => t.sequenceOrder = i + 1)
  setSequence(newSeq)

  if (test) {
    const newParams = { ...parameters.value }
    delete newParams[test.testTypeId]
    setParameters(newParams)
  }

  if (activeTest.value?.testTypeId === test?.testTypeId) {
    selectTest(newSeq[0] || null)
  }
  showToast('success', 'Test sequence removed')
}

// ── Parameters ─────────────────────────────────────────────────────
function openAddParamModal() {
  if (!activeTest.value) {
    showToast('error', 'Please select a test sequence first before adding parameters')
    return
  }
  newParam.name = ''
  newParam.value = ''
  modalAddParam.value = true
}

function addParameter() {
  if (!newParam.name.trim() || !newParam.value.trim()) {
    showToast('error', 'Both parameter name and value are required')
    return
  }
  const tid  = activeTest.value.testTypeId
  const list = [...(parameters.value[tid] || [])]
  list.push({ name: newParam.name, value: newParam.value, displayOrder: list.length + 1 })
  setParameters({ ...parameters.value, [tid]: list })
  modalAddParam.value = false
  showToast('success', 'Parameter added')
}

function removeParameter(idx) {
  if (!activeTest.value) return
  const tid  = activeTest.value.testTypeId
  const list = [...(parameters.value[tid] || [])]
  list.splice(idx, 1)
  setParameters({ ...parameters.value, [tid]: list })
  showToast('success', 'Parameter removed')
}

// Load test types on mount
onMounted(async () => {
  await loadProductList()
  try {
    const res = await window.electron.db.getTestTypes()
    if (res.success) allTestTypes.value = res.data
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.test-seq-item--blocked {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #fef2f2;
  border-color: #fecaca;
}
.test-seq-item--blocked:hover {
  background-color: #fef2f2;
}
.field-label  { @apply block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5; }
.field-input  { @apply w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 bg-white; }
.btn-icon-sm {
  @apply w-6 h-6 rounded-full bg-[#2F3E46] hover:bg-[#1a2a30] text-white flex items-center justify-center transition-colors cursor-pointer;
}
.btn-icon-sm.opacity-50 {
  opacity: 0.5;
  cursor: pointer;
}
.btn-icon-sm.bg-gray-400 {
  background-color: #9ca3af;
}
.btn-icon-sm.bg-gray-400:hover {
  background-color: #9ca3af;
}
.btn-icon-sm:disabled { opacity: 0.5; cursor: not-allowed; background-color: #9ca3af; }
.btn-primary  { @apply px-4 py-1.5 bg-[#2F3E46] hover:bg-[#1a2a30] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer; }
.btn-ghost    { @apply px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-lg transition-colors cursor-pointer; }
.test-seq-item        { @apply flex items-center justify-between px-3 py-2 rounded-lg border border-transparent cursor-pointer hover:bg-gray-50 transition-colors; }
.test-seq-item--active { @apply border-gray-300 bg-gray-50; }
.test-radio           { @apply w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0; }
.test-radio--on       { @apply border-gray-700; }
.test-radio-dot       { @apply w-1.5 h-1.5 rounded-full bg-gray-700; }
.badge-new            { @apply text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium; }
.opacity-50 { opacity: 0.5; }
.cursor-not-allowed { cursor: not-allowed; }

/* Toast transition */
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>