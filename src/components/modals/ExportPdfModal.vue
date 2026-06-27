<!-- src/components/modals/ExportPdfModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900 text-sm">Export to PDF</p>
                <p class="text-xs text-gray-400">Fill in equipment details</p>
              </div>
            </div>
            <button @click="close" class="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

            <!-- Auto-filled fields -->
            <div class="bg-gray-50 rounded-xl p-4 space-y-3">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auto-filled</p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-medium text-gray-500">PO Number</label>
                  <div class="mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                    {{ form.poNumber || '—' }}
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Unit Type</label>
                  <div class="mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                    {{ form.unitType || '—' }}
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Test Date</label>
                  <div class="mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                    {{ formatDate(form.testDate) }}
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Tester</label>
                  <div class="mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                    {{ form.tester || '—' }}
                  </div>
                </div>
                <div class="col-span-2">
                  <label class="text-xs font-medium text-gray-500">Tested By (Operator)</label>
                  <div class="mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                    {{ form.testedBy || '—' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Manual input -->
            <div class="space-y-3">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Equipment Details</p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-medium text-gray-600">Multimeter #1 SN</label>
                  <input
                    v-model="form.multimeter1SN"
                    placeholder="e.g. MM-001"
                    class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-600">Multimeter #2 SN</label>
                  <input
                    v-model="form.multimeter2SN"
                    placeholder="e.g. MM-002"
                    class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div class="col-span-2">
                  <label class="text-xs font-medium text-gray-600">Oscilloscope SN</label>
                  <input
                    v-model="form.oscilloscopeSN"
                    placeholder="e.g. CO22845"
                    class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
                <div class="col-span-2">
                  <label class="text-xs font-medium text-gray-600">Verified By</label>
                  <input
                    v-model="form.verifiedBy"
                    placeholder="Verifier name"
                    class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              @click="close"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleExport"
              :disabled="exporting"
              class="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg v-if="!exporting" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ exporting ? 'Generating…' : 'Export PDF' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useExportPdf } from '@/composables/useExportPdf'

const props = defineProps({
  testInfo: { type: Object, default: () => ({}) },
  entries:  { type: Array,  default: () => [] },
  headers:  { type: Array,  default: () => [] }
})

const emit = defineEmits(['exported', 'error'])

const visible = ref(false)
const { exporting, exportToPdf } = useExportPdf()

const form = reactive({
  poNumber:       '',
  unitType:       '',
  testDate:       '',
  tester:         'CHRISNEFFTESTER',
  testedBy:       '',
  verifiedBy:     '',
  multimeter1SN:  '',
  multimeter2SN:  '',
  oscilloscopeSN: ''
})

watch(() => props.testInfo, (info) => {
  form.poNumber = info.poNumber      || ''
  form.unitType = info.series_number || info.series || ''
  form.testDate = info.testDate      || ''
  form.testedBy = info.operatorName  || ''
}, { immediate: true, deep: true })

function show() {
  form.poNumber = props.testInfo.poNumber      || ''
  form.unitType = props.testInfo.series_number || props.testInfo.series || ''
  form.testDate = props.testInfo.testDate      || ''
  form.testedBy = props.testInfo.operatorName  || ''
  visible.value = true
}

function close() {
  if (exporting.value) return
  visible.value = false
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function handleExport() {
  // Serialize data menjadi plain object (hilangkan reaktivitas Vue)
  const plainForm = JSON.parse(JSON.stringify(form));
  const plainEntries = JSON.parse(JSON.stringify(props.entries));
  const plainHeaders = JSON.parse(JSON.stringify(props.headers));
  const plainTestInfo = JSON.parse(JSON.stringify(props.testInfo));

  const result = await exportToPdf({
    form: plainForm,
    entries: plainEntries,
    headers: plainHeaders,
    testInfo: plainTestInfo
  });

  if (result.success) {
    emit('exported', result.filePath);
    visible.value = false;
  } else {
    emit('error', result.error || 'Export failed');
  }
}

defineExpose({ show, close })
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-fade-enter-from,
.modal-fade-leave-to     { opacity: 0; transform: scale(0.97); }
</style>