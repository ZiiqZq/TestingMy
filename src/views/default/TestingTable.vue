<template>
    <div class="flex flex-col h-full px-2 pt-2">
        <!-- Modal untuk konfirmasi perubahan yang belum disimpan -->
        <ConfirmModal 
            ref="confirmModal"
            :message="confirmMessage"
            confirmText="Ya, Tinggalkan"
            @confirm="handleConfirmLeave"
            @cancel="handleCancelLeave"
        />
        
        <!-- Modal untuk konfirmasi penutupan aplikasi -->
        <ConfirmModal 
            ref="closeAppModal"
            :message="'Anda memiliki data yang belum disimpan.\\n\\nYakin ingin menutup aplikasi?\\nSemua perubahan yang belum disimpan akan hilang.'"
            confirmText="Ya, Tutup Aplikasi"
            cancelText="Batal"
            @confirm="handleCloseApp"
            @cancel="handleCancelCloseApp"
        />
        
        <!-- Modal untuk warning -->
        <WarningModal 
            ref="warningModal"
            :message="warningMessage"
            @close="handleWarningClose"
        />
        
        <!-- Modal untuk error -->
        <ErrorModal 
            ref="errorModal"
            :message="errorMessage"
            @close="handleErrorClose"
        />
        
        <!-- Modal untuk success -->
        <SuccessModal 
            ref="successModal"
            :message="successMessage"
            @close="handleSuccessClose"
        />
        
        <!-- Container tabel -->
        <div class="table-container border border-slate-300 rounded-2xl shadow-md bg-white">
            <table class="test-table">
                <!-- Header dinamis dari template -->
                <thead class="sticky top-0">
                    <tr>
                        <!-- Header utama (rowspan 2) -->
                        <th class="p-3 border-b border-r text-center font-semibold" rowspan="2">NO</th>
                        <th class="p-3 border-b border-r text-center font-semibold" rowspan="2">SERIAL NO.</th>
                        
                        <!-- Dynamic headers dari template -->
                        <template v-for="(header, index) in tableHeaders" :key="index">
                            <th 
                                v-if="!header.isSub"
                                :colspan="header.colspan || 1"
                                :rowspan="header.rowspan || 1"
                                class="p-3 border-b border-r text-center font-semibold"
                            >
                                {{ header.name }}
                            </th>
                        </template>
                        
                        <th class="p-3 border-b border-r text-center font-semibold" rowspan="2">STATUS</th>
                        <th class="p-3 border-b border-r text-center font-semibold" rowspan="2">REMARKS</th>
                    </tr>
                    
                    <!-- Sub-header row -->
                    <tr v-if="hasSubHeaders">
                        <template v-for="(header, index) in tableHeaders" :key="`sub-${index}`">
                            <th 
                                v-if="header.isSub"
                                class="p-3 border-b border-r text-center font-semibold sub-header"
                                @click="setCurrentColumn(header)"
                            >
                                {{ header.name }}
                            </th>
                        </template>
                    </tr>
                </thead>
                
                <!-- Body dinamis -->
                <tbody>
                    <tr v-for="(row, rowIndex) in tableRows" :key="rowIndex">
                        <td class="p-3 border-b border-r text-center disable">{{ rowIndex + 1 }}</td>
                        <td class="p-3 border-b border-r text-center font-semibold disable">
                            {{ testInfo.serialNumber + rowIndex }}
                        </td>
                        
                        <!-- Dynamic cells berdasarkan template -->
                        <td 
                            v-for="(cell, cellIndex) in getRowCells(rowIndex)" 
                            :key="cellIndex"
                            class="p-0 border-b border-r"
                            :class="getCellClass(cell)"
                        >
                            <!-- Input type berdasarkan validationType -->
                            <select 
                                v-if="cell.type === 'select'"
                                v-model="cell.value"
                                @change="handleCellChange(rowIndex, cellIndex)"
                                @focus="setCurrentColumn(cell)"
                                class="w-full h-full text-center border-none focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1"
                            >
                                <option value="">--</option>
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                                <option v-if="cell.expectedValue" :value="cell.expectedValue">
                                    {{ cell.expectedValue }}
                                </option>
                            </select>
                            <input 
                                v-else
                                v-model="cell.value"
                                type="text"
                                @input="handleNumberInput($event, rowIndex, cellIndex)"
                                @keydown="allowOnlyNumbers"
                                @paste="handlePaste"
                                @focus="setCurrentColumn(cell)"
                                class="w-full h-full text-center border-none focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1"
                                
                            />
                        </td>
                        
                        <!-- Status -->
                        <td class="border-b border-r text-center disable">
                            <div class="p-0.5 text-white">
                                <p :class="row.status === 'Pass' ? 'bg-green-600' : 'bg-red-600'" class="border rounded-md px-2 py-1">
                                    {{ row.status || 'Fail' }}
                                </p>
                            </div>
                        </td>
                        
                        <!-- Remarks -->
                        <td class="p-0 border-b border-r">
                            <input 
                                v-model="row.remarks"
                                type="text"
                                class="w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Summary -->
        <div v-if="summary.total > 0" class="flex justify-between items-center mt-4 px-6 py-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-sm">
            <div class="text-sm space-x-4 flex">
                <div class="flex items-center gap-2">
                    <span class="text-slate-600">Total:</span>
                    <strong class="text-slate-800 text-lg">{{ summary.total }}</strong>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-slate-600">Pass:</span>
                    <span class="text-emerald-600 font-bold text-lg">{{ summary.pass }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-slate-600">Fail:</span>
                    <span class="text-red-600 font-bold text-lg">{{ summary.fail }}</span>
                </div>
            </div>
            <div class="text-sm font-semibold text-slate-700 bg-white px-4 py-1 rounded-full border border-slate-200">
                {{ summary.passPercentage }}% Pass Rate
            </div>
        </div>
        
        <!-- Tombol -->
        <div class="flex-shrink-0 flex justify-end items-center pt-5 bg-white">
            <div class="space-x-2">
                <button @click="handleCancel" class="bg-[#9B9696] w-32 hover:bg-gray-500 text-white font-bold text-md py-2 px-5 rounded-full">
                    Cancel
                </button>
                <button @click="handleSubmit" class="bg-white w-48 border border-[#444D59] hover:bg-[#52796f] text-[#464e58] hover:text-white font-bold text-md py-2 px-5 rounded-full transition-all ease-in-out duration-300">
                    Submit
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useTestingSession } from '@/composables/useTestingSession'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import WarningModal from '@/components/modals/WarningModal.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'
import SuccessModal from '@/components/modals/SuccessModal.vue'

