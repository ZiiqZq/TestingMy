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
    db: {
        getUsers: () => ipcRenderer.invoke('db:get-users')
    }
});