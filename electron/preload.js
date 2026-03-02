// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron
    },
    onAppReady: (callback) => {
        ipcRenderer.on('app-ready', callback);
    },
    sendAppReady: () => {
        ipcRenderer.send('app-ready');
    },
    onBeforeQuit: (callback) => {
        ipcRenderer.on('app-before-quit', callback);
    },
    confirmQuit: () => {
        ipcRenderer.send('app-quit-confirmed');
    },
    cancelQuit: () => {
        ipcRenderer.send('app-quit-cancelled');
    },
    db: {
        getUsers:             ()       => ipcRenderer.invoke('db:get-users'),
        getProducts:          ()       => ipcRenderer.invoke('db:get-products'),
        getProductTestTypes:  (id)     => ipcRenderer.invoke('db:get-product-test-types', id),
        getTestParameters:    (data)   => ipcRenderer.invoke('db:get-test-parameters', data),
        getTemplatesByProduct:(id)     => ipcRenderer.invoke('db:get-templates-by-product', id),
        submitTestEntries:    (data)   => ipcRenderer.invoke('db:submit-test-entries', data),
        validateExcelImport:  (data)   => ipcRenderer.invoke('db:validate-excel-import', data),
        importExcelData:      (data)   => ipcRenderer.invoke('db:import-excel-data', data),
    },
    excel: {
        // Konversi dasar — key pakai huruf kolom (A, B, C, ...)
        convertToJson:    (options) => ipcRenderer.invoke('excel:convert-to-json',     options),

        // Konversi dengan skip N baris + key = nama kolom header
        convertWithHeader:(options) => ipcRenderer.invoke('excel:convert-with-header', options),

        // Deteksi header otomatis + filter baris tidak valid (USL/LSL/kosong)
        detectHeader:     (options) => ipcRenderer.invoke('excel:detect-header',       options),

        // Ambil daftar nama sheet saja
        getSheets:        (options) => ipcRenderer.invoke('excel:get-sheets',          options),
    }
});

console.log('✅ Preload loaded');