const router = useRouter()
const { getSession, clearSession } = useTestingSession()

// Ambil data dari session
const testInfo = getSession()

// Jika tidak ada data, kembali ke halaman Testing
if (!testInfo) {
    console.log('Tidak ada data testInfo, kembali ke Testing')
    router.push({ name: 'Testing' })
}

// Data tabel
const tableRows = ref([])
const hasUnsavedChanges = ref(false)

// Modal konfirmasi
const confirmModal = ref(null)
const confirmMessage = ref('')
const warningModal = ref(null)
const errorModal = ref(null)
const successModal = ref(null)
const warningMessage = ref('')
const errorMessage = ref('')
const successMessage = ref('')
let pendingNavigation = null

// Fungsi untuk menampilkan modal konfirmasi
const showConfirmModal = (message) => {
    confirmMessage.value = message
    confirmModal.value?.show()
}

// Fungsi untuk menampilkan error modal
const showError = (message) => {
    errorMessage.value = message
    errorModal.value?.show()
}

// Fungsi untuk menampilkan warning modal
const showWarning = (message) => {
    warningMessage.value = message
    warningModal.value?.show()
}

// Fungsi untuk menampilkan success modal
const showSuccess = (message) => {
    successMessage.value = message
    successModal.value?.show()
}

// Handler untuk menutup modal
const handleErrorClose = () => {
    errorModal.value?.hide()
}

const handleWarningClose = () => {
    warningModal.value?.hide()
}

const handleSuccessClose = () => {
    successModal.value?.hide()
}

