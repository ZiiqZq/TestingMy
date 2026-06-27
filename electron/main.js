// electron/main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { initializeDatabase } = require('./db/connection.cjs');
const { registerTestingHandlers } = require('./db/handler.cjs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_DEVELOPMENT = !app.isPackaged;
const LOADING_DELAY_MS = 500;
const WINDOW_CLOSE_DELAY_MS = 300;

const APP_CONFIG = {
    mainWindow: {
        width: 1200,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#f8fafc',
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true,
        show: false
    },
    loadingWindow: {
        width: 400,
        height: 300,
        backgroundColor: '#f8fafc',
        frame: false,
        center: true,
        resizable: false,
        alwaysOnTop: true,
        show: false
    },
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
    }
};

let mainWindow = null;
let loadingWindow = null;
let databasePool = null;
let isQuitting = false;

function createLoadingWindow() {
    const win = new BrowserWindow({
        ...APP_CONFIG.loadingWindow,
        webPreferences: APP_CONFIG.webPreferences
    });
    return win;
}

function createMainWindow() {
    const win = new BrowserWindow({
        ...APP_CONFIG.mainWindow,
        webPreferences: {
            ...APP_CONFIG.webPreferences,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.setMinimumSize(APP_CONFIG.mainWindow.minWidth, APP_CONFIG.mainWindow.minHeight);
    return win;
}

function loadWindowContent(window, hash = '', isMainWindow = false) {
    if (IS_DEVELOPMENT) {
        const url = `http://localhost:5173${hash ? `/#${hash}` : ''}`;
        window.loadURL(url);
        if (isMainWindow) window.webContents.openDevTools();
    } else {
        const indexPath = path.join(__dirname, '../dist/index.html');
        window.loadFile(indexPath, hash ? { hash: `#${hash}` } : undefined);
    }
}

function setupIPCHandlers() {
    ipcMain.on('app-quit-confirmed', async () => {
        if (isQuitting) return;
        isQuitting = true;
        await closeDatabaseConnection();
        confirmQuitApp();
    });

    ipcMain.on('app-quit-cancelled', () => {
        isQuitting = false;
    });
}

async function initializeDatabaseConnection() {
    try {
        databasePool = await initializeDatabase();
        if (databasePool) {
            registerTestingHandlers(databasePool);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Database init failed:', error);
        return false;
    }
}

function setupWindowEventListeners() {
    loadingWindow.once('ready-to-show', () => loadingWindow.show());

    mainWindow.webContents.once('did-finish-load', () => {
        setTimeout(() => {
            mainWindow.show();
            if (loadingWindow && !loadingWindow.isDestroyed()) {
                loadingWindow.close();
                loadingWindow = null;
            }
        }, LOADING_DELAY_MS);
    });

    mainWindow.on('close', (event) => {
        if (isQuitting) return;
        event.preventDefault();
        mainWindow.webContents.send('app-before-quit');
    });

    mainWindow.on('closed', () => { mainWindow = null; });
}

function createApplicationWindows() {
    loadingWindow = createLoadingWindow();
    mainWindow = createMainWindow();
    loadWindowContent(loadingWindow, 'loading');
    loadWindowContent(mainWindow, '', true);
    setupWindowEventListeners();
}

function confirmQuitApp() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.removeAllListeners('close');
        mainWindow.destroy();
    }
    app.exit(0);
}

async function closeDatabaseConnection() {
    if (databasePool) {
        await databasePool.end();
    }
}

async function initializeApplication() {
    await app.whenReady();
    await initializeDatabaseConnection();
    createApplicationWindows();
    setupIPCHandlers();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createApplicationWindows();
    });

    app.on('window-all-closed', async () => {
        if (process.platform !== 'darwin') {
            await closeDatabaseConnection();
            app.quit();
        }
    });
}

initializeApplication().catch(console.error);

export { createLoadingWindow, createMainWindow, initializeDatabaseConnection };