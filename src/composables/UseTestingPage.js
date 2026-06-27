// composables/useTestingPage.js
import { ref, computed, onMounted } from 'vue'

// Ambil user yang sedang login dari localStorage (global)
const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    } catch {
        return null
    }
}

// State global
const globalState = {
    allProducts: ref([]),
    productSeries: ref([]),
    selectedProduct: ref(null),
    selectedTestType: ref(null),
    testParameters: ref([]),
    templateData: ref(null),
    testingInProgress: ref(false),
    operatorName: ref(getCurrentUser()?.username || ''),
    testDate: ref(new Date().toISOString().split('T')[0]),
    multimeterSN: ref(''),
    oscilloscopeSN: ref(''),
    poNumber: ref(''),
    lotNumber: ref(''),
    serialNumber: ref(''),
    quantity: ref(1),
    errorMessage: ref(''),
    showErrorModal: ref(false),
    toastMessage: ref(''),
    toastShow: ref(false),
    toastType: ref('error')
}

export function useTestingPage() {
    const serialRange = computed(() => {
        if (!globalState.serialNumber.value) return ''
        const start = parseInt(globalState.serialNumber.value)
        if (isNaN(start)) return ''
        const end = start + globalState.quantity.value - 1
        return `${start} - ${end}`
    })

    async function loadProducts() {
        try {
            const result = await window.electron.db.getProducts()
            if (result.success) {
                globalState.allProducts.value = result.data
            } else {
                showError(`Gagal memuat produk: ${result.error}`)
            }
        } catch (error) {
            showError(`Gagal memuat produk: ${error.message}`)
        }
    }

    function showToast(message, type = 'error') {
        globalState.toastMessage.value = message
        globalState.toastType.value = type
        globalState.toastShow.value = true
        setTimeout(() => {
            globalState.toastShow.value = false
        }, 3500)
    }

    function closeToast() {
        globalState.toastShow.value = false
    }

    function onProductSelect(productName) {
        globalState.productSeries.value = globalState.allProducts.value.filter(p => p.product_name === productName)
        globalState.selectedProduct.value = null
        globalState.selectedTestType.value = null
        globalState.templateData.value = null
        globalState.testParameters.value = []
        return globalState.productSeries.value
    }

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
            throw new Error(`Gagal memuat tipe test: ${error.message}`)
        }
    }

    async function selectTestType(testType) {
        globalState.selectedTestType.value = testType

        try {
            const paramsResult = await window.electron.db.getTestParameters({
                productId: globalState.selectedProduct.value.id,
                testTypeId: testType.id
            })
            if (paramsResult.success) {
                globalState.testParameters.value = paramsResult.data
            }

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
            showError(`Gagal memuat setup test: ${error.message}`)
        }
    }

    function validateStartTesting() {
        const errors = []
        // Operator name sudah diisi otomatis, tidak perlu validasi
        if (!globalState.testDate.value) errors.push('Tanggal test harus diisi')
        if (!globalState.poNumber.value) errors.push('PO Number harus diisi')
        if (!globalState.serialNumber.value) errors.push('Serial Number harus diisi')
        if (!globalState.quantity.value || globalState.quantity.value < 1) errors.push('Jumlah harus valid')
        if (!globalState.selectedProduct.value) errors.push('Device harus dipilih')
        if (!globalState.selectedTestType.value) errors.push('Test type harus dipilih')
        if (!globalState.templateData.value) errors.push('Template tidak tersedia untuk test ini')
        return errors
    }

    function startTesting() {
        const errors = validateStartTesting()
        if (errors.length > 0) {
            return { success: false, message: errors.join(', ') }
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
        return { success: true, testInfo }
    }

    function clearForm() {
        // Jangan reset operatorName, karena harus tetap dari user
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

    function incrementQty() {
        if (globalState.quantity.value < 100) globalState.quantity.value++
    }

    function decrementQty() {
        if (globalState.quantity.value > 1) globalState.quantity.value--
    }

    function validateNumeric(value) {
        return value.replace(/[^0-9]/g, '')
    }

    // // Simpan data form (kecuali operatorName)
    // function saveFormData() {
    //     localStorage.setItem('testDate', globalState.testDate.value)
    //     localStorage.setItem('multimeterSN', globalState.multimeterSN.value)
    //     localStorage.setItem('oscilloscopeSN', globalState.oscilloscopeSN.value)
    //     localStorage.setItem('poNumber', globalState.poNumber.value)
    //     localStorage.setItem('lotNumber', globalState.lotNumber.value)
    //     localStorage.setItem('serialNumber', globalState.serialNumber.value)
    //     localStorage.setItem('quantity', globalState.quantity.value.toString())
    // }

    // // Load data form (kecuali operatorName)
    // function loadFormData() {
    //     globalState.testDate.value = localStorage.getItem('testDate') || new Date().toISOString().split('T')[0]
    //     globalState.multimeterSN.value = localStorage.getItem('multimeterSN') || ''
    //     globalState.oscilloscopeSN.value = localStorage.getItem('oscilloscopeSN') || ''
    //     globalState.poNumber.value = localStorage.getItem('poNumber') || ''
    //     globalState.lotNumber.value = localStorage.getItem('lotNumber') || ''
    //     globalState.serialNumber.value = localStorage.getItem('serialNumber') || ''
    //     globalState.quantity.value = parseInt(localStorage.getItem('quantity')) || 1
    // }

    function resetFormData() {
        // Jangan reset operatorName (tetap dari user) dan testDate (set ke hari ini)
        globalState.multimeterSN.value = ''
        globalState.oscilloscopeSN.value = ''
        globalState.poNumber.value = ''
        globalState.lotNumber.value = ''
        globalState.serialNumber.value = ''
        globalState.quantity.value = 1
        // Reset testDate ke hari ini
        globalState.testDate.value = new Date().toISOString().split('T')[0]
        // Opsional: reset juga selectedProduct dan selectedTestType jika ingin lebih bersih
        // globalState.selectedProduct.value = null
        // globalState.selectedTestType.value = null
        // globalState.templateData.value = null
    }

    function showError(message) {
        globalState.errorMessage.value = message
        globalState.showErrorModal.value = true
    }

    function closeErrorModal() {
        globalState.showErrorModal.value = false
    }

    // Sinkronisasi operator name jika user berubah (misal setelah login)
    function syncOperatorFromUser() {
        const user = getCurrentUser()
        globalState.operatorName.value = user ? user.username : ''
    }
    onMounted(() => {
        loadProducts()
        resetFormData()
        syncOperatorFromUser()
    })

    return {
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
        // saveFormData,
        // loadFormData,
        resetFormData,
        showError,
        closeErrorModal,
        toastMessage: globalState.toastMessage,
        toastShow: globalState.toastShow,
        toastType: globalState.toastType,
        showToast,
        closeToast,
        syncOperatorFromUser
    }
}