// Handle close app confirm
const handleCloseApp = () => {
    window.close()
}

const handleCancelCloseApp = () => {
    closeAppModal.value?.hide()
}

// Fungsi untuk generate headers dari template
const tableHeaders = computed(() => {
    if (!testInfo?.template?.custom_columns?.columns) {
        console.log('Tidak ada template data')
        return []
    }
    
    const headers = []
    const columns = testInfo.template.custom_columns.columns.filter(col => !col.isReference)
    
    columns.forEach(col => {
        if (col.isSplit && col.sub?.length > 0) {
            // Main header untuk split column
            headers.push({
                name: col.name,
                colspan: col.sub.length,
                rowspan: 1,
                isSub: false
            })
            
            // Sub headers
            col.sub.forEach(subCol => {
                headers.push({
                    name: subCol.name,
                    colspan: 1,
                    rowspan: 1,
                    isSub: true,
                    lsl: subCol.lsl,
                    usl: subCol.usl,
                    unit: subCol.unit,
                    validationType: subCol.validationType,
                    expectedValue: subCol.expectedValue
                })
            })
        } else {
            // Regular header
            headers.push({
                name: col.name,
                colspan: 1,
                rowspan: 2,
                isSub: false,
                lsl: col.lsl,
                usl: col.usl,
                unit: col.unit,
                validationType: col.validationType,
                expectedValue: col.expectedValue
            })
        }
    })
    
    console.log('Generated headers:', headers)
    return headers
})

const hasSubHeaders = computed(() => {
    return tableHeaders.value.some(header => header.isSub)
})

// Total columns untuk tbody
const totalColumns = computed(() => {
    let count = 0
    tableHeaders.value.forEach(header => {
        if (header.isSub) {
            count++
        } else if (!header.isSub && header.rowspan === 2) {
            count++
        }
    })
    console.log('Total columns:', count)
    return count
})

// Summary statistics
const summary = computed(() => {
    const pass = tableRows.value.filter(row => row.status === 'Pass').length
    const fail = tableRows.value.filter(row => row.status !== 'Pass').length
    const total = tableRows.value.length
    const passPercentage = total > 0 ? Math.round((pass / total) * 100) : 0
    
    return { pass, fail, total, passPercentage }
})

// Helper untuk mendapatkan sel berdasarkan row
const getRowCells = (rowIndex) => {
    if (tableRows.value[rowIndex] && tableRows.value[rowIndex].cells) {
        return tableRows.value[rowIndex].cells.slice(0, totalColumns.value)
    }
    return []
}

// Fungsi untuk hanya memperbolehkan input angka
const allowOnlyNumbers = (event) => {
    const allowedKeys = [
        'Backspace', 'Tab', 'Enter', 'Escape',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Delete', 'Home', 'End'
    ]
    
    // Jika tombol yang ditekan adalah kunci kontrol, izinkan
    if (allowedKeys.includes(event.key)) {
        return true
    }
    
    // Izinkan titik desimal (hanya satu)
    if (event.key === '.') {
        const currentValue = event.target.value
        // Cegah lebih dari satu titik desimal
        if (currentValue.includes('.')) {
            event.preventDefault()
            return false
        }
        return true
    }
    
    // Izinkan tanda minus di awal
    if (event.key === '-') {
        const currentValue = event.target.value
        const cursorPosition = event.target.selectionStart
        
        // Hanya izinkan tanda minus di awal
        if (cursorPosition !== 0 || currentValue.includes('-')) {
            event.preventDefault()
            return false
        }
        return true
    }
    
    // Hanya izinkan karakter angka
    if (!/^\d$/.test(event.key)) {
        event.preventDefault()
        return false
    }
    
    return true
}

// Handle paste untuk membersihkan teks yang ditempel
const handlePaste = (event) => {
    event.preventDefault()
    const pastedText = (event.clipboardData || window.clipboardData).getData('text')
    
    // Hanya ambil angka, titik desimal, dan tanda minus
    const cleaned = pastedText.replace(/[^\d.-]/g, '')
    
    // Cegah lebih dari satu titik desimal
    const parts = cleaned.split('.')
    if (parts.length > 2) {
        // Jika ada lebih dari satu titik, ambil hanya bagian pertama dan kedua
        const finalValue = parts[0] + '.' + parts.slice(1).join('')
        document.execCommand('insertText', false, finalValue)
    } else {
        document.execCommand('insertText', false, cleaned)
    }
}

