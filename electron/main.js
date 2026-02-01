// electron/main.js new project
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Module imports
const require = createRequire(import.meta.url);
const { initializeDatabase } = require('./db/connection.cjs');
const { registerTestingHandlers } = require('./db/handler.cjs');

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_DEVELOPMENT = !app.isPackaged;
const LOADING_DELAY_MS = 500;
const WINDOW_CLOSE_DELAY_MS = 300;

// Configuration
const APP_CONFIG = {
    mainWindow: {
        width: 1200,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        backgroundColor: '#f8fafc',
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true
    },
    loadingWindow: {
        width: 400,
        height: 300,
        backgroundColor: '#f8fafc',
        frame: false,
        center: true,
        resizable: false,
        alwaysOnTop: true
    },
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
    }
};

// Global state
let mainWindow = null;
let loadingWindow = null;
let databasePool = null;
let isQuitting = false;

/**
 * Creates the loading window
 * @returns {BrowserWindow} Loading window instance
 */
function createLoadingWindow() {
    const window = new BrowserWindow({
        ...APP_CONFIG.loadingWindow,
        show: false,
        webPreferences: APP_CONFIG.webPreferences
    });

    return window;
}

/**
 * Creates the main application window
 * @returns {BrowserWindow} Main window instance
 */
function createMainWindow() {
    const window = new BrowserWindow({
        ...APP_CONFIG.mainWindow,
        show: false,
        webPreferences: {
            ...APP_CONFIG.webPreferences,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    window.setMinimumSize(APP_CONFIG.mainWindow.minWidth, APP_CONFIG.mainWindow.minHeight);
    return window;
}

/**
 * Loads content into a window based on environment
 * @param {BrowserWindow} window - Window to load content into
 * @param {string} hash - URL hash for routing (optional)
 * @param {boolean} isMainWindow - Whether this is the main window
 */
function loadWindowContent(window, hash = '', isMainWindow = false) {
    if (IS_DEVELOPMENT) {
        const url = `http://localhost:5173${hash ? `/#${hash}` : ''}`;
        window.loadURL(url);

        if (isMainWindow) {
            window.webContents.openDevTools();
        }
    } else {
        const indexPath = path.join(__dirname, '../dist/index.html');
        window.loadFile(indexPath, hash ? { hash: `#${hash}` } : undefined);
    }
}

/**
 * Sets up IPC handlers for app communication
 */
function setupIPCHandlers() {
    ipcMain.on('app-quit-confirmed', async () => {
        if (isQuitting) return;
        isQuitting = true;
        await closeDatabaseConnection();
        confirmQuitApp();
    });

    ipcMain.on('app-quit-cancelled', () => {
        console.log('User cancelled app quit');
        isQuitting = false;
    });
}

/**
 * Initializes database connection and handlers
 */
async function initializeDatabaseConnection() {
    try {
        console.log('Initializing database connection...');
        databasePool = await initializeDatabase();

        if (databasePool) {
            console.log('Registering database handlers...');
            registerTestingHandlers(databasePool);
            console.log('App initialization complete!');
            return true;
        } else {
            console.warn('Database connection failed, but app will continue');
            return false;
        }
    } catch (error) {
        console.error('Failed to initialize database:', error);
        return false;
    }
}

/**
 * Shows main window and closes loading window with transitions
 */
function showMainWindow() {
    mainWindow.show();

    setTimeout(() => {
        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.close();
            loadingWindow = null;
        }
    }, WINDOW_CLOSE_DELAY_MS);
}

/**
 * Sets up window event listeners
 */
function setupWindowEventListeners() {
    loadingWindow.once('ready-to-show', () => {
        loadingWindow.show();
    });

    mainWindow.webContents.once('did-finish-load', () => {
        console.log('Main window loaded');

        setTimeout(() => {
            showMainWindow();
        }, LOADING_DELAY_MS);
    });

    mainWindow.on('close', (event) => {
        if (isQuitting) {
            // Allow close jika sedang dalam proses quit
            return;
        }
        // Prevent default close dan minta konfirmasi
        event.preventDefault();
        mainWindow.webContents.send('app-before-quit');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Handles confirmed app quit
 */
function confirmQuitApp() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        // Set flag sebelum remove listeners
        isQuitting = true;
        mainWindow.removeAllListeners('close');
        mainWindow.destroy();
    }
    // Force quit setelah close
    app.exit(0);
}

/**
 * Creates and sets up application windows
 */
function createApplicationWindows() {
    loadingWindow = createLoadingWindow();
    mainWindow = createMainWindow();

    loadWindowContent(loadingWindow, 'loading');
    loadWindowContent(mainWindow, '', true);

    setupWindowEventListeners();
}

/**
 * Closes database connection pool
 */
async function closeDatabaseConnection() {
    if (databasePool) {
        try {
            await databasePool.end();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database pool:', error);
        }
    }
}

/**
 * Handles application activation (macOS)
 */
function handleAppActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
        createApplicationWindows();
    }
}

/**
 * Handles all windows closed event
 */
async function handleAllWindowsClosed() {
    if (process.platform !== 'darwin') {
        await closeDatabaseConnection();
        app.quit();
    }
}

/**
 * Main application initialization
 */
async function initializeApplication() {
    app.whenReady().then(async () => {
        await initializeDatabaseConnection();
        createApplicationWindows();
        setupIPCHandlers();

        app.on('activate', handleAppActivate);
        app.on('window-all-closed', handleAllWindowsClosed);
    });
}

// Start the application
initializeApplication().catch((error) => {
    console.error('Failed to initialize application:', error);
    process.exit(1);
});

// Export for testing (if needed)
export {
    createLoadingWindow,
    createMainWindow,
    initializeDatabaseConnection
};