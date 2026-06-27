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
    clearUser: () => {
        localStorage.removeItem('user');
    },
    onUserLoggedIn: (callback) => {
        ipcRenderer.on('user-logged-in', callback);
    },
    confirmQuit: () => ipcRenderer.send('app-quit-confirmed'),
    cancelQuit: () => ipcRenderer.send('app-quit-cancelled'),

    exportPdf: (data) => ipcRenderer.invoke('pdf:export', data),
    
    db: {
        getUsers:             ()       => ipcRenderer.invoke('db:get-users'),
        getProducts:          ()       => ipcRenderer.invoke('db:get-products'),
        getProductTestTypes:  (id)     => ipcRenderer.invoke('db:get-product-test-types', id),
        getTestParameters:    (data)   => ipcRenderer.invoke('db:get-test-parameters', data),
        getTemplatesByProduct:(id)     => ipcRenderer.invoke('db:get-templates-by-product', id),
        submitTestEntries:    (data)   => ipcRenderer.invoke('db:submit-test-entries', data),
        validateExcelImport:  (data)   => ipcRenderer.invoke('db:validate-excel-import', data),
        importExcelData:      (data)   => ipcRenderer.invoke('db:import-excel-data', data),

        // Add Product & Generate (untuk LeftAddProduct.vue + AddProduct.vue) 
        getTestTypes:             ()       => ipcRenderer.invoke('db:get-test-types'),
        addCustomTestType:        (name)   => ipcRenderer.invoke('db:add-custom-test-type', name),
        saveProductWithSequence:  (data)   => ipcRenderer.invoke('db:save-product-with-sequence', data),
        saveTemplate:             (data)   => ipcRenderer.invoke('db:save-template', data),

        getTestSummary: (filters) => ipcRenderer.invoke('db:get-test-summary', filters),
        getTestDetail: (params) => ipcRenderer.invoke('db:get-test-detail', params),
        deleteTestGroup: (params) => ipcRenderer.invoke('db:delete-test-group', params),

        login: (data) => ipcRenderer.invoke('db:login', data),
        getAllUsers: (role) => ipcRenderer.invoke('db:get-all-users', role),
        createUser: (data) => ipcRenderer.invoke('db:create-user', data),
        updateUser: (data) => ipcRenderer.invoke('db:update-user', data),
        deleteUser: (data) => ipcRenderer.invoke('db:delete-user', data),

        getYieldData: (filters) => ipcRenderer.invoke('db:get-yield-data', filters),
        getParetoData: (filters) => ipcRenderer.invoke('db:get-pareto-data', filters),
        getKpiSummary: (filters) => ipcRenderer.invoke('db:get-kpi-summary', filters),
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
    },
    loginSuccess: (userData) => ipcRenderer.send('login-success', userData),
});

console.log('Preload loaded');