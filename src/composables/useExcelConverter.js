// useExcelConverter.js
import { ref } from 'vue';

export function useExcelConverter() {
    const jsonResult  = ref(null);
    const sheetNames  = ref([]);
    const isLoading   = ref(false);
    const error       = ref(null);

    // ----------------------------------------------------------------
    // Helper: file → Uint8Array (aman dikirim via IPC ke Electron)
    // ----------------------------------------------------------------
    const toUint8Array = async (file) => {
        const buf = await file.arrayBuffer();
        return new Uint8Array(buf);
    };

    // ----------------------------------------------------------------
    // 1. Konversi dasar — key = huruf kolom (A, B, C, ...)
    //    Semua baris ikut, termasuk USL/LSL/judul.
    //    Cocok untuk preview raw data.
    // ----------------------------------------------------------------
    const convertFile = async (file) => {
        isLoading.value = true;
        error.value     = null;

        try {
            const uint8Array = await toUint8Array(file);

            const result = await window.electron.excel.convertToJson({
                buffer:  uint8Array,
                options: { header: { rows: 0 } }
            });

            if (!result.success) throw new Error(result.error);

            jsonResult.value = result.data;
            sheetNames.value = Object.keys(result.data);
            return result.data;

        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // ----------------------------------------------------------------
    // 2. Konversi dengan skip N baris header + key = nama kolom.
    //    Baris USL/LSL masih ikut — filter manual jika perlu.
    // ----------------------------------------------------------------
    const convertWithHeader = async (file, headerRow = 1) => {
        isLoading.value = true;
        error.value     = null;

        try {
            const uint8Array = await toUint8Array(file);

            const result = await window.electron.excel.convertWithHeader({
                buffer:    uint8Array,
                headerRow: headerRow
            });

            if (!result.success) throw new Error(result.error);

            jsonResult.value = result.data;
            sheetNames.value = Object.keys(result.data);
            return result.data;

        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // ----------------------------------------------------------------
    // 3. Deteksi header otomatis + filter baris tidak valid.
    //    Handler di Electron yang akan:
    //      - cari baris header pakai scoring
    //      - filter USL, LSL, kosong, judul
    //    Return: { headers, headerRowIndex, totalRows, preview, allData }
    // ----------------------------------------------------------------
    const detectHeader = async (file, sheetName = null) => {
        isLoading.value = true;
        error.value     = null;

        try {
            const uint8Array = await toUint8Array(file);

            const result = await window.electron.excel.detectHeader({
                buffer:    uint8Array,
                sheetName: sheetName   // null = pakai sheet pertama
            });

            if (!result.success) throw new Error(result.error);

            return result.data; // { headers, headerRowIndex, totalRows, preview, allData }

        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // ----------------------------------------------------------------
    // 4. Ambil daftar nama sheet dari file Excel
    // ----------------------------------------------------------------
    const getSheets = async (file) => {
        isLoading.value = true;
        error.value     = null;

        try {
            const uint8Array = await toUint8Array(file);

            const result = await window.electron.excel.getSheets({
                buffer: uint8Array
            });

            if (!result.success) throw new Error(result.error);

            sheetNames.value = result.data;
            return result.data; // ['Sheet1', 'Sheet2', ...]

        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // ----------------------------------------------------------------
    // Utilitas
    // ----------------------------------------------------------------
    const getSheetData = (sheetName) => {
        if (!jsonResult.value || !sheetName) return [];
        return jsonResult.value[sheetName] || [];
    };

    const getPreview = (sheetName, rows = 5) => {
        return getSheetData(sheetName).slice(0, rows);
    };

    const reset = () => {
        jsonResult.value = null;
        sheetNames.value = [];
        error.value      = null;
    };

    return {
        // State
        jsonResult,
        sheetNames,
        isLoading,
        error,

        // Methods
        convertFile,
        convertWithHeader,
        detectHeader,
        getSheets,
        getSheetData,
        getPreview,
        reset
    };
}