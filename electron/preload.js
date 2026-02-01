const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron
    },
    onAppReady: (callback) => {
        ipcRenderer.on('app-ready', callback)
    },
    sendAppReady: () => {
        ipcRenderer.send('app-ready')
    },
    onBeforeQuit: (callback) => {
        ipcRenderer.on('app-before-quit', callback)
    },
    confirmQuit: () => {
        ipcRenderer.send('app-quit-confirmed')
    },
    cancelQuit: () => {
        ipcRenderer.send('app-quit-cancelled')
    },
    db: {
        getUsers: () => ipcRenderer.invoke('db:get-users'),
        getProducts: () => ipcRenderer.invoke('db:get-products'),
        getProductTestTypes: (productId) => ipcRenderer.invoke('db:get-product-test-types', productId),
        getTestParameters: (data) => ipcRenderer.invoke('db:get-test-parameters', data),
        getTemplatesByProduct: (productId) => ipcRenderer.invoke('db:get-templates-by-product', productId),
        submitTestEntries: (submitData) => ipcRenderer.invoke('db:submit-test-entries', submitData)
    }
});

console.log('Preload script loaded - electronAPI exposed');