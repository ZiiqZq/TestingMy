const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron
    },
    // Tambahkan API untuk loading
    onAppReady: (callback) => {
        ipcRenderer.on('app-ready', callback)
    },
    sendAppReady: () => {
        ipcRenderer.send('app-ready')
    }
});