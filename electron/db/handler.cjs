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
                'SELECT id, badge_number, username, role, created_at FROM users ORDER BY username'
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
                message: `Berhasil menyimpan ${insertedIds.length} data testing`
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
                message: isValid ? 'Template valid' : ' Ada kolom yang tidak sesuai'
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
            const raw = excelToJson({ source, ...options });
            // Sanitize Date objects → string YYYY-MM-DD (lokal, bukan UTC)
            const result = {};
            for (const [sheet, rows] of Object.entries(raw)) {
                result[sheet] = Array.isArray(rows) ? rows.map(sanitizeRow) : rows;
            }
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
            const raw = excelToJson({
                source,
                header:      { rows: headerRow },
                columnToKey: { '*': '{{columnHeader}}' }
            });
            // Sanitize: konversi Date object ke string YYYY-MM-DD (lokal)
            const result = {};
            for (const [sheet, rows] of Object.entries(raw)) {
                result[sheet] = rows.map(sanitizeRow);
            }
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
            const validRows = filterExcelRows(allSheetData)
                .map(sanitizeRow);   // ← konversi Date object ke string lokal

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

    // ================================================================
    // 9. ADD PRODUCT HANDLERS (untuk LeftAddProduct.vue)
    // ================================================================

    ipcMain.handle('db:get-test-types', async () => {
        try {
            const [rows] = await pool.query(
                'SELECT id, name FROM test_types ORDER BY name'
            );
            return { success: true, data: rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:add-custom-test-type', async (event, name) => {
        try {
            // Cek apakah sudah ada
            const [existing] = await pool.query(
                'SELECT id FROM test_types WHERE LOWER(name) = LOWER(?)', [name]
            );
            if (existing.length > 0) {
                return { success: true, id: existing[0].id };
            }
            const [result] = await pool.query(
                'INSERT INTO test_types (name) VALUES (?)', [name]
            );
            return { success: true, id: result.insertId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

   ipcMain.handle('db:save-product-with-sequence', async (event, {
  productName, seriesNumber, seriesName, testSequence, testParameters, productId
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let finalProductId = productId;
    if (productId) {
      // update produk
      await conn.query(
        `UPDATE products SET product_name = ?, series_number = ?, series = ? WHERE id = ?`,
        [productName, seriesNumber, seriesName, productId]
      );
      // hapus sequence & parameter lama
      await conn.query('DELETE FROM product_test_sequence WHERE product_id = ?', [productId]);
      await conn.query('DELETE FROM product_test_parameters WHERE product_id = ?', [productId]);
    } else {
      // insert produk baru
      const [result] = await conn.query(
        `INSERT INTO products (product_name, series_number, series, is_active) VALUES (?, ?, ?, 1)`,
        [productName, seriesNumber, seriesName]
      );
      finalProductId = result.insertId;
    }

    // Insert sequence
    for (const seq of testSequence) {
      await conn.query(
        `INSERT INTO product_test_sequence (product_id, test_type_id, sequence_order) VALUES (?, ?, ?)`,
        [finalProductId, seq.testTypeId, seq.sequenceOrder]
      );
    }

    // Insert parameters
    for (const [testTypeId, params] of Object.entries(testParameters)) {
      for (let i = 0; i < params.length; i++) {
        await conn.query(
          `INSERT INTO product_test_parameters (product_id, test_type_id, parameter_name, parameter_value, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [finalProductId, parseInt(testTypeId), params[i].name, params[i].value, i + 1]
        );
      }
    }

    await conn.commit();
    return { success: true, productId: finalProductId };
  } catch (error) {
    await conn.rollback();
    return { success: false, error: error.message };
  } finally {
    conn.release();
  }
});

    // ================================================================
    // 10. SAVE TEMPLATE HANDLER (untuk AddProduct.vue / Generate)
    // ================================================================

    ipcMain.handle('db:save-template', async (event, {
        productId, testTypeId, templateName, columns
    }) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Nonaktifkan template lama untuk product + test type yang sama
            await conn.query(
                `UPDATE templates SET is_active = 0
                WHERE product_id = ? AND test_type_id = ?`,
                [productId, testTypeId]
            );

            const customColumns = { columns };

            // INSERT dengan kolom yang benar: template_name (bukan name)
            const [result] = await conn.query(
                `INSERT INTO templates
                (product_id, test_type_id, template_name, custom_columns, is_active, created_at)
                VALUES (?, ?, ?, ?, 1, NOW())`,
                [productId, testTypeId, templateName, JSON.stringify(customColumns)]
            );

            await conn.commit();
            return { success: true, templateId: result.insertId };
        } catch (error) {
            await conn.rollback();
            return { success: false, error: error.message };
        } finally {
            conn.release();
        }
    });

    ipcMain.handle('excel:get-sheets', async (event, { filePath, buffer }) => {
        try {
            const source = resolveSource(buffer, filePath);
            const result = excelToJson({ source, header: { rows: 0 }, range: 'A1:A1' });
            return { success: true, data: Object.keys(result) };
        } catch (error) {
            console.error('excel:get-sheets:', error.message);
            return { success: false, error: error.message };
        }
    });

    // ================================================================
// 11. GET TEST SUMMARY (ringkasan per grup)
// ================================================================
ipcMain.handle('db:get-test-summary', async (event, filters = {}) => {
    try {
        let query = `
            SELECT 
                te.product_id,
                p.product_name,
                p.series,
                p.series_number,
                te.test_type_id,
                tt.name as test_type_name,
                te.test_date,
                te.operator_id,
                u.username as operator_name,
                te.po_number,
                COUNT(*) as total_units,
                SUM(CASE WHEN te.status = 'Pass' THEN 1 ELSE 0 END) as total_pass,
                SUM(CASE WHEN te.status = 'Fail' THEN 1 ELSE 0 END) as total_fail,
                MIN(te.original_serial_number) as min_serial,
                MAX(te.original_serial_number) as max_serial,
                GROUP_CONCAT(DISTINCT te.original_serial_number ORDER BY te.original_serial_number) as all_serials
            FROM test_entries te
            JOIN products p ON te.product_id = p.id
            JOIN test_types tt ON te.test_type_id = tt.id
            JOIN users u ON te.operator_id = u.id
            WHERE 1=1
        `
        const values = []

        if (filters.productId) {
            query += ` AND te.product_id = ?`
            values.push(filters.productId)
        }
        if (filters.testTypeId) {
            query += ` AND te.test_type_id = ?`
            values.push(filters.testTypeId)
        }
        if (filters.operatorId) {
            query += ` AND te.operator_id = ?`
            values.push(filters.operatorId)
        }
        if (filters.poNumber) {
            query += ` AND te.po_number LIKE ?`
            values.push(`%${filters.poNumber}%`)
        }
        if (filters.startDate) {
            query += ` AND te.test_date >= ?`
            values.push(filters.startDate)
        }
        if (filters.endDate) {
            query += ` AND te.test_date <= ?`
            values.push(filters.endDate)
        }
        if (filters.status) {
            query += ` AND te.status = ?`
            values.push(filters.status)
        }

        query += ` GROUP BY te.product_id, te.test_type_id, te.test_date, te.operator_id, te.po_number`
        query += ` ORDER BY te.test_date ${filters.sortOrder === 'asc' ? 'ASC' : 'DESC'}`

        const [rows] = await pool.query(query, values)
        console.log(`Query menghasilkan ${rows.length} baris`)
        return { success: true, data: rows }
    } catch (error) {
        console.error('❌ db:get-test-summary error:', error)
        return { success: false, error: error.message }
    }
})

// ================================================================
// 12. GET TEST DETAIL (berdasarkan PO Number, tanpa tanggal & operator)
// ================================================================
ipcMain.handle('db:get-test-detail', async (event, { productId, testTypeId, poNumber }) => {
    try {
        const query = `
            SELECT 
                te.id,
                te.original_serial_number,
                te.display_serial_number,
                te.test_results,
                te.status,
                te.keterangan as remarks,
                te.test_date,
                te.po_number,
                u.username as operator_name
            FROM test_entries te
            JOIN users u ON te.operator_id = u.id
            WHERE te.product_id = ? 
                AND te.test_type_id = ? 
                AND te.po_number = ?
            ORDER BY te.original_serial_number
        `
        const [rows] = await pool.query(query, [productId, testTypeId, poNumber])
        return { success: true, data: rows }
    } catch (error) {
        console.error('❌ db:get-test-detail error:', error)
        return { success: false, error: error.message }
    }
})

// ================================================================
// 13. DELETE TEST GROUP
// ================================================================
ipcMain.handle('db:delete-test-group', async (event, { productId, testTypeId, testDate, operatorId, poNumber }) => {
    const conn = await pool.getConnection()
    try {
        await conn.beginTransaction()
        const [result] = await conn.query(
            `DELETE FROM test_entries 
             WHERE product_id = ? 
               AND test_type_id = ? 
               AND test_date = ? 
               AND operator_id = ? 
               AND po_number = ?`,
            [productId, testTypeId, testDate, operatorId, poNumber]
        )
        await conn.commit()
        return { success: true, deletedCount: result.affectedRows }
    } catch (error) {
        await conn.rollback()
        console.error('❌ db:delete-test-group error:', error)
        return { success: false, error: error.message }
    } finally {
        conn.release()
    }
})

// ================================================================
// 14. GET YIELD DATA (untuk chart)
// ================================================================
ipcMain.handle('db:get-yield-data', async (event, filters = {}) => {
    try {
        let query = `
            SELECT 
                DATE(te.test_date) as test_date,
                te.product_id,
                ANY_VALUE(p.product_name) as product_name,
                te.test_type_id,
                ANY_VALUE(tt.name) as test_type_name,
                COUNT(*) as total,
                SUM(CASE WHEN te.status = 'Pass' THEN 1 ELSE 0 END) as pass,
                SUM(CASE WHEN te.status = 'Fail' THEN 1 ELSE 0 END) as fail,
                SUM(CASE WHEN te.is_retest = 1 THEN 1 ELSE 0 END) as retest_count,
                ROUND((SUM(CASE WHEN te.status = 'Pass' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as yield
            FROM test_entries te
            JOIN products p ON te.product_id = p.id
            JOIN test_types tt ON te.test_type_id = tt.id
            WHERE 1=1
        `
        const values = []
        if (filters.productId) { query += ` AND te.product_id = ?`; values.push(filters.productId) }
        if (filters.testTypeId) { query += ` AND te.test_type_id = ?`; values.push(filters.testTypeId) }
        if (filters.startDate) { query += ` AND te.test_date >= ?`; values.push(filters.startDate) }
        if (filters.endDate) { query += ` AND te.test_date <= ?`; values.push(filters.endDate) }
        
        // Perbaikan: ORDER BY menggunakan DATE(te.test_date) agar sesuai dengan GROUP BY
        query += ` GROUP BY DATE(te.test_date), te.product_id, te.test_type_id ORDER BY DATE(te.test_date) ASC`
        
        const [rows] = await pool.query(query, values)
        return { success: true, data: rows }
    } catch (error) {
        console.error('❌ db:get-yield-data error:', error)
        return { success: false, error: error.message }
    }
})

// ================================================================
// 15. GET PARETO DATA (failure modes)
// ================================================================
ipcMain.handle('db:get-pareto-data', async (event, filters = {}) => {
    try {
        let query = `
            SELECT te.id, te.product_id, p.product_name, te.po_number,
                   te.operator_id, u.username as operator_name,
                   te.test_results, te.status
            FROM test_entries te
            JOIN products p ON te.product_id = p.id
            JOIN users u ON te.operator_id = u.id
            WHERE te.status = 'Fail'
        `
        const values = []
        if (filters.productId) { query += ` AND te.product_id = ?`; values.push(filters.productId) }
        if (filters.testTypeId) { query += ` AND te.test_type_id = ?`; values.push(filters.testTypeId) }
        if (filters.startDate) { query += ` AND te.test_date >= ?`; values.push(filters.startDate) }
        if (filters.endDate) { query += ` AND te.test_date <= ?`; values.push(filters.endDate) }

        const [rows] = await pool.query(query, values)
        return { success: true, data: rows }
    } catch (error) {
        console.error('❌ db:get-pareto-data error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('db:get-kpi-summary', async (event, filters = {}) => {
    try {
        let query = `
            SELECT 
                COUNT(*) as total_tested,
                SUM(CASE WHEN te.status = 'Pass' THEN 1 ELSE 0 END) as total_pass,
                SUM(CASE WHEN te.status = 'Fail' THEN 1 ELSE 0 END) as total_fail,
                SUM(CASE WHEN te.is_retest = 1 THEN 1 ELSE 0 END) as total_retest,
                SUM(CASE WHEN tt.name = 'First Test' AND te.status = 'Pass' THEN 1 ELSE 0 END) as first_test_pass,
                SUM(CASE WHEN tt.name = 'First Test' AND te.status = 'Fail' THEN 1 ELSE 0 END) as first_test_fail,
                SUM(CASE WHEN tt.name = 'First Test' THEN 1 ELSE 0 END) as first_test_total,
                SUM(CASE WHEN tt.name = 'Final Test' AND te.status = 'Pass' THEN 1 ELSE 0 END) as final_test_pass,
                SUM(CASE WHEN tt.name = 'Final Test' AND te.status = 'Fail' THEN 1 ELSE 0 END) as final_test_fail,
                SUM(CASE WHEN tt.name = 'Final Test' THEN 1 ELSE 0 END) as final_test_total
            FROM test_entries te
            JOIN test_types tt ON te.test_type_id = tt.id
            WHERE 1=1
        `
        const values = []
        if (filters.productId)  { query += ` AND te.product_id = ?`;   values.push(filters.productId) }
        if (filters.testTypeId) { query += ` AND te.test_type_id = ?`; values.push(filters.testTypeId) }
        if (filters.startDate)  { query += ` AND te.test_date >= ?`;   values.push(filters.startDate) }
        if (filters.endDate)    { query += ` AND te.test_date <= ?`;   values.push(filters.endDate) }

        const [rows] = await pool.query(query, values)
        return { success: true, data: rows[0] }
    } catch (error) {
        console.error('❌ db:get-kpi-summary error:', error)
        return { success: false, error: error.message }
    }
})


ipcMain.handle('pdf:export', async (event, { form, entries, headers, testInfo }) => {
    try {
        const { dialog, BrowserWindow } = require('electron')
        const fs = require('fs')

        // Show native save dialog
        const win         = BrowserWindow.getFocusedWindow()
        const defaultName = `TestData_${(form.poNumber || 'export').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`

        const { canceled, filePath } = await dialog.showSaveDialog(win, {
            title:       'Save Test Data Sheet',
            defaultPath: defaultName,
            filters:     [{ name: 'PDF Files', extensions: ['pdf'] }]
        })

        if (canceled || !filePath) {
            return { success: false, error: 'Cancelled' }
        }

        // Load puppeteer
        let puppeteer
        try {
            puppeteer = require('puppeteer')
        } catch {
            return { success: false, error: 'Puppeteer not installed. Run: npm install puppeteer' }
        }

        const html    = buildPdfHtml({ form, entries, headers, testInfo })
        const browser = await puppeteer.launch({
            headless: 'new',
            args:     ['--no-sandbox', '--disable-setuid-sandbox']
        })
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })

        const pdfBuffer = await page.pdf({
            format:          'A4',
            landscape:       true,
            printBackground: true,
            margin:          { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' }
        })

        await browser.close()
        fs.writeFileSync(filePath, pdfBuffer)

        return { success: true, filePath }

    } catch (err) {
        console.error('❌ pdf:export error:', err)
        return { success: false, error: err.message }
    }
})

// ================================================================
// LOGIN (hanya badge number)
// ================================================================
ipcMain.handle('db:login', async (event, { badgeNumber }) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, badge_number, username, role, created_at 
             FROM users 
             WHERE badge_number = ?`,
            [badgeNumber]
        );
        if (rows.length === 0) {
            return { success: false, message: 'Badge number tidak ditemukan' };
        }
        return { success: true, user: rows[0] };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// ================================================================
// MANAJEMEN USER (hanya untuk super_admin)
// ================================================================
ipcMain.handle('db:get-all-users', async (event, requesterRole) => {
    if (requesterRole !== 'super_admin') return { success: false, message: 'Akses ditolak' };
    try {
        const [rows] = await pool.query(
            `SELECT id, badge_number, username, role, created_at 
             FROM users ORDER BY created_at DESC`
        );
        return { success: true, data: rows };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('db:create-user', async (event, { badgeNumber, username, role, requesterRole }) => {
    if (requesterRole !== 'super_admin') return { success: false, message: 'Akses ditolak' };
    try {
        const [existing] = await pool.query(
            `SELECT id FROM users WHERE badge_number = ? OR username = ?`,
            [badgeNumber, username]
        );
        if (existing.length) return { success: false, message: 'Badge number atau username sudah terdaftar' };
        
        await pool.query(
            `INSERT INTO users (badge_number, username, role) VALUES (?, ?, ?)`,
            [badgeNumber, username, role]
        );
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('db:update-user', async (event, { userId, username, badgeNumber, role, requesterRole }) => {
    if (requesterRole !== 'super_admin') return { success: false, message: 'Access denied' };
    try {
        // Check duplicate badge_number or username for other users
        const [existing] = await pool.query(
            `SELECT id FROM users WHERE (badge_number = ? OR username = ?) AND id != ?`,
            [badgeNumber, username, userId]
        );
        if (existing.length) {
            return { success: false, message: 'Badge number or username already used by another user' };
        }
        await pool.query(
            `UPDATE users SET username = ?, badge_number = ?, role = ? WHERE id = ?`,
            [username, badgeNumber, role, userId]
        );
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('db:delete-user', async (event, { userId, requesterRole }) => {
    if (requesterRole !== 'super_admin') {
        return { success: false, message: 'Access denied' };
    }
    try {
        // Cek apakah user memiliki test entries
        const [check] = await pool.query(
            `SELECT COUNT(*) as count FROM test_entries WHERE operator_id = ?`,
            [userId]
        );
        if (check[0].count > 0) {
            return { 
                success: false, 
                message: `Cannot delete user because they have ${check[0].count} test record(s). Delete the test records first or reassign them.` 
            };
        }
        const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
        if (result.affectedRows === 0) {
            return { success: false, message: 'User not found' };
        }
        return { success: true };
    } catch (error) {
        console.error('Delete user error:', error);
        return { success: false, message: error.message };
    }
});
}


// ================================================================
// HELPERS — dipakai bersama oleh semua handler di atas
// ================================================================

function buildPdfHtml({ form, entries, headers, testInfo }) {

    function escHtml(str) {
        if (!str) return ''
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }

    const fmt = (d) => {
        if (!d) return '—'
        const dt = new Date(d)
        return isNaN(dt.getTime())
            ? d
            : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const parentHeaders = headers.filter(h => !h.isSub)
    const subHeaders    = headers.filter(h =>  h.isSub)
    const hasSubHeaders = subHeaders.length > 0

    const thStyle = (extra = '') =>
        `background:#2d3748;color:#fff;padding:7px 6px;font-size:9px;font-weight:700;` +
        `text-align:center;border:1px solid #555;text-transform:uppercase;` +
        `letter-spacing:0.4px;white-space:normal;word-break:break-word;` +
        `max-width:110px;vertical-align:middle;${extra}`

    const htmlParentHeaders = parentHeaders.map(h => `
        <th colspan="${h.colspan || 1}"
            rowspan="${hasSubHeaders ? (h.rowspan || 1) : 1}"
            style="${thStyle()}">
            ${escHtml(h.name)}
        </th>`).join('')

    const htmlSubHeaders = hasSubHeaders
        ? subHeaders.map(h => `
            <th style="background:#333;color:#fff;padding:5px 6px;font-size:8px;
                       font-weight:600;text-align:center;border:1px solid #555;
                       white-space:normal;word-break:break-word;max-width:110px;
                       vertical-align:middle;">
                ${escHtml(h.name)}
            </th>`).join('')
        : ''

    const htmlRows = entries.map((row, idx) => {
    let results = row.test_results
    if (typeof results === 'string') {
        try { results = JSON.parse(results) } catch { results = [] }
    }
    if (!Array.isArray(results)) results = []

    // 🔹 Semua sel parameter -> latar putih, teks hitam
    const htmlCells = results.map(cell => {
        const val = cell.value !== undefined && cell.value !== null ? String(cell.value) : ''
        return `<td style="padding:5px 4px;font-size:9px;text-align:center;
                           border:1px solid #ddd;background:#fff;color:#111;
                           vertical-align:middle;">
                    ${escHtml(val)}
                </td>`
    }).join('')

    // 🔹 Status -> latar putih, teks hijau/merah
    const statusColor = row.status === 'Pass' ? '#166534' : '#991b1b'
    const statusBg    = '#fff'  // putih
    const rowBg       = idx % 2 === 0 ? '#fff' : '#fafafa'  // tetap bedakan baris tipis

    return `<tr style="background:${rowBg};">
        <td style="padding:5px 4px;font-size:9px;text-align:center;border:1px solid #ddd;
                   background:#f5f5f5;color:#555;font-weight:600;vertical-align:middle;">
            ${idx + 1}
        </td>
        <td style="padding:5px 6px;font-size:9px;text-align:center;border:1px solid #ddd;
                   background:#f5f5f5;color:#222;font-weight:600;white-space:nowrap;vertical-align:middle;">
            ${escHtml(row.original_serial_number || '')}
        </td>
        ${htmlCells}
        <td style="padding:4px;text-align:center;border:1px solid #ddd;vertical-align:middle;
                   background:#fff;">
            <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:8px;
                         font-weight:700;background:${statusBg};color:${statusColor};
                         border:1px solid ${statusColor}40;">
                ${escHtml(row.status || 'Fail')}
            </span>
        </td>
        <td style="padding:5px 4px;font-size:9px;text-align:center;
                   border:1px solid #ddd;background:#fff;color:#555;vertical-align:middle;">
            ${escHtml(row.remarks || '')}
        </td>
    </tr>`
}).join('')

    const rowspan2 = hasSubHeaders ? 2 : 1

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Test Data Sheet — ${escHtml(form.poNumber)}</title>
<style>
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11px; color: #111; background: #fff;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .doc-header {
    display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;
  }
  .meta-table {
    width:100%; border-collapse:collapse; margin-bottom:10px; border:1.5px solid #222;
  }
  .meta-table td { padding:4px 8px; font-size:10px; border:1px solid #bbb; vertical-align:middle; }
  .meta-table .lbl { font-weight:600; color: #2d3748; white-space:nowrap; background: #e2e8f0; width:120px; }
  .meta-table .val { color:#111; font-weight:500; }
  .meta-table .sign { width:90px; text-align:center; color:#bbb; font-size:9px;
                      font-style:italic; border-bottom:1px dashed #ccc; height:30px; vertical-align:bottom; }
  .data-wrap { border:1.5px solid #222; border-radius:4px; }
  .data-table { width:100%; border-collapse:collapse; font-size:9px; }
  .data-table th, .data-table td { border:1px solid #ddd; vertical-align:middle; }
  .data-table th {
    background: #4a5568 !important;
    color: #fff !important;
    }
  .footer {
    margin-top:10px; display:flex; justify-content:space-between;
    font-size:9px; color:#999; border-top:1px solid #eee; padding-top:6px;
  }
</style>
</head>
<body>

  <div class="doc-header">
    <div style="font-size:17px;font-weight:900;letter-spacing:2px;border:2px solid #111;padding:3px 10px;">
      excelitas
    </div>
    <div style="font-size:13px;font-weight:700;text-align:center;flex:1;letter-spacing:0.5px;">
      Test Data Sheet
    </div>
    <div style="text-align:right;font-size:9px;color:#555;">
      <div style="font-weight:700;font-size:11px;">${escHtml(form.poNumber)}</div>
      <div>PO Number</div>
    </div>
  </div>

  <table class="meta-table">
    <colgroup>
      <col style="width:14%"/><col style="width:19%"/>
      <col style="width:14%"/><col style="width:19%"/>
      <col style="width:14%"/><col style="width:20%"/>
    </colgroup>
    <tr>
      <td class="lbl">Multimeter #1 SN</td>
      <td class="val">${escHtml(form.multimeter1SN || 'N/A')}</td>
      <td class="lbl">Multimeter #2 SN</td>
      <td class="val" colspan="3">${escHtml(form.multimeter2SN || 'N/A')}</td>
    </tr>
    <tr>
      <td class="lbl">Oscilloscope SN</td>
      <td class="val">${escHtml(form.oscilloscopeSN || 'N/A')}</td>
      <td class="lbl">Tester</td>
      <td class="val" colspan="3">${escHtml(form.tester || 'N/A')}</td>
    </tr>
    <tr>
      <td class="lbl">Unit Type</td>
      <td class="val">${escHtml(form.unitType || 'N/A')}</td>
      <td class="lbl">Tested By</td>
      <td class="val" style="font-weight:700;">${escHtml(form.testedBy || 'N/A')}</td>
      <td class="lbl" style="font-size:8px;color:#888;">Date: ${escHtml(fmt(form.testDate))}</td>
      <td class="sign">Sign</td>
    </tr>
    <tr>
      <td class="lbl">Test Date</td>
      <td class="val">${escHtml(fmt(form.testDate))}</td>
      <td class="lbl">Verified By</td>
      <td class="val" style="font-weight:700;">${escHtml(form.verifiedBy || 'N/A')}</td>
      <td class="lbl" style="font-size:8px;color:#888;">Date: ${escHtml(fmt(form.testDate))}</td>
      <td class="sign">Sign</td>
    </tr>
  </table>

  <div class="data-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="${rowspan2}" style="${thStyle('min-width:28px;')}">NO</th>
          <th rowspan="${rowspan2}" style="${thStyle('white-space:nowrap;')}">SERIAL NO.</th>
          ${htmlParentHeaders}
          <th rowspan="${rowspan2}" style="${thStyle('white-space:nowrap;')}">STATUS</th>
          <th rowspan="${rowspan2}" style="${thStyle('')}">REMARKS</th>
        </tr>
        ${hasSubHeaders ? `<tr>${htmlSubHeaders}</tr>` : ''}
      </thead>
      <tbody>
        ${htmlRows || `<tr><td colspan="20" style="padding:16px;text-align:center;color:#aaa;font-style:italic;">
            No data available</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <span>Generated: ${new Date().toLocaleString('en-GB')}</span>
    <span>Product: ${escHtml(testInfo?.productName || '')}  |  Test Type: ${escHtml(testInfo?.testTypeName || '')}</span>
    <span>Total Units: ${entries.length}</span>
  </div>

</body>
</html>`
}


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
 * Sanitize semua nilai di satu row — konversi Date object ke string YYYY-MM-DD
 * menggunakan komponen lokal (bukan UTC) untuk hindari timezone offset.
 * Dipanggil setelah filterExcelRows pada setiap row valid.
 */
function sanitizeRow(row) {
    const result = {};
    for (const [key, val] of Object.entries(row)) {
        if (val instanceof Date) {
            // Date object → pakai komponen LOKAL bukan toISOString (UTC)
            // Contoh bug: new Date(2026,0,13) di UTC+7
            //   .toISOString() = "2026-01-12T17:00:00Z" → split T[0] = "2026-01-12" SALAH
            //   .getFullYear()/.getDate() = 2026/13 → "2026-01-13" BENAR
            const yyyy = val.getFullYear();
            const mm   = String(val.getMonth() + 1).padStart(2, '0');
            const dd   = String(val.getDate()).padStart(2, '0');
            result[key] = `${yyyy}-${mm}-${dd}`;
        } else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
            // String ISO datetime dari SheetJS, misal "2026-01-12T17:00:00.000Z"
            // Ini sudah ter-serialize timezone → parse ulang dan ambil komponen lokal
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
                const yyyy = d.getFullYear();
                const mm   = String(d.getMonth() + 1).padStart(2, '0');
                const dd   = String(d.getDate()).padStart(2, '0');
                result[key] = `${yyyy}-${mm}-${dd}`;
            } else {
                result[key] = val;
            }
        } else {
            result[key] = val;
        }
    }
    return result;
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

        return true;
    });
}

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
    // Cari user berdasarkan username (yang dikirim dari frontend sebagai operatorName)
    const [existing] = await conn.query(
        'SELECT id FROM users WHERE username = ?',
        [operatorName]
    );
    if (existing.length > 0) return existing[0].id;

    const [result] = await conn.query(
        `INSERT INTO users (username, badge_number, role, created_at)
         VALUES (?, ?, 'operator', NOW())`,
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
