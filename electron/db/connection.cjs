const mysql = require('mysql2/promise');

const DATABASE_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'db_analytical',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

let pool = null;

/**
 * Mendapatkan atau membuat connection pool
 */
async function getPool() {
    if (!pool) {
        try {
            pool = mysql.createPool(DATABASE_CONFIG);

            // Test connection
            const connection = await pool.getConnection();
            console.log('Berhasil terhubung ke MySQL!');
            connection.release();

            // Setup error handling
            pool.on('error', (err) => {
                console.error('Database pool error:', err);
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.log('Connection lost, pool will reconnect automatically');
                }
            });

        } catch (error) {
            console.error('Gagal konek ke database:', error.message);
            console.error('Pastikan MySQL server berjalan dan kredensial benar');
            pool = null;
            throw error;
        }
    }
    return pool;
}

/**
 * Inisialisasi database
 */
async function initializeDatabase() {
    try {
        const dbPool = await getPool();
        return dbPool;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        return null;
    }
}

/**
 * Menutup connection pool
 */
async function closeDatabase() {
    if (pool) {
        try {
            await pool.end();
            pool = null;
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database pool:', error);
        }
    }
}

/**
 * Mendapatkan status koneksi
 */
function getConnectionStatus() {
    return {
        isConnected: !!pool,
        poolStats: pool ? pool.pool : null
    };
}

// Export CommonJS
module.exports = {
    getPool,
    initializeDatabase,
    closeDatabase,
    getConnectionStatus
};