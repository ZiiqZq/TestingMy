// Composables/UseTestingTable.js
import { ref } from 'vue'

export function useTestingTable() {
    const tableRows = ref([])
    const currentColumn = ref({ name: 'Pilih kolom', lsl: 'N/A', usl: 'N/A' })
    const currentColumnInfo = ref({ name: '', lsl: '', usl: '', unit: '' })

    const hasUnsavedChanges = ref(false)

    // Fungsi untuk mengecek apakah ada perubahan yang belum disimpan
    const checkUnsavedChanges = () => {
        return hasUnsavedChanges.value
    }

    // Fungsi untuk set status perubahan
    const setUnsavedChanges = (status) => {
        hasUnsavedChanges.value = status
    }

    // Summary stats
    const summaryStats = computed(() => {
        if (tableRows.value.length === 0) return null

        const pass = tableRows.value.filter(row => row.status === 'Pass').length
        const fail = tableRows.value.filter(row => row.status === 'Fail').length
        const total = tableRows.value.length
        const passPercentage = total > 0 ? Math.round((pass / total) * 100) : 0

        return {
            pass,
            fail,
            total,
            summaryStats,
            passPercentage
        }
    })

    // Fungsi utama: buat tabel
    function generateTable(testInfo) {
        if (!testInfo || !testInfo.template || !testInfo.quantity) {
            alert('Data test tidak lengkap')
            return []
        }

        const rows = []
        const columns = testInfo.template.custom_columns?.columns || []

        // Filter kolom yang bukan reference
        const activeColumns = columns.filter(col => !col.isReference)

        // Buat baris sesuai jumlah yang diinput
        for (let i = 0; i < testInfo.quantity; i++) {
            const row = {
                id: i + 1,
                serialNumber: testInfo.serialNumber + i,
                cells: [],
                status: 'Pending',
                remarks: ''
            }

            // Tambahkan sel untuk setiap kolom
            activeColumns.forEach(col => {
                row.cells.push({
                    name: col.name || 'Kolom',
                    type: col.validationType === 'pass_fail' ? 'select' : 'number',
                    value: '',
                    isValid: null,
                    lsl: col.lsl || '',
                    usl: col.usl || '',
                    expected: col.expectedValue || ''
                })
            })

            rows.push(row)
        }

        tableRows.value = rows
        return rows
    }

    // Validasi sel sederhana
    function validateCell(cell) {
        if (!cell.value) {
            cell.isValid = null
            return
        }

        if (cell.type === 'select') {
            cell.isValid = cell.value === cell.expected
        } else {
            const numValue = parseFloat(cell.value)
            const lsl = parseFloat(cell.lsl) || 0
            const usl = parseFloat(cell.usl) || 99999
            cell.isValid = numValue >= lsl && numValue <= usl
        }
    }

    // Validasi baris sederhana
    function validateRow(row) {
        let allValid = true

        for (const cell of row.cells) {
            if (cell.value === '') {
                allValid = false
                break
            }
            if (cell.isValid === false) {
                allValid = false
                break
            }
        }

        row.status = allValid ? 'Pass' : 'Fail'
    }

    // Update info kolom yang dipilih
    function selectColumn(cell) {
        const columnInfo = {
            name: cell.name || 'Kolom',
            lsl: cell.lsl || '-',
            usl: cell.usl || '-'
        }

        // Update ref
        currentColumn.value = columnInfo

        // Simpan ke localStorage agar LeftPanel bisa baca
        localStorage.setItem('currentColumn', JSON.stringify(columnInfo))
    }
    // Submit data ke database
    async function submitData(testInfo) {
        // Cek apakah semua sel sudah diisi
        for (const row of tableRows.value) {
            for (const cell of row.cells) {
                if (!cell.value && cell.value !== 0) {
                    alert('Harap isi semua sel sebelum submit')
                    return { success: false, message: 'Data belum lengkap' }
                }
            }
        }

        // Format data untuk dikirim
        const entries = tableRows.value.map(row => ({
            serialNumber: row.serialNumber,
            displaySerialNumber: `SN${row.serialNumber}`,
            testResults: row.cells.map(cell => ({
                name: cell.name,
                value: cell.value,
                isValid: cell.isValid
            })),
            status: row.status,
            remarks: row.remarks
        }))

        const submitData = {
            productId: testInfo.product.id,
            testTypeId: testInfo.testType.id,
            templateId: testInfo.template.id,
            operatorName: testInfo.operatorName,
            testDate: testInfo.testDate,
            poNumber: testInfo.poNumber,
            entries: entries
        }

        try {
            // Kirim ke Electron
            const result = await window.electron.db.submitTestEntries(submitData)
            return result
        } catch (error) {
            return {
                success: false,
                message: 'Gagal submit: ' + error.message
            }
        }
    }

    return {
        tableRows,
        currentColumn,
        generateTable,
        validateCell,
        validateRow,
        selectColumn,
        submitData,
        hasUnsavedChanges,
        checkUnsavedChanges,
        setUnsavedChanges
    }
}