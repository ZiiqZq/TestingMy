// handler.cjs
const { ipcMain } = require('electron');
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

function registerTestingHandlers(pool) {

    // ================================================================
    // 1. USER HANDLERS
    // ================================================================
    ipcMain.handle('db:get-users', async () => {
        try {
            const [rows] = await pool.query(
                'SELECT id, username, full_name, role, is_active FROM users ORDER BY username'
            );
            return { success: true, data: rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });


    // ================================================================
    // 2. PRODUCT HANDLERS
    // ================================================================
    ipcMain.handle('db:get-products', async () => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM products WHERE is_active = 1 ORDER BY product_name'
            );
            return { success: true, data: rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:get-product-test-types', async (event, productId) => {
        try {
            const [rows] = await pool.query(`
                SELECT tt.id, tt.name, pts.sequence_order, pts.is_required
                FROM product_test_sequence pts
                JOIN test_types tt ON pts.test_type_id = tt.id
                WHERE pts.product_id = ?
                ORDER BY pts.sequence_order
            `, [productId]);
            return { success: true, data: rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });


    // ================================================================
    // 3. TEST PARAMETERS HANDLERS
    // ================================================================
    ipcMain.handle('db:get-test-parameters', async (event, { productId, testTypeId }) => {
        try {
            const [rows] = await pool.query(`
                SELECT * FROM product_test_parameters
                WHERE product_id = ? AND test_type_id = ?
                ORDER BY display_order
            `, [productId, testTypeId]);
            return { success: true, data: rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });


    // ================================================================
    // 4. TEMPLATES HANDLERS
    // ================================================================
    ipcMain.handle('db:get-templates-by-product', async (event, productId) => {
        try {
            const [rows] = await pool.query(`
                SELECT t.*, tt.name as test_type_name, tt.sequence_order
                FROM templates t
                JOIN test_types tt ON t.test_type_id = tt.id
                WHERE t.product_id = ? AND t.is_active = 1
                ORDER BY tt.sequence_order
            `, [productId]);

            const templates = rows.map(row => ({
                ...row,
                custom_columns: typeof row.custom_columns === 'string'
                    ? JSON.parse(row.custom_columns)
                    : row.custom_columns
            }));

            return { success: true, data: templates };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });


    // ================================================================
    // 5. TEST ENTRIES HANDLERS
    // ================================================================
    ipcMain.handle('db:submit-test-entries', async (event, submitData) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const operatorId = await getOrCreateOperator(conn, submitData.operatorName);

            const insertedIds = [];
            for (const entry of submitData.entries) {
                const [result] = await conn.query(
                    `INSERT INTO test_entries (
                        template_id, product_id, test_type_id, operator_id,
                        test_date, po_number, original_serial_number, display_serial_number,
                        is_retest, retest_iteration, test_results, status,
                        can_proceed_to_next, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, NOW())`,
                    [
                        submitData.templateId,
                        submitData.productId,
                        submitData.testTypeId,
                        operatorId,
                        submitData.testDate,
                        submitData.poNumber,
                        entry.serialNumber,
                        entry.displaySerialNumber,
                        JSON.stringify(entry.testResults),
                        entry.status,
                        entry.status === 'Pass' ? 1 : 0
                    ]
                );
                insertedIds.push(result.insertId);
            }

            await conn.commit();
            return {
                success: true,
                insertedCount: insertedIds.length,
                message: `✅ Berhasil menyimpan ${insertedIds.length} data testing`
            };
        } catch (error) {
            await conn.rollback();
            return { success: false, error: error.message };
        } finally {
            conn.release();
        }
    });


    // ================================================================
    // 6. EXCEL VALIDATION
    // ================================================================
    ipcMain.handle('db:validate-excel-import', async (event, { productId, testTypeId, excelHeaders }) => {
        try {
            const [templates] = await pool.query(`
                SELECT custom_columns FROM templates
                WHERE product_id = ? AND test_type_id = ? AND is_active = 1
            `, [productId, testTypeId]);

            if (templates.length === 0) {
                return { success: false, error: '❌ Template tidak ditemukan' };
            }

            const customColumns = parseJSON(templates[0].custom_columns);
            const templateColumns = extractColumnNames(customColumns.columns);

            const excelHeaderNames = excelHeaders
                .map(h => h?.toString().toLowerCase().trim() || '')
                .filter(Boolean);

            const missingColumns = templateColumns
                .filter(tc => !excelHeaderNames.some(eh => eh.includes(tc.name)))
                .map(tc => tc.name);

            const unknownColumns = excelHeaderNames
                .filter(eh => !templateColumns.some(tc => eh.includes(tc.name)));

            const isValid = missingColumns.length === 0;

            return {
                success: true,
                isValid,
                missingColumns,
                unknownColumns,
                templateColumns,
                message: isValid ? '✅ Template valid' : '❌ Ada kolom yang tidak sesuai'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });


    // ================================================================
    // 7. EXCEL IMPORT
    // ================================================================
    ipcMain.handle('db:import-excel-data', async (event, {
        templateId, productId, testTypeId, operatorName,
        testDate, poNumber, excelData, mapping,
        sourceFile, sourceSheet
    }) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const operatorId = await getOrCreateOperator(conn, operatorName);

            const insertedIds = [];
            for (const row of excelData) {
                // Map nilai ke template column ID
                const testResults = {};
                Object.keys(row.values || {}).forEach(headerName => {
                    const templateColId = mapping[headerName];
                    if (templateColId) {
                        testResults[templateColId] = row.values[headerName];
                    }
                });

                // [FIX W4] Status dari data Excel, BUKAN hardcode
                const status    = normalizeStatus(row.status);
                const canProceed = status === 'Pass' ? 1 : 0;

                const [result] = await conn.query(
                    `INSERT INTO test_entries (
                        template_id, product_id, test_type_id, operator_id,
                        test_date, po_number, original_serial_number, display_serial_number,
                        is_retest, retest_iteration, test_results, status,
                        can_proceed_to_next, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, NOW())`,
                    [
                        templateId, productId, testTypeId, operatorId,
                        testDate, poNumber,
                        row.serialNumber, row.serialNumber,
                        JSON.stringify(testResults),
                        status, canProceed
                    ]
                );
                insertedIds.push(result.insertId);
            }

            await conn.commit();

            const passCount = excelData.filter(r => normalizeStatus(r.status) === 'Pass').length;
            const failCount = excelData.length - passCount;

            return {
                success: true,
                insertedCount: insertedIds.length,
                passCount,
                failCount,
                message: `✅ Berhasil import ${insertedIds.length} data (Pass: ${passCount}, Fail: ${failCount})`
            };
        } catch (error) {
            await conn.rollback();
            return { success: false, error: error.message };
        } finally {
            conn.release();
        }
    });


    // ================================================================
    // 8. EXCEL CONVERT — tidak butuh DB
    // ================================================================

    /**
     * Konversi dasar — key = huruf kolom (A, B, C, ...)
     * Tidak ada filtering, semua baris dikembalikan apa adanya.
     */
    ipcMain.handle('excel:convert-to-json', async (event, { filePath, buffer, options = {} }) => {
        try {
            const source = resolveSource(buffer, filePath);
            const result = excelToJson({ source, ...options });
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ excel:convert-to-json:', error.message);
            return { success: false, error: error.message };
        }
    });

    /**
     * Konversi dengan skip N baris + key = nama header kolom.
     * Baris USL/LSL/kosong MASIH ikut — filter manual jika perlu.
     */
    ipcMain.handle('excel:convert-with-header', async (event, { filePath, buffer, headerRow = 1 }) => {
        try {
            const source = resolveSource(buffer, filePath);
            const result = excelToJson({
                source,
                header:      { rows: headerRow },
                columnToKey: { '*': '{{columnHeader}}' }
            });
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ excel:convert-with-header:', error.message);
            return { success: false, error: error.message };
        }
    });

    /**
     * Deteksi header otomatis + filter baris tidak valid.
     * 
     * Alur:
     *   1. Baca 30 baris pertama → cari baris header (scoring keyword)
     *   2. Konversi ulang dengan skip = headerRowIndex, key = nama kolom
     *   3. Filter: buang baris judul, USL, LSL, dan kosong
     *
     * Return: { headers, headerRowIndex, totalRows, preview, allData }
     */
    ipcMain.handle('excel:detect-header', async (event, { filePath, buffer, sheetName }) => {
        try {
            const source = resolveSource(buffer, filePath);

            // --- STEP 1: Baca preview untuk cari posisi header ---
            const preview = excelToJson({
                source,
                header: { rows: 0 },
                range:  'A1:Z30'
            });

            const targetSheet = sheetName || Object.keys(preview)[0];
            const previewRows = preview[targetSheet] || [];

            // --- STEP 2: Scoring → temukan baris header ---
            const headerRowIndex = findHeaderRow(previewRows);
            console.log(`📌 Header ditemukan di row ${headerRowIndex + 1}`);

            // --- STEP 3: Konversi ulang semua baris dengan nama kolom sebagai key ---
            const full = excelToJson({
                source,
                header:      { rows: headerRowIndex },
                columnToKey: { '*': '{{columnHeader}}' }
            });

            const allSheetData = full[targetSheet] || [];

            // --- STEP 4: Filter baris tidak valid ---
            const validRows = filterExcelRows(allSheetData);

            const headers = validRows.length > 0 ? Object.keys(validRows[0]) : [];

            console.log(`✅ Data bersih: ${validRows.length} baris dari ${allSheetData.length} total`);

            return {
                success: true,
                data: {
                    sheetName:      targetSheet,
                    headers,
                    headerRowIndex: headerRowIndex + 1,  // 1-based untuk display
                    totalRows:      validRows.length,
                    preview:        validRows.slice(0, 5),
                    allData:        validRows
                }
            };
        } catch (error) {
            console.error('❌ excel:detect-header:', error.message);
            return { success: false, error: error.message };
        }
    });

    /**
     * Ambil daftar nama sheet saja (tanpa load data).
     */
    ipcMain.handle('excel:get-sheets', async (event, { filePath, buffer }) => {
        try {
            const source = resolveSource(buffer, filePath);
            const result = excelToJson({ source, header: { rows: 0 }, range: 'A1:A1' });
            return { success: true, data: Object.keys(result) };
        } catch (error) {
            console.error('❌ excel:get-sheets:', error.message);
            return { success: false, error: error.message };
        }
    });
}


// ================================================================
// HELPERS — dipakai bersama oleh semua handler di atas
// ================================================================

/**
 * Resolve sumber data: Uint8Array dari renderer → Node Buffer,
 * atau baca langsung dari path file.
 */
function resolveSource(buffer, filePath) {
    if (buffer)   return Buffer.from(buffer);
    if (filePath) return fs.readFileSync(filePath);
    throw new Error('Butuh buffer atau filePath');
}

/**
 * Filter baris hasil convert-excel-to-json.
 * Membuang: baris judul, USL, LSL, hampir kosong, tanpa serial number.
 *
 * @param {Array}  rows         Array row dari satu sheet
 * @param {string} serialKey    Nama key kolom Serial Number
 *                              (default 'F' jika pakai key huruf,
 *                               atau 'Serial Number' jika pakai columnHeader)
 * @param {number} minFilled    Minimal kolom terisi agar dianggap baris valid
 */
function filterExcelRows(rows, serialKey = null, minFilled = 3) {
    // Deteksi serialKey otomatis dari nama header yang mungkin ada
    const serialCandidates = ['Serial Number', 'serial_number', 'F'];

    return rows.filter(row => {
        const values = Object.values(row);

        // 1. Buang baris yang hampir kosong
        const filledCount = values.filter(v =>
            v !== null && v !== undefined && v.toString().trim() !== ''
        ).length;
        if (filledCount < minFilled) return false;

        // 2. Ambil nilai kolom pertama yang tidak null (biasanya kolom B = "No")
        const keys    = Object.keys(row);
        const firstKey = keys.find(k => row[k] !== null && row[k] !== undefined && row[k].toString().trim() !== '');
        const firstVal = firstKey ? row[firstKey]?.toString().trim() : '';

        // 3. Buang baris USL dan LSL
        if (firstVal.toUpperCase() === 'USL' || firstVal.toUpperCase() === 'LSL') return false;

        // 4. Buang baris header/judul
        //    Ciri: nilai pertama adalah teks panjang (bukan angka, bukan formula)
        const isTextHeader = isNaN(Number(firstVal)) &&
                             firstVal !== '' &&
                             !/^\d/.test(firstVal) &&           // tidak mulai dengan angka
                             !/^=/.test(firstVal);              // bukan formula excel
        if (isTextHeader) {
            // Kecualikan jika ternyata ini formula IF (=IF...) yang sudah dievaluasi
            // Beberapa library mengembalikan string formula jika tidak bisa dievaluasi
            return false;
        }

        // 5. Buang baris tanpa Serial Number
        const resolvedSerialKey = serialKey ||
            serialCandidates.find(k => row[k] !== undefined) ||
            null;

        if (resolvedSerialKey) {
            const serial = row[resolvedSerialKey];
            if (!serial || serial.toString().trim() === '') return false;
        }

        return true; // ✅ lolos semua cek
    });
}

/**
 * Cari index baris header dengan scoring keyword.
 * Dipanggil sekali dari excel:detect-header.
 * [FIX W2] Terpusat di sini — tidak duplikat di Vue/composable.
 */
function findHeaderRow(rows) {
    const keywords = [
        /^no$/i, /serial/i, /operator/i, /date/i, /po/i,
        /status/i, /remarks/i, /charge/i, /hold/i,
        /input/i, /output/i, /voltage/i, /current/i,
        /anode/i, /t1\b/i, /t2\b/i, /sparker/i, /vref/i
    ];

    let bestIndex = 0;
    let maxScore  = 0;

    rows.forEach((row, i) => {
        if (!row) return;
        const vals    = Object.values(row).filter(v => v != null);
        const rowText = vals.join(' ');
        let score = 0;

        keywords.forEach(kw => { if (kw.test(rowText)) score += 10; });
        score += vals.filter(v => v?.toString().trim() !== '').length; // lebih banyak kolom = skor lebih tinggi
        if (vals.every(v => typeof v === 'string' || isNaN(Number(v)))) score += 5; // semua string = ciri header

        if (score > maxScore) { maxScore = score; bestIndex = i; }
    });

    return bestIndex;
}

/**
 * Normalisasi status dari Excel ke format DB (Pass / Fail).
 * [FIX W4] Dipanggil saat import — tidak hardcode 'Pass' lagi.
 */
function normalizeStatus(rawStatus) {
    if (!rawStatus) return 'Fail';
    const val = rawStatus.toString().toUpperCase().trim();
    if (val === 'PASS' || val === 'YES' || val === 'P') return 'Pass';
    return 'Fail';
}

/**
 * Ambil atau buat operator berdasarkan nama.
 * Dipakai bersama oleh submit-test-entries dan import-excel-data.
 */
async function getOrCreateOperator(conn, operatorName) {
    const [existing] = await conn.query(
        'SELECT id FROM users WHERE username = ? OR full_name = ?',
        [operatorName, operatorName]
    );
    if (existing.length > 0) return existing[0].id;

    const [result] = await conn.query(
        `INSERT INTO users (username, password, full_name, role, is_active)
         VALUES (?, 'temp123', ?, 'operator', 1)`,
        [operatorName, operatorName]
    );
    return result.insertId;
}

/**
 * Parse JSON yang mungkin sudah berupa object atau masih string.
 */
function parseJSON(value) {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
}

/**
 * Rekursif ambil semua nama kolom dari struktur template.
 */
function extractColumnNames(columns) {
    const result = [];
    if (!Array.isArray(columns)) return result;
    columns.forEach(col => {
        if (col.name) result.push({ name: col.name.toLowerCase().trim(), id: col.id });
        if (Array.isArray(col.sub)) result.push(...extractColumnNames(col.sub));
    });
    return result;
}


module.exports = { registerTestingHandlers };
