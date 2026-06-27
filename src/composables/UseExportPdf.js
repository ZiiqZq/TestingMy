import { ref } from 'vue'

export function useExportPdf() {
    const exporting = ref(false)

    async function exportToPdf({ form, entries, headers, testInfo }) {
        exporting.value = true
        try {
            const result = await window.electron.exportPdf({ form, entries, headers, testInfo })
            return result
        } catch (err) {
            console.error('❌ exportToPdf error:', err)
            return { success: false, error: err.message }
        } finally {
            exporting.value = false
        }
    }

    return { exporting, exportToPdf }
}