import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Deteksi apakah sedang dalam mode development
const isDev = !app.isPackaged

function createWindow() {
    const win = new BrowserWindow({
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true,
        width: 1200,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    win.setMinimumSize(800, 600);

    // Mode development: load dari Vite dev server
    // Mode production: load dari file build
    if (isDev) {
        win.loadURL('http://localhost:5173')
        win.webContents.openDevTools() // Buka DevTools otomatis
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})