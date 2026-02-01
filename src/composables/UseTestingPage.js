// src/composables/useTestingPage.js
import { ref, computed, onMounted } from 'vue'

// BUAT STATE GLOBAL DI LUAR FUNGSI
const globalState = {
    allProducts: ref([]),
    productSeries: ref([]),
    selectedProduct: ref(null),
    selectedTestType: ref(null),
    testParameters: ref([]),
    templateData: ref(null),
    testingInProgress: ref(false),
    operatorName: ref(''),
    testDate: ref(new Date().toISOString().split('T')[0]),
    multimeterSN: ref(''),
    oscilloscopeSN: ref(''),
    poNumber: ref(''),
    lotNumber: ref(''),
    serialNumber: ref(''),
    quantity: ref(1),
    errorMessage: ref(''),
    showErrorModal: ref(false)
}

export function useTestingPage() {
    // Computed
    const serialRange = computed(() => {
        if (!globalState.serialNumber.value) return ''
        const start = parseInt(globalState.serialNumber.value)
        if (isNaN(start)) return ''
        const end = start + globalState.quantity.value - 1
        return `${start} - ${end}`
    })

    // Load products dari database
    async function loadProducts() {
        try {
            const result = await window.electron.db.getProducts()
            if (result.success) {
                globalState.allProducts.value = result.data
            } else {
                showError(`Failed to load products: ${result.error}`)
            }
        } catch (error) {
            showError(`Failed to load products: ${error.message}`)
        }
    }

    // Product selection
    function onProductSelect(productName) {
        globalState.productSeries.value = globalState.allProducts.value.filter(p => p.product_name === productName)
        globalState.selectedProduct.value = null
        globalState.selectedTestType.value = null
        globalState.templateData.value = null
        globalState.testParameters.value = []
        return globalState.productSeries.value
    }

    // Series selection
    async function onSeriesSelect(seriesId) {
        const series = globalState.productSeries.value.find(p => p.id === seriesId)
        if (!series) return []

        globalState.selectedProduct.value = {
            id: series.id,
            name: series.product_name,
            series_number: series.series_number,
            series: series.series
        }

        try {
            const result = await window.electron.db.getProductTestTypes(series.id)
            if (result.success) {
                return result.data
            }
            return []
        } catch (error) {
            throw new Error(`Failed to load test types: ${error.message}`)
        }
    }

    // Test type selection
    async function selectTestType(testType) {
        globalState.selectedTestType.value = testType

        try {
            // Load test parameters
            const paramsResult = await window.electron.db.getTestParameters({
                productId: globalState.selectedProduct.value.id,
                testTypeId: testType.id
            })
            if (paramsResult.success) {
                globalState.testParameters.value = paramsResult.data
            }

            // Load template - VALIDASI JIKA TIDAK ADA
            const templateResult = await window.electron.db.getTemplatesByProduct(globalState.selectedProduct.value.id)
            if (templateResult.success) {
                const template = templateResult.data.find(t => t.test_type_id === testType.id)

                if (!template) {
                    const errorMsg = `Tidak ada template untuk test type "${testType.name}".\n\nHarap buat template terlebih dahulu di menu Manage.`
                    showError(errorMsg)
                    return
                }

                globalState.templateData.value = template
            } else {
                showError('Gagal memuat template dari database')
                return
            }
        } catch (error) {
            showError(`Failed to load test setup: ${error.message}`)
        }
    }

    // Validation untuk start testing
    function validateStartTesting() {
        const errors = []

        if (!globalState.operatorName.value) errors.push('Nama operator harus diisi')
        if (!globalState.testDate.value) errors.push('Tanggal test harus diisi')
        if (!globalState.poNumber.value) errors.push('PO Number harus diisi')
        if (!globalState.serialNumber.value) errors.push('Serial Number harus diisi')
        if (!globalState.quantity.value || globalState.quantity.value < 1) errors.push('Jumlah harus valid')
        if (!globalState.selectedProduct.value) errors.push('Device harus dipilih')
        if (!globalState.selectedTestType.value) errors.push('Test type harus dipilih')
        if (!globalState.templateData.value) errors.push('Template tidak tersedia untuk test ini')

        return errors
    }

    // Start testing
    function startTesting() {
        const errors = validateStartTesting()
        if (errors.length > 0) {
            return {
                success: false,
                message: errors.join(', ')
            }
        }

        const testInfo = {
            operatorName: globalState.operatorName.value,
            testDate: globalState.testDate.value,
            multimeterSN: globalState.multimeterSN.value,
            oscilloscopeSN: globalState.oscilloscopeSN.value,
            poNumber: globalState.poNumber.value,
            lotNumber: globalState.lotNumber.value,
            serialNumber: parseInt(globalState.serialNumber.value),
            quantity: globalState.quantity.value,
            product: globalState.selectedProduct.value,
            testType: globalState.selectedTestType.value,
            template: globalState.templateData.value,
            parameters: globalState.testParameters.value
        }

        globalState.testingInProgress.value = true
        return {
            success: true,
            testInfo
        }
    }

    // Clear form
    function clearForm() {
        globalState.operatorName.value = ''
        globalState.testDate.value = new Date().toISOString().split('T')[0]
        globalState.multimeterSN.value = ''
        globalState.oscilloscopeSN.value = ''
        globalState.poNumber.value = ''
        globalState.lotNumber.value = ''
        globalState.serialNumber.value = ''
        globalState.quantity.value = 1
        globalState.selectedProduct.value = null
        globalState.selectedTestType.value = null
        globalState.templateData.value = null
        globalState.testParameters.value = []
    }

    // Quantity controls
    function incrementQty() {
        if (globalState.quantity.value < 100) globalState.quantity.value++
    }

    function decrementQty() {
        if (globalState.quantity.value > 1) globalState.quantity.value--
    }

    // Numeric validation
    function validateNumeric(value, field) {
        return value.replace(/[^0-9]/g, '')
    }

    // Simpan data form ke localStorage
    function saveFormData() {
        localStorage.setItem('operatorName', globalState.operatorName.value)
        localStorage.setItem('testDate', globalState.testDate.value)
        localStorage.setItem('multimeterSN', globalState.multimeterSN.value)
        localStorage.setItem('oscilloscopeSN', globalState.oscilloscopeSN.value)
        localStorage.setItem('poNumber', globalState.poNumber.value)
        localStorage.setItem('lotNumber', globalState.lotNumber.value)
        localStorage.setItem('serialNumber', globalState.serialNumber.value)
        localStorage.setItem('quantity', globalState.quantity.value.toString())
    }

    // Load data form dari localStorage
    function loadFormData() {
        globalState.operatorName.value = localStorage.getItem('operatorName') || ''
        globalState.testDate.value = localStorage.getItem('testDate') || new Date().toISOString().split('T')[0]
        globalState.multimeterSN.value = localStorage.getItem('multimeterSN') || ''
        globalState.oscilloscopeSN.value = localStorage.getItem('oscilloscopeSN') || ''
        globalState.poNumber.value = localStorage.getItem('poNumber') || ''
        globalState.lotNumber.value = localStorage.getItem('lotNumber') || ''
        globalState.serialNumber.value = localStorage.getItem('serialNumber') || ''
        globalState.quantity.value = parseInt(localStorage.getItem('quantity')) || 1
    }

    // Fungsi untuk menampilkan error modal
    function showError(message) {
        globalState.errorMessage.value = message
        globalState.showErrorModal.value = true
    }

    // Fungsi untuk menutup error modal
    function closeErrorModal() {
        globalState.showErrorModal.value = false
    }

    onMounted(() => {
        loadProducts()
    })

    return {
        // Expose semua state dari globalState
        allProducts: globalState.allProducts,
        productSeries: globalState.productSeries,
        selectedProduct: globalState.selectedProduct,
        selectedTestType: globalState.selectedTestType,
        testParameters: globalState.testParameters,
        templateData: globalState.templateData,
        testingInProgress: globalState.testingInProgress,
        operatorName: globalState.operatorName,
        testDate: globalState.testDate,
        multimeterSN: globalState.multimeterSN,
        oscilloscopeSN: globalState.oscilloscopeSN,
        poNumber: globalState.poNumber,
        lotNumber: globalState.lotNumber,
        serialNumber: globalState.serialNumber,
        quantity: globalState.quantity,
        errorMessage: globalState.errorMessage,
        showErrorModal: globalState.showErrorModal,
        serialRange,
        loadProducts,
        onProductSelect,
        onSeriesSelect,
        selectTestType,
        startTesting,
        incrementQty,
        decrementQty,
        validateNumeric,
        clearForm,
        saveFormData,
        loadFormData,
        showError,
        closeErrorModal
    }
}