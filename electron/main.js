import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const db = require('./db/connection.cjs')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !app.isPackaged
let mainWindow

function createWindow() {
    const loadingWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        center: true,
        resizable: false,
        alwaysOnTop: true,
        show: false,
        backgroundColor: '#f8fafc',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    // Buat main window
    mainWindow = new BrowserWindow({
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true,
        width: 1200,
        height: 600,
        show: false,
        backgroundColor: '#f8fafc',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    mainWindow.setMinimumSize(800, 600)

    // Load loading screen
    if (isDev) {
        loadingWindow.loadURL('http://localhost:5173/#/loading')
    } else {
        loadingWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
            hash: '#/loading'
        })
    }

    // Load main app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    // Event handlers
    loadingWindow.once('ready-to-show', () => {
        loadingWindow.show()
    })

    mainWindow.webContents.once('did-finish-load', () => {
        console.log('Main window loaded')

        // Tunggu sedikit untuk pastikan Vue mounted
        setTimeout(() => {
            // Tampilkan main window
            mainWindow.show()

            // Tutup loading window dengan animasi fade
            setTimeout(() => {
                loadingWindow.close()
            }, 300)
        }, 500)
    })

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

ipcMain.handle('db:get-users', async () => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
});


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