<!-- views/left/LeftTestingDetail.vue -->
<template>
  <div class="flex flex-col gap-4 h-full ml-4 mr-2 py-4">
    <!-- Column Info -->
    <div class="bg-white rounded-3xl shadow-md w-full hover:shadow-xl transition duration-200 ease-in-out p-4">
      <input type="checkbox" id="accordion-column-detail" class="peer hidden" checked />
      <label for="accordion-column-detail" class="group flex justify-between cursor-pointer select-none">
        <div class="flex gap-2">
          <div class="w-8 h-8 bg-[#9079E5] rounded-full"></div>
          <div class="pt-1">
            <p class="font-semibold text-[#1F2937]">Column Info</p>
          </div>
        </div>
        <div class="text-center pt-0.5">
          <div class="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:shadow-sm hover:bg-gray-50 transition-transform duration-200 peer-checked:group-[]:rotate-90">
            <svg class="block" width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 6.5L3.5 3.5L0.5 0.5" stroke="#4B5563" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </label>
      <div
        class="grid overflow-hidden grid-rows-[0fr] peer-checked:grid-rows-[1fr] transition-all duration-300 ease-in-out"
      >
        <div class="overflow-hidden">
          <div class="mt-5 space-y-2 pl-1">
            <div class="grid grid-cols-3">
              <div class="text-[#4B5563] text-xs pt-0.5">Column :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ currentColumn.name }}
              </div>
            </div>
            <div v-if="currentColumn.validationType === 'lsl_usl'" class="grid grid-cols-3">
              <div class="text-[#4B5563] text-xs pt-0.5">LSL :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{
                  currentColumn.lsl && currentColumn.lsl !== '-'
                    ? `${currentColumn.lsl} ${currentColumn.unit}`
                    : '-'
                }}
              </div>
            </div>
            <div v-if="currentColumn.validationType === 'lsl_usl'" class="grid grid-cols-3">
              <div class="text-[#4B5563] text-xs pt-0.5">USL :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{
                  currentColumn.usl && currentColumn.usl !== '-'
                    ? `${currentColumn.usl} ${currentColumn.unit}`
                    : '-'
                }}
              </div>
            </div>
            <div
              v-if="
                currentColumn.validationType === 'text_match' ||
                currentColumn.validationType === 'pass_fail'
              "
              class="grid grid-cols-3"
            >
              <div class="text-[#4B5563] text-xs pt-0.5">Expected :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ currentColumn.expectedValue || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Info -->
    <div
      v-if="testInfo.productName"
      class="bg-white rounded-3xl shadow-md w-full hover:shadow-xl transition duration-200 ease-in-out p-4"
    >
      <input type="checkbox" id="accordion-testinfo-detail" class="peer hidden" checked />
      <label for="accordion-testinfo-detail" class="group flex justify-between cursor-pointer select-none">
        <div class="flex gap-2">
          <div class="w-8 h-8 bg-[#CDFC8E] rounded-full"></div>
          <div class="pt-1">
            <p class="font-semibold text-[#1F2937]">Test Info</p>
          </div>
        </div>
        <div class="text-center pt-0.5">
          <div class="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:shadow-sm hover:bg-gray-50 transition-transform duration-200 peer-checked:group-[]:rotate-90">
            <svg class="block" width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 6.5L3.5 3.5L0.5 0.5" stroke="#4B5563" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </label>
      <div
        class="grid overflow-hidden grid-rows-[0fr] peer-checked:grid-rows-[1fr] transition-all duration-300 ease-in-out"
      >
        <div class="overflow-hidden">
          <div class="mt-5 space-y-2 pl-1">
            <div class="grid grid-cols-3 gap-1">
              <div class="text-[#4B5563] text-xs pt-0.5">Device :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ testInfo.series ? `${testInfo.series} ${testInfo.series_number ? `(${testInfo.series_number})` : ''}` : '-' }}
              </div>
            </div>
            <div class="grid grid-cols-3 gap-1">
              <div class="text-[#4B5563] text-xs pt-0.5">Test Type :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ testInfo.testTypeName || '-' }}
              </div>
            </div>
            <div class="grid grid-cols-3 gap-1">
              <div class="text-[#4B5563] text-xs pt-0.5">Operator :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ testInfo.operatorName || '-' }}
              </div>
            </div>
            <div class="grid grid-cols-3 gap-1">
              <div class="text-[#4B5563] text-xs pt-0.5">Date :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ formatDate(testInfo.testDate) }}
              </div>
            </div>
            <div class="grid grid-cols-3 gap-1">
              <div class="text-[#4B5563] text-xs pt-0.5">PO Number :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ testInfo.poNumber || '-' }}
              </div>
            </div>
            <div class="grid grid-cols-3 gap-1">
              <div class="text-[#4B5563] text-xs pt-0.5">Total Units :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ testInfo.totalUnits || entriesLength }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Setup (Parameters) -->
    <div
      v-if="testParameters.length"
      class="bg-white rounded-3xl shadow-md w-full hover:shadow-xl transition duration-200 ease-in-out p-4"
    >
      <input type="checkbox" id="accordion-testsetup-detail" class="peer hidden" checked />
      <label for="accordion-testsetup-detail" class="group flex justify-between cursor-pointer select-none">
        <div class="flex gap-2">
          <div class="w-8 h-8 bg-[#FCF98E] rounded-full"></div>
          <div class="pt-1">
            <p class="font-semibold text-[#1F2937]">Test Set Up</p>
          </div>
        </div>
        <div class="text-center pt-0.5">
          <div class="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:shadow-sm hover:bg-gray-50 transition-transform duration-200 peer-checked:group-[]:rotate-90">
            <svg class="block" width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 6.5L3.5 3.5L0.5 0.5" stroke="#4B5563" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </label>
      <div
        class="grid overflow-hidden grid-rows-[0fr] peer-checked:grid-rows-[1fr] transition-all duration-300 ease-in-out"
      >
        <div class="overflow-hidden">
          <div class="mt-5 space-y-2 pl-1">
            <div v-for="param in testParameters" :key="param.id" class="grid grid-cols-3 gap-1">
              <div class="text-[#4B5563] text-xs pt-0.5">{{ param.parameter_name }} :</div>
              <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                {{ param.parameter_value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const testInfo = ref({})
const testParameters = ref([])
const entriesLength = ref(0)
const currentColumn = ref({
  name: 'Pilih kolom di tabel',
  lsl: '-',
  usl: '-',
  unit: '',
  expectedValue: '',
  validationType: 'lsl_usl'
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID')
}

const readCurrentColumn = () => {
  try {
    const saved = localStorage.getItem('currentColumn')
    if (saved) {
      const parsed = JSON.parse(saved)
      currentColumn.value = {
        name: parsed.name || 'Kolom',
        lsl: parsed.lsl || '-',
        usl: parsed.usl || '-',
        unit: parsed.unit || '',
        expectedValue: parsed.expectedValue || '',
        validationType: parsed.validationType || 'lsl_usl'
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const loadData = async () => {
  const groupData = sessionStorage.getItem('viewTestGroup')
  if (!groupData) return
  const group = JSON.parse(groupData)
  testInfo.value = {
    ...group,
    totalUnits: route.query.totalUnits || 0
  }
  entriesLength.value = parseInt(route.query.totalUnits) || 0
  // Ambil parameter test (opsional)
  try {
    const res = await window.electron.db.getTestParameters({
      productId: group.productId,
      testTypeId: group.testTypeId
    })
    if (res.success) testParameters.value = res.data
  } catch (e) {}
}

onMounted(() => {
  loadData()
  readCurrentColumn()
  const interval = setInterval(readCurrentColumn, 1000)
  window.addEventListener('storage', readCurrentColumn)
  onUnmounted(() => {
    clearInterval(interval)
    window.removeEventListener('storage', readCurrentColumn)
  })
})
</script>

<style scoped>
/* Tidak diperlukan style tambahan karena sudah diwarisi dari komponen induk */
</style>