const { ipcMain } = require('electron');

function registerTestingHandlers(pool) {
    // Fungsi-fungsi CRITICAL untuk Testing Page:

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

    // 2. Get test types for a product
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

    // 3. Get test parameters
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

    // 4. Get templates by product
    ipcMain.handle('db:get-templates-by-product', async (event, productId) => {
        try {
            const [rows] = await pool.query(`
                SELECT t.*, tt.name as test_type_name, tt.sequence_order
                FROM templates t
                JOIN test_types tt ON t.test_type_id = tt.id
                WHERE t.product_id = ? AND t.is_active = 1
                ORDER BY tt.sequence_order
            `, [productId]);

            // Parse JSON custom_columns
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

    // 5. Submit test entries (FUNGSI UTAMA!)
    ipcMain.handle('db:submit-test-entries', async (event, submitData) => {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // Get or create operator
            const [existingOperator] = await conn.query(
                'SELECT id FROM users WHERE username = ? OR full_name = ?',
                [submitData.operatorName, submitData.operatorName]
            );

            let operatorId;
            if (existingOperator.length > 0) {
                operatorId = existingOperator[0].id;
            } else {
                const [result] = await conn.query(
                    `INSERT INTO users (username, password, full_name, role, is_active) 
                     VALUES (?, 'temp123', ?, 'operator', 1)`,
                    [submitData.operatorName, submitData.operatorName]
                );
                operatorId = result.insertId;
            }

            // Insert each test entry
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
                message: `Successfully saved ${insertedIds.length} test entries`
            };

        } catch (error) {
            await conn.rollback();
            return { success: false, error: error.message };
        } finally {
            conn.release();
        }
    });
}

module.exports = { registerTestingHandlers };