// Handle input untuk angka
const handleNumberInput = (event, rowIndex, cellIndex) => {
    const row = tableRows.value[rowIndex]
    if (!row || !row.cells[cellIndex]) return
    
    const cell = row.cells[cellIndex]
    const inputValue = event.target.value
    
    // Hapus karakter non-numerik kecuali titik desimal dan tanda minus
    let cleanedValue = inputValue.replace(/[^\d.-]/g, '')
    
    // Pastikan hanya ada satu titik desimal
    const parts = cleanedValue.split('.')
    if (parts.length > 2) {
        cleanedValue = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Pastikan hanya ada satu tanda minus dan di awal
    if (cleanedValue.includes('-')) {
        const hasMultipleMinus = cleanedValue.split('-').length > 2
        const minusNotAtStart = cleanedValue.indexOf('-') > 0
        
        if (hasMultipleMinus || minusNotAtStart) {
            cleanedValue = cleanedValue.replace(/-/g, '')
            cleanedValue = '-' + cleanedValue
        }
    }
    
    // Update nilai sel
    cell.value = cleanedValue
    
    // Validasi sel
    validateCell(cell)
    validateRow(rowIndex)
    
    // Simpan perubahan
    saveTableData()
}

// Fungsi untuk menyimpan data tabel ke localStorage
const saveTableData = () => {
    if (tableRows.value.length > 0) {
        localStorage.setItem('testingTableData', JSON.stringify(tableRows.value))
        localStorage.setItem('testingDataSaved', 'true')
        // Simpan template ID untuk validation later
        localStorage.setItem('testingTemplateId', String(testInfo?.template?.id || 0))
        hasUnsavedChanges.value = true
        console.log('Data tabel disimpan ke localStorage')
    }
}

// Fungsi untuk memuat data tabel dari localStorage
const loadTableData = () => {
    const savedData = localStorage.getItem('testingTableData')
    const testingDataId = testInfo?.template?.id
    const savedTemplateId = localStorage.getItem('testingTemplateId')
    
    // Hanya load data jika template ID sama
    if (savedData && testingDataId && savedTemplateId === String(testingDataId)) {
        try {
            tableRows.value = JSON.parse(savedData)
            hasUnsavedChanges.value = true
            console.log('Data tabel dimuat dari localStorage:', tableRows.value.length, 'baris')
        } catch (error) {
            console.error('Error loading table data:', error)
            localStorage.removeItem('testingTableData')
            localStorage.removeItem('testingTemplateId')
        }
    } else if (savedData && testingDataId !== parseInt(savedTemplateId)) {
        // Jika template berbeda, clear old data
        console.log('Template berbeda, menghapus data lama')
        localStorage.removeItem('testingTableData')
        localStorage.removeItem('testingTemplateId')
    }
}

// Set current column untuk LeftTestingTable
const setCurrentColumn = (column) => {
    const columnInfo = {
        name: column.name || 'Kolom',
        lsl: column.lsl || '-',
        usl: column.usl || '-',
        unit: column.unit || ''
    }
    
    localStorage.setItem('currentColumn', JSON.stringify(columnInfo))
}

// Generate tabel dari template
const generateTableFromTemplate = () => {
    if (!testInfo || !testInfo.template || !testInfo.quantity) {
        console.error('Tidak ada data testInfo untuk generate tabel')
        return
    }
    
    console.log('Generating table from template:', testInfo.template)
    
    const rows = []
    const columns = testInfo.template.custom_columns?.columns || []
    
    // Filter kolom yang bukan reference
    const activeColumns = columns.filter(col => !col.isReference)
    
    // Process columns untuk mendapatkan semua sel
    const allCells = []
    activeColumns.forEach(col => {
        if (col.isSplit && col.sub?.length > 0) {
            // Untuk split columns, tambahkan semua sub columns
            col.sub.forEach(subCol => {
                allCells.push({
                    name: subCol.name,
                    type: subCol.validationType === 'pass_fail' ? 'select' : 'text',
                    value: '',
                    isValid: null,
                    lsl: subCol.lsl,
                    usl: subCol.usl,
                    expectedValue: subCol.expectedValue,
                    unit: subCol.unit
                })
            })
        } else {
            // Regular column
            allCells.push({
                name: col.name,
                type: col.validationType === 'pass_fail' ? 'select' : 'text',
                value: '',
                isValid: null,
                lsl: col.lsl,
                usl: col.usl,
                expectedValue: col.expectedValue,
                unit: col.unit
            })
        }
    })
    
    // Buat baris sesuai jumlah quantity
    for (let i = 0; i < testInfo.quantity; i++) {
        rows.push({
            cells: JSON.parse(JSON.stringify(allCells)), // Deep copy
            status: 'Fail',
            remarks: ''
        })
    }
    
    tableRows.value = rows
    
    // Set default column pertama
    if (rows.length > 0 && rows[0].cells.length > 0) {
        setCurrentColumn(rows[0].cells[0])
    }
    
    console.log('Tabel dibuat dari template:', rows.length, 'baris,', allCells.length, 'kolom')
    saveTableData()
}

// Cell class berdasarkan validasi
const getCellClass = (cell) => {
    if (cell.isValid === true) return 'bg-green-50'
    if (cell.isValid === false) return 'bg-red-50'
    return ''
}

// Validasi sel
const validateCell = (cell) => {
    if (!cell.value && cell.value !== 0) {
        cell.isValid = null
        return
    }
    
    if (cell.type === 'select') {
        cell.isValid = cell.value === cell.expectedValue
    } else {
        const numValue = parseFloat(cell.value)
        if (isNaN(numValue)) {
            cell.isValid = false
            return
        }
        
        const lsl = parseFloat(cell.lsl) || -Infinity
        const usl = parseFloat(cell.usl) || Infinity
        cell.isValid = numValue >= lsl && numValue <= usl
    }
}

// Validasi baris
const validateRow = (rowIndex) => {
    const row = tableRows.value[rowIndex]
    if (!row) return
    
    let allValid = true
    let allFilled = true
    
    row.cells.forEach(cell => {
        if (cell.value === '' && cell.value !== 0) {
            allFilled = false
        }
        if (cell.isValid === false) {
            allValid = false
        }
    })
    
    row.status = allFilled && allValid ? 'Pass' : 'Fail'
}

// Handle input change
const handleCellChange = (rowIndex, cellIndex) => {
    const row = tableRows.value[rowIndex]
    if (!row || !row.cells[cellIndex]) return
    
    const cell = row.cells[cellIndex]
    validateCell(cell)
    validateRow(rowIndex)
    
    saveTableData()
}

// Handle submit
const handleSubmit = async () => {
    // Validasi apakah semua baris sudah lengkap
    const incompleteRows = tableRows.value.filter(row => {
        return row.cells.some(cell => !cell.value && cell.value !== 0)
    })
    
    if (incompleteRows.length > 0) {
        showError(`Masih ada ${incompleteRows.length} baris yang belum lengkap. Harap lengkapi semua data.`)
        return
    }
    
    try {
        // Format data untuk dikirim
        const entries = tableRows.value.map((row, index) => ({
            serialNumber: testInfo.serialNumber + index,
            displaySerialNumber: `SN${testInfo.serialNumber + index}`,
            testResults: row.cells.map((cell, cellIndex) => ({
                name: cell.name,
                value: cell.value,
                isValid: cell.isValid,
                lsl: cell.lsl,
                usl: cell.usl,
                expectedValue: cell.expectedValue,
                unit: cell.unit
            })),
            status: row.status,
            remarks: row.remarks || ''
        }))
        
        const submitData = {
            productId: testInfo.product.id,
            testTypeId: testInfo.testType.id,
            templateId: testInfo.template?.id || 0,
            operatorName: testInfo.operatorName,
            testDate: testInfo.testDate,
            poNumber: testInfo.poNumber,
            entries: entries
        }
        
        console.log('Submitting data:', submitData)
        
        // Kirim ke Electron
        const result = await window.electron.db.submitTestEntries(submitData)
        
        if (result.success) {
            showSuccess('Data berhasil disimpan!')
            
            // Clear data yang disimpan
            setTimeout(() => {
                clearUnsavedData()
                clearSession()
                router.push({ name: 'Testing' })
            }, 1500)
        } else {
            showError('Gagal menyimpan data: ' + result.message)
        }
    } catch (error) {
        showError('Error: ' + error.message)
    }
}

// Bersihkan data yang belum disimpan
const clearUnsavedData = () => {
    // Hapus semua data tabel yang lama
    localStorage.removeItem('testingTableData')
    localStorage.removeItem('testingDataSaved')
    localStorage.removeItem('currentColumn')
    localStorage.removeItem('testingData')
    hasUnsavedChanges.value = false
    tableRows.value = []
    console.log('All unsaved data cleared')
}

// Handle confirm leave
const handleConfirmLeave = () => {
    // Clear semua data
    clearUnsavedData()
    clearSession()
    
    if (pendingNavigation) {
        pendingNavigation()
    } else {
        // Untuk cancel button (kembali ke Testing)
        router.push({ name: 'Testing' })
    }
}

// Handle cancel leave
const handleCancelLeave = () => {
    pendingNavigation = null
}

// Handle cancel (tombol Cancel)
const handleCancel = () => {
    if (hasUnsavedChanges.value) {
        showConfirmModal('Anda memiliki data yang belum disimpan. Yakin ingin membatalkan?')
    } else {
        // Tidak ada unsaved changes, langsung clear dan navigate
        clearUnsavedData()
        clearSession()
        router.push({ name: 'Testing' })
    }
}

// Fungsi untuk menangani keyboard shortcuts (F5, Ctrl+R, Ctrl+Shift+R)
const handleKeyDown = (event) => {
    // Detect F5, Ctrl+R, Ctrl+Shift+R
    if (
        (event.key === 'F5') ||
        (event.ctrlKey && event.key === 'r') ||
        (event.ctrlKey && event.shiftKey && event.key === 'R')
    ) {
        if (hasUnsavedChanges.value) {
            event.preventDefault()
            showConfirmModal('Anda memiliki data yang belum disimpan. Yakin ingin me-refresh halaman?')
            return false
        }
    }
    
    // Detect browser back/forward buttons
    if (event.key === 'ArrowLeft' && event.altKey) {
        if (hasUnsavedChanges.value) {
            event.preventDefault()
            showConfirmModal('Anda memiliki data yang belum disimpan. Yakin ingin meninggalkan halaman?')
            return false
        }
    }
}

// Event listener untuk beforeunload (close tab/window)
const handleBeforeUnload = (event) => {
    if (hasUnsavedChanges.value) {
        // Untuk close tab/window, kita masih perlu menggunakan dialog bawaan
        // karena beforeunload tidak bisa async
        event.preventDefault()
        event.returnValue = 'Anda memiliki data yang belum disimpan. Yakin ingin meninggalkan halaman?'
        return 'Anda memiliki data yang belum disimpan. Yakin ingin meninggalkan halaman?'
    }
}

// Initialize table
onMounted(() => {
    console.log('TestingTable.vue mounted dengan testInfo:', testInfo)
    
    // Coba load data yang sudah disimpan
    loadTableData()
    
    // Jika tidak ada data yang disimpan, buat data baru dari template
    if (tableRows.value.length === 0 && testInfo) {
        generateTableFromTemplate()
    }
    
    // Set up beforeunload untuk mencegah close/refresh
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Set up keyboard events
    document.addEventListener('keydown', handleKeyDown)
})

// Cleanup
onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('keydown', handleKeyDown)
})

// Navigation guard - mencegah pindah halaman tanpa konfirmasi
onBeforeRouteLeave((to, from, next) => {
    if (hasUnsavedChanges.value) {
        // Simpan navigation callback
        pendingNavigation = next
        
        // Tampilkan modal konfirmasi
        showConfirmModal('Anda memiliki data yang belum disimpan. Yakin ingin meninggalkan halaman?')
        
        // Jangan lanjutkan navigation sekarang
        return false
    }
    
    next()
})
</script>

<style scoped>
/* Color classes */
.bg-red-600 {
    background-color: #dc2626;
}

.bg-green-600 {
    background-color: #16a34a;
}

.bg-green-50 {
    background-color: #f0fdf4;
}

.bg-red-50 {
    background-color: #fef2f2;
}

/* Badge styling */
.badge-pass {
    display: inline-block;
    background-color: #d1fae5;
    color: #047857;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.75rem;
    border: 1px solid #6ee7b7;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.badge-fail {
    display: inline-block;
    background-color: #fee2e2;
    color: #991b1b;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.75rem;
    border: 1px solid #fca5a5;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Table container */
.table-container {
    overflow-x: auto;
    overflow-y: auto;
    border: 1px solid #cbd5e1;
    width: 100%;
    max-height: calc(100vh - 220px);
    position: relative;
    background: white;
}

.test-table {
    width: 100%;
    font-size: 0.875rem;
    border-collapse: separate;
    border-spacing: 0;
    font-family: 'Segoe UI', 'Calibri', Arial, sans-serif;
}

.test-table .disable {
    background-color: #f1f5f9;
}

/* Header styling */
.test-table th {
    background: #2F855A;
    color: #ffffff;
    padding: 12px 8px;
    text-align: center;
    font-weight: 700;
    font-size: 12px;
    position: sticky;
    border: 1px solid #047857;
    border-top: 1px solid #047857;
    border-bottom: 2px solid #047857;
    top: 0;
    z-index: 10;
    height: 44px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    cursor: default;
    user-select: none;
    white-space: normal;
    word-break: break-word;
    max-width: 200px;
    min-width: 80px;
}

.test-table th.sub-header {
    background: #E6F4EE;
    border: 1px solid #3a5985;
    border-bottom: 2px solid #276749;
    color: #065F46;
    position: sticky;
    font-weight: 600;
    top: 44px;
    z-index: 10;
    height: 36px;
    text-transform: none;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
}

.test-table th.sub-header:hover {
    background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.test-table thead {
    position: sticky;
    top: 0;
    z-index: 20;
}

.test-table tbody tr:nth-child(even) {
    background-color: #f8fafc;
}

.test-table tbody tr:hover {
    background-color: #f0fdf4;
}

/* Cell styling */
.test-table td {
    padding: 0;
    border: 1px solid #e2e8f0;
    text-align: center;
    background-color: white;
    transition: all 0.15s ease;
    height: 36px;
    vertical-align: middle;
    position: relative;
    user-select: none;
}

/* Cell validation colors */
.test-table td.bg-green-50 {
    background-color: #ecfdf5 !important;
    border-color: #a7f3d0 !important;
}

.test-table td.bg-red-50 {
    background-color: #fef2f2 !important;
    border-color: #fca5a5 !important;
}

/* Input styling */
.test-table input[type="text"],
.test-table input[type="number"],
.test-table select {
    width: 100%;
    height: 100%;
    min-height: 36px;
    padding: 6px 10px;
    margin: 0;
    border: none;
    border-radius: 0;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    background: transparent;
    transition: all 0.15s ease;
    box-sizing: border-box;
    font-family: inherit;
    display: block;
}

.test-table input[type="text"],
.test-table input[type="number"] {
    cursor: text;
}

.test-table select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
    background-size: 14px;
    padding-right: 24px;
}

.test-table input[type="text"]:focus,
.test-table input[type="number"]:focus,
.test-table select:focus {
    outline: none;
    background-color: #fef3c7;
    box-shadow: 0 0 0 2px #fbbf24;
    z-index: 10;
    position: relative;
}

.test-table td:focus-within {
    z-index: 2;
    position: relative;
}

/* Scrollbar styling */
.table-container::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.table-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 2px;
}

.table-container::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
    border-radius: 2px;
}

.table-container::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
}
</style>