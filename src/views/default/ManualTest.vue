<template>
    <div class="grid grid-cols-1 gap-6 pt-4 px-6">

        <!-- Banner peringatan kalau belum pilih device -->
        <div v-if="!isDeviceReady" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-700">
                ⚠ Pilih <strong>Device</strong> dan <strong>Test Type</strong> di panel kiri sebelum mengisi form.
            </p>
        </div>

        <!-- Operator Name -->
        <div class="relative">
            <input
                v-model="operatorName"
                placeholder=" "
                :disabled="!isDeviceReady"
                @input="saveFormData"
                :class="inputClass"
            />
            <label :class="labelClass">Nama Operator *</label>
        </div>

        <!-- Test Date -->
        <div class="relative">
            <input
                v-model="testDate"
                type="date"
                placeholder=" "
                :disabled="!isDeviceReady"
                @input="saveFormData"
                :class="inputClass"
            />
            <label :class="labelClass">Test Date *</label>
        </div>

        <!-- Oscilloscope SN -->
        <div class="relative">
            <input
                v-model="oscilloscopeSN"
                placeholder=" "
                :disabled="!isDeviceReady"
                @input="saveFormData"
                :class="inputClass"
            />
            <label :class="labelClass">Oscilloscope SN</label>
        </div>

        <!-- Multimeter SN -->
        <div class="relative">
            <input
                v-model="multimeterSN"
                placeholder=" "
                :disabled="!isDeviceReady"
                @input="saveFormData"
                :class="inputClass"
            />
            <label :class="labelClass">Multimeter SN</label>
        </div>

        <!-- PO Number & Lot Number -->
        <div class="flex w-full gap-4">
            <div class="relative w-full">
                <input
                    v-model="poNumber"
                    placeholder=" "
                    :disabled="!isDeviceReady"
                    @input="handleNumericInput($event, 'poNumber')"
                    :class="inputClass"
                />
                <label :class="labelClass">PO Number *</label>
            </div>
            <div class="relative w-full">
                <input
                    v-model="lotNumber"
                    placeholder=" "
                    :disabled="!isDeviceReady"
                    @input="saveFormData"
                    :class="inputClass"
                />
                <label :class="labelClass">Lot Number</label>
            </div>
        </div>

        <!-- Starting Serial Number -->
        <div class="relative">
            <input
                v-model="serialNumber"
                placeholder=" "
                :disabled="!isDeviceReady"
                @input="handleNumericInput($event, 'serialNumber')"
                :class="inputClass"
            />
            <label :class="labelClass">Starting Product Serial Number *</label>
        </div>

        <!-- Quantity -->
        <div class="w-full">
            <label class="text-sm font-medium text-gray-700 mb-2 block">Jumlah *</label>
            <div class="flex items-center gap-3">
                <button
                    @click="decrementQty"
                    :disabled="!isDeviceReady"
                    :class="[
                        'w-10 h-10 rounded-md text-white font-bold transition-colors',
                        isDeviceReady
                            ? 'bg-red-400 hover:bg-red-500 cursor-pointer'
                            : 'bg-gray-200 cursor-not-allowed'
                    ]"
                >−</button>

                <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    max="100"
                    :disabled="!isDeviceReady"
                    @input="saveFormData"
                    :class="[
                        'w-20 text-center border rounded-md h-10 px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                        !isDeviceReady ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-200'
                    ]"
                />

                <button
                    @click="incrementQty"
                    :disabled="!isDeviceReady"
                    :class="[
                        'w-10 h-10 rounded-md text-white font-bold transition-colors',
                        isDeviceReady
                            ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                            : 'bg-gray-200 cursor-not-allowed'
                    ]"
                >+</button>

                <span v-if="serialRange && isDeviceReady" class="text-sm text-gray-600">
                    Range: <strong>{{ serialRange }}</strong>
                </span>
            </div>
        </div>

        <!-- Start Button -->
        <div class="flex w-full justify-end pt-2">
            <button
                @click="handleStartTesting"
                :disabled="!canStart"
                :class="[
                    'h-10 px-6 rounded-md text-white font-medium transition-colors',
                    canStart
                        ? 'bg-[#6BAF92] hover:bg-[#52796F] cursor-pointer'
                        : 'bg-gray-300 cursor-not-allowed'
                ]"
            >
                {{ !isDeviceReady ? 'Pilih Device Dulu' : canStart ? 'Mulai Testing' : 'Lengkapi Data' }}
            </button>
        </div>
    </div>

    <!-- Error Modal -->
    <ErrorModal ref="errorModal" :message="errorMessage" @close="closeErrorModal" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTestingPage } from '@/composables/useTestingPage'
import { useTestingSession } from '@/composables/useTestingSession'
import ErrorModal from '@/components/modals/ErrorModal.vue'

const router = useRouter()
const { saveSession } = useTestingSession()
const errorModal = ref(null)

const {
    operatorName, testDate, multimeterSN, oscilloscopeSN,
    poNumber, lotNumber, serialNumber, quantity, serialRange,
    selectedProduct, selectedTestType, templateData,
    errorMessage, showErrorModal,
    startTesting, incrementQty, decrementQty,
    saveFormData, closeErrorModal
} = useTestingPage()

// Device sudah dipilih lengkap?
const isDeviceReady = computed(() =>
    !!selectedProduct.value && !!selectedTestType.value && !!templateData.value
)

// Class input — disabled kalau belum pilih device
const inputClass = computed(() => [
    'peer w-full placeholder:text-slate-400 text-slate-700 text-sm border rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700',
    isDeviceReady.value
        ? 'bg-transparent border-slate-200'
        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
])

const labelClass =
    'absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none'

// Tombol start aktif hanya kalau semua field terisi
const canStart = computed(() =>
    isDeviceReady.value &&
    !!operatorName.value &&
    !!testDate.value &&
    !!poNumber.value &&
    !!serialNumber.value &&
    quantity.value > 0
)

watch(showErrorModal, (val) => {
    if (val) errorModal.value?.show()
})

function handleNumericInput(event, field) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '')
    if (field === 'poNumber') poNumber.value = event.target.value
    else if (field === 'serialNumber') serialNumber.value = event.target.value
    saveFormData()
}

function handleStartTesting() {
    if (!canStart.value) return
    try {
        const result = startTesting()
        if (!result.success) return
        saveSession(result.testInfo)
        router.push({ name: 'TestingTable' })
    } catch (error) {
        console.error('Error:', error.message)
    }
}
</script>