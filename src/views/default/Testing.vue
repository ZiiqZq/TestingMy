<template>
    <div class="grid grid-cols-1 gap-6 pt-4 px-6 ">
        <!-- Operator Name -->
        <div class="relative">
            <input v-model="operatorName" placeholder=" " @input="saveFormData"
                class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
            <label
                class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                Nama Operator *
            </label>
        </div>

        <!-- Test Date -->
        <div class="relative">
            <input v-model="testDate" type="date" placeholder=" " @input="saveFormData"
                class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
            <label
                class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                Test Date *
            </label>
        </div>

        <!-- Oscilloscope SN -->
        <div class="relative">
            <input v-model="oscilloscopeSN" placeholder=" " @input="saveFormData"
                class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
            <label
                class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                Oscilloscope SN
            </label>
        </div>

        <!-- Multimeter SN -->
        <div class="relative">
            <input v-model="multimeterSN" placeholder=" " @input="saveFormData"
                class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
            <label
                class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                Multimeter SN
            </label>
        </div>

        <!-- PO Number & Lot Number -->
        <div class="flex w-full gap-4">
            <div class="relative w-full">
                <input v-model="poNumber" placeholder=" " @input="handleNumericInput($event, 'poNumber')"
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    PO Number *
                </label>
            </div>
            <div class="relative w-full">
                <input v-model="lotNumber" placeholder=" " @input="saveFormData"
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    Lot Number
                </label>
            </div>
        </div>

        <!-- Starting Serial Number -->
        <div class="relative">
            <input v-model="serialNumber" placeholder=" " @input="handleNumericInput($event, 'serialNumber')"
                class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
            <label
                class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                Starting Product Serial Number *
            </label>
        </div>

        <!-- Quantity -->
        <div class="w-full">
            <label class="text-sm font-medium text-gray-700 mb-2 block">
                Jumlah *
            </label>
            <div class="flex items-center gap-3">
                <button @click="decrementQty"
                    class="w-10 h-10 bg-red-400 hover:bg-red-500 rounded-md cursor-pointer text-white font-bold transition-colors">
                    −
                </button>
                <input v-model.number="quantity" type="number" min="1" max="100" @input="saveFormData"
                    class="w-20 text-center border border-gray-200 rounded-md h-10 px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <button @click="incrementQty"
                    class="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-md cursor-pointer text-white font-bold transition-colors">
                    +
                </button>
                <span v-if="serialRange" class="text-sm text-gray-600">
                    Range: <strong>{{ serialRange }}</strong>
                </span>
            </div>
        </div>

        <!-- Start Button -->
        <div class="flex w-full justify-end pt-2">
            <button @click="handleStartTesting" :disabled="!canStart" :class="[
                    'h-10 px-6 rounded-md text-white font-medium transition-colors',
                    canStart 
                        ? 'bg-[#6BAF92] hover:bg-[#52796F] cursor-pointer' 
                        : 'bg-gray-400 cursor-not-allowed'
                ]">
                {{ canStart ? 'Mulai Testing' : 'Lengkapi Data' }}
            </button>
        </div>
    </div>

    <!-- Error Modal -->
    <ErrorModal
        ref="errorModal"
        :message="errorMessage"
        @close="closeErrorModal"
    />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTestingPage } from '@/composables/useTestingPage'
import { useTestingSession } from '@/composables/useTestingSession'
import ErrorModal from '@/components/modals/ErrorModal.vue'

const router = useRouter()
const { saveSession } = useTestingSession()

const errorModal = ref(null)

const {
    operatorName,
    testDate,
    multimeterSN,
    oscilloscopeSN,
    poNumber,
    lotNumber,
    serialNumber,
    quantity,
    serialRange,
    selectedProduct,
    selectedTestType,
    templateData,
    errorMessage,
    showErrorModal,
    startTesting,
    incrementQty,
    decrementQty,
    validateNumeric,
    clearForm,
    saveFormData,
    loadFormData,
    closeErrorModal
} = useTestingPage()

// Watch untuk menampilkan error modal
watch(showErrorModal, (newVal) => {
    if (newVal) {
        errorModal.value?.show()
    }
})

// Debug kondisi untuk tombol
const debugConditions = computed(() => {
    return {
        operatorName: !!operatorName.value,
        testDate: !!testDate.value,
        poNumber: !!poNumber.value,
        serialNumber: !!serialNumber.value,
        quantity: quantity.value > 0,
        selectedProduct: !!selectedProduct.value,
        selectedTestType: !!selectedTestType.value,
        templateData: !!templateData.value
    }
})

const canStart = computed(() => {
    const conditions = debugConditions.value
    console.log('Can Start Conditions:', conditions)
    
    return conditions.operatorName && 
           conditions.testDate && 
           conditions.poNumber && 
           conditions.serialNumber && 
           conditions.quantity && 
           conditions.selectedProduct && 
           conditions.selectedTestType && 
           conditions.templateData
})

function handleNumericInput(event, field) {
    const value = event.target.value
    event.target.value = value.replace(/[^0-9]/g, '')
    
    if (field === 'poNumber') {
        poNumber.value = event.target.value
    } else if (field === 'serialNumber') {
        serialNumber.value = event.target.value
    }
    
    saveFormData()
}

function handleStartTesting() {
    console.log('Handle Start Testing called')
    
    // Cek apakah semua data sudah lengkap
    if (!canStart.value) {
        // Error akan ditampilkan dari modal manual jika diperlukan
        return
    }
    
    try {
        const result = startTesting()
        
        if (!result.success) {
            // Error sudah di-set di composable
            return
        }
        
        console.log('Data test yang akan disimpan:', result.testInfo)
        saveSession(result.testInfo)
        router.push({ name: 'TestingTable' })
    } catch (error) {
        console.error('Error:', error.message)
    }
}

</script>