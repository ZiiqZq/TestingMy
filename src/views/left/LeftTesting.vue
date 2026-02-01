<template>

    

    <div class="space-y-4 px-4 py-6 rounded-3xl bg-white shadow-md mx-2 ">
        <div class="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-400">
            <p>
                <span class="font-medium text-gray-700">Setup Section</span>
                <span class="text-sm text-gray-500"> - Pilih Produk, Device, dan Tipe Tes</span>
            </p>
        </div>
        <!-- Product Selection -->
        <div class="relative">
            <label for="productName" class="text-sm font-medium text-gray-700 mb-1 block">
                Nama Produk
            </label>
            <input 
                v-model="productSearchInput"
                @focus="showProductDropdown = true"
                @blur="showProductDropdown = false"
                id="productName" 
                type="text"
                placeholder="Ketik nama produk..."
                class="w-full bg-white border border-gray-200 rounded-md h-9 px-3 py-1 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <!-- Product Dropdown List -->
            <div 
                v-if="showProductDropdown && filteredProductNames.length > 0"
                @click.stop
                class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
                <div 
                    v-for="name in filteredProductNames" 
                    :key="name"
                    @mousedown.prevent="selectProductName(name)"
                    class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors"
                >
                    {{ name }}
                </div>
            </div>
        </div>

        <!-- Device Selection -->
        <div v-if="showDeviceSelect" class="relative">
            <label for="device" class="text-sm font-medium text-gray-700 mb-1 block">
                Device
            </label>
            <input 
                v-model="deviceSearchInput"
                @focus="showDeviceDropdown = true"
                @blur="showDeviceDropdown = false"
                id="device" 
                type="text"
                placeholder="Ketik nama atau nomor device..."
                class="w-full bg-white border border-gray-200 rounded-md h-9 px-3 py-1 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <!-- Device Dropdown List -->
            <div 
                v-if="showDeviceDropdown && filteredDevices.length > 0"
                @click.stop
                class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
                <div 
                    v-for="device in filteredDevices" 
                    :key="device.id"
                    @mousedown.prevent="selectDevice(device)"
                    class="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors"
                >
                    {{ formatDeviceName(device) }}
                </div>
            </div>
        </div>

        <!-- Test Type Selection -->
        <div v-if="testTypes.length > 0" class="border-t mt-4 pt-4 border-gray-300">
            <label class="text-sm font-medium text-gray-700 mb-2 block">
                Pilih Test Type
            </label>
            <div class="grid grid-cols-1 gap-2">
                <button 
                    v-for="testType in testTypes" 
                    :key="testType.id"
                    @click="selectTest(testType)"
                    :class="[
                        'w-full h-16 items-center justify-center flex border rounded-md transition-colors',
                        selectedTestId === testType.id 
                            ? 'bg-[#6BAF92] border-[#52796F]' 
                            : 'bg-[#84D3B6] border-[#C4C4C4] hover:bg-[#6BAF92]'
                    ]"
                >
                    <div class="flex items-center justify-between w-full px-4">
                        <p class="text-white font-medium">{{ testType.name }}</p>
                        <span class="bg-white text-[#52796F] w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {{ testType.sequence_order }}
                        </span>
                    </div>
                </button>
            </div>
        </div>

        <!-- Test Parameters -->
        <div v-if="parameters.length > 0" class="border-t mt-4 pt-4 border-gray-300">
            <label class="text-sm font-medium text-gray-700 mb-2 block">
                Test Parameters
            </label>
            <div class="space-y-2">
                <div 
                    v-for="param in parameters" 
                    :key="param.id"
                    class="grid grid-cols-3 items-center gap-2 text-xs"
                >
                    <span class="text-gray-600">{{ param.parameter_name }}:</span>
                    <span class="col-span-2 border border-gray-200 rounded px-2 py-1 bg-gray-50">
                        {{ param.parameter_value }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTestingPage } from '@/composables/useTestingPage'

const {
    allProducts,
    productSeries,
    selectedProduct,
    selectedTestType,
    testParameters,
    templateData,
    loadProducts,
    onProductSelect,
    onSeriesSelect,
    selectTestType
} = useTestingPage()

// Local state
const selectedProductName = ref('')
const productSearchInput = ref('')
const showProductDropdown = ref(false)
const selectedDeviceId = ref('')
const deviceSearchInput = ref('')
const showDeviceDropdown = ref(false)
const selectedTestId = ref(null)
const testTypes = ref([])

// Computed
const productNames = computed(() => {
    return [...new Set(allProducts.value.map(p => p.product_name))].sort()
})

const filteredProductNames = computed(() => {
    const searchText = productSearchInput.value.toLowerCase()
    if (!searchText) return productNames.value
    return productNames.value.filter(name => 
        name.toLowerCase().includes(searchText)
    )
})

const showDeviceSelect = computed(() => {
    return selectedProductName.value && productSeries.value.length > 0
})

const availableDevices = computed(() => {
    return productSeries.value
})

const filteredDevices = computed(() => {
    const searchText = deviceSearchInput.value.toLowerCase()
    if (!searchText) return availableDevices.value
    return availableDevices.value.filter(device => {
        const formattedName = formatDeviceName(device).toLowerCase()
        return formattedName.includes(searchText)
    })
})

const parameters = computed(() => {
    return testParameters.value
})

// Methods
function formatDeviceName(device) {
    if (device.series_number && device.series) {
        return `${device.series} - ${device.series_number}`
    }
    return device.series_number || device.series || 'No Series Info'
}

function selectProductName(name) {
    selectedProductName.value = name
    productSearchInput.value = name
    showProductDropdown.value = false
    handleProductChange()
}

function selectDevice(device) {
    selectedDeviceId.value = device.id
    deviceSearchInput.value = formatDeviceName(device)
    showDeviceDropdown.value = false
    handleDeviceChange()
}

async function handleProductChange() {
    deviceSearchInput.value = ''
    selectedDeviceId.value = ''
    selectedTestId.value = null
    testTypes.value = []
    
    if (selectedProductName.value) {
        onProductSelect(selectedProductName.value)
    }
}

async function handleDeviceChange() {
    selectedTestId.value = null
    testTypes.value = []
    
    if (selectedDeviceId.value) {
        const types = await onSeriesSelect(Number(selectedDeviceId.value))
        testTypes.value = types
    }
}

async function selectTest(testType) {
    try {
        selectedTestId.value = testType.id
        await selectTestType(testType)
        console.log('Test Type selected:', testType)
        console.log('Template Data:', templateData.value)
    } catch (error) {
        alert(error.message)
        selectedTestId.value = null
    }
}

// Initialize
onMounted(async () => {
    await loadProducts()
})
</script>