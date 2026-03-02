// src/composables/useExcelImport.js
import { ref, computed } from 'vue'

export function useExcelImport() {
  const isLoading    = ref(false)
  const importReady  = ref(false)
  const allRows      = ref([])   // semua mapped rows (sudah di-transform)
  const columnMap    = ref([])   // [{ excelKey, excelLabel, templateColId, templateColName }]
  const detectedSheet = ref('')

  // ---------------------------------------------------------------
  // Computed untuk UI
  // ---------------------------------------------------------------
  const passCount = computed(() => allRows.value.filter(r => r.status === 'Pass').length)
  const failCount = computed(() => allRows.value.filter(r => r.status === 'Fail').length)

  const mappingDisplay = computed(() =>
    columnMap.value.map(m => ({ excel: m.excelLabel, template: m.templateColName }))
  )

  // ---------------------------------------------------------------
  // FUNGSI UTAMA: validate + map
  // ---------------------------------------------------------------
  async function validateAndMap(file, selectedProduct, templateData) {
    isLoading.value   = true
    importReady.value = false
    allRows.value     = []
    columnMap.value   = []

    try {
      // 1. Convert Excel → JSON via Electron IPC
      const uint8Array = await file.arrayBuffer().then(buf => new Uint8Array(buf))
      const convertResult = await window.electron.excel.convertToJson({
        buffer:  uint8Array,
        options: { header: { rows: 0 } }
      })

      if (!convertResult.success) {
        return { success: false, error: convertResult.error || 'Gagal membaca file Excel' }
      }

      const sheetName = Object.keys(convertResult.data)[0]
      const rawRows   = convertResult.data[sheetName] || []
      detectedSheet.value = sheetName

      // 2. VALIDASI 1 — Cek nomor produk
      const productCheck = validateProductNumber(rawRows, selectedProduct)
      if (!productCheck.valid) {
        return {
    columnMap,
          success:   false,
          errorType: 'productMismatch',
          detail: {
            selected: `${selectedProduct.series}-${selectedProduct.series_number}`,
            found:    productCheck.found || 'tidak ditemukan',
          }
        }
      }

      // 3. Cari baris header (ada SERIAL + OPERATOR)
      const headerRowIndex = findHeaderRowIndex(rawRows)
      if (headerRowIndex === -1) {
        return { success: false, error: 'Baris header tidak ditemukan di Excel' }
      }
      const headerRow = rawRows[headerRowIndex]

      // 4. VALIDASI 2 — Cek header vs kolom template
      const templateCols = extractTemplateCols(templateData)
      const matchResult  = matchColumns(headerRow, templateCols)

      if (!matchResult.valid) {
        return {
    columnMap,
          success:   false,
          errorType: 'headerMismatch',
          detail: {
            missing: matchResult.missing,
            extra:   matchResult.extra,
          }
        }
      }

      columnMap.value = matchResult.mapping

      // 5. Ambil + transform data rows
      const dataRows = filterDataRows(rawRows, headerRowIndex)
      allRows.value  = dataRows.map(row => mapRow(row, matchResult.mapping, headerRow))

      importReady.value = true
      return { success: true }

    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // ---------------------------------------------------------------
  // VALIDASI 1: Nomor produk
  // Scan SEMUA baris + SEMUA nilai — cari "First/Final Test XXX-YYY"
  // ---------------------------------------------------------------
  function validateProductNumber(rawRows, selectedProduct) {
    let foundNumber = null

    for (const row of rawRows) {
      const values = Array.isArray(row) ? row : Object.values(row)
      for (const val of values) {
        if (!val) continue
        const str = String(val)
        const m = str.match(/(?:first|final|retest)\s+test\s+([\d][\d\-]+)/i)
        if (m) {
          foundNumber = m[1]
          break
        }
      }
      if (foundNumber) break
    }

    if (!foundNumber) {
      return { valid: false, found: 'nomor produk tidak ditemukan' }
    }

    const expected  = `${selectedProduct.series}-${selectedProduct.series_number}`
    const normalize = s => s?.toLowerCase().trim() || ''

    return {
    columnMap,
      valid: normalize(foundNumber) === normalize(expected),
      found: foundNumber,
    }
  }

  // ---------------------------------------------------------------
  // Cari index baris header (ada SERIAL + OPERATOR)
  // ---------------------------------------------------------------
  function findHeaderRowIndex(rows) {
    for (let i = 0; i < rows.length; i++) {
      const text = Object.values(rows[i]).join(' ').toUpperCase()
      if (text.includes('SERIAL') && text.includes('OPERATOR')) return i
    }
    return -1
  }

  // ---------------------------------------------------------------
  // Filter baris data — skip header, USL, LSL, kosong
  // ---------------------------------------------------------------
  function filterDataRows(rows, headerRowIndex) {
    return rows.slice(headerRowIndex + 3).filter(row => {
      const values = Object.values(row)
      const filled = values.filter(v =>
        v !== null && v !== undefined && String(v).trim() !== ''
      ).length
      if (filled < 3) return false

      const firstFilled = values.find(v => v?.toString().trim() !== '')
      const firstStr = firstFilled?.toString().toUpperCase().trim() || ''
      if (['USL', 'LSL', 'NO'].includes(firstStr)) return false

      // Skip baris formula-only (kolom B formula =IF tapi tidak ada nilai lain)
      const bVal = String(row['B'] || '').trim()
      if (bVal.startsWith('=') && filled < 4) return false

      return true
    })
  }

  // ---------------------------------------------------------------
  // Extract kolom dari template — col_ saja, skip ref_ dan parent
  // ---------------------------------------------------------------
  function extractTemplateCols(templateData) {
    const columns = templateData?.custom_columns?.columns || []
    const result  = []

    function walk(cols) {
      for (const col of cols) {
        if (col.isReference) continue
        if (col.isSplit && col.sub?.length > 0) {
          walk(col.sub)
        } else {
          result.push({ id: col.id, name: col.name })
        }
      }
    }
    walk(columns)
    return result
  }

  // ---------------------------------------------------------------
  // VALIDASI 2: Match header Excel vs template (case-insensitive, normalize \n)
  // ---------------------------------------------------------------
  function matchColumns(headerRow, templateCols) {
    const normalize = s =>
      s?.toString()
        .replace(/\r\n|\r|\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase() || ''

    // Build map dari normalized excel header
    const excelHeaders = {}
    for (const [key, val] of Object.entries(headerRow)) {
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        const norm = normalize(val)
        excelHeaders[norm] = {
          key,
          originalLabel: String(val).replace(/\r\n|\r|\n/g, ' ').trim()
        }
      }
    }

    const skipLabels = ['no', 'operator', 'test date', 'po number', 'serial number', 'status', 'remarks']
    const mapping = []
    const missing = []

    for (const col of templateCols) {
      const normColName = normalize(col.name)
      const found = excelHeaders[normColName]
      if (found) {
        mapping.push({
          excelKey:        found.key,
          excelLabel:      found.originalLabel,
          templateColId:   col.id,
          templateColName: col.name,
        })
      } else {
        missing.push(col.name)
      }
    }

    const mappedExcelKeys = new Set(mapping.map(m => m.excelKey))
    const extra = Object.entries(excelHeaders)
      .filter(([norm, info]) => !skipLabels.includes(norm) && !mappedExcelKeys.has(info.key))
      .map(([, info]) => info.originalLabel)

    return { valid: missing.length === 0, mapping, missing, extra }
  }

  // ---------------------------------------------------------------
  // Transform 1 raw Excel row → format siap pakai di TestingTable
  // ---------------------------------------------------------------
  function mapRow(row, mapping, headerRow) {
    const getVal = (key) => {
      const v = row[key]
      if (v === null || v === undefined) return ''
      if (v instanceof Date) return v.toISOString().split('T')[0]
      const s = String(v).trim()
      // Jangan return formula
      if (s.startsWith('=')) return ''
      return s
    }

    // Format tanggal dari berbagai kemungkinan
    const formatDate = (v) => {
      if (!v) return ''
      if (v instanceof Date) return v.toISOString().split('T')[0]
      const s = String(v).trim()
      if (s.startsWith('=')) return ''
      // Coba parse sebagai tanggal
      const d = new Date(s)
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
      return s
    }

    // Cari key untuk setiap kolom wajib dari headerRow
    const findKey = (label) => {
      const norm = s => s?.toString().replace(/\n/g, ' ').trim().toLowerCase() || ''
      for (const [key, val] of Object.entries(headerRow)) {
        if (norm(val) === norm(label)) return key
      }
      return null
    }

    const operatorKey    = findKey('Operator')    || 'C'
    const testDateKey    = findKey('Test Date')   || 'D'
    const poNumberKey    = findKey('PO Number')   || 'E'
    const serialKey      = findKey('Serial Number') || 'F'
    const statusKey      = findKey('Status')
    const remarksKey     = findKey('Remarks')

    // Test results — dari mapping kolom template
    const testResults = {}
    for (const m of mapping) {
      const val = getVal(m.excelKey)
      if (val !== '') testResults[m.templateColId] = val
    }

    // Status: dari kolom Status di header, atau cari nilai PASS/FAIL di row
    let status = 'Fail'
    if (statusKey) {
      const rawStatus = getVal(statusKey)
      status = normalizeStatus(rawStatus)
    } else {
      // Fallback: scan row untuk nilai PASS/FAIL
      for (const val of Object.values(row)) {
        const s = String(val || '').toUpperCase().trim()
        if (s === 'PASS') { status = 'Pass'; break }
      }
    }

    return {
    columnMap,
      operator:     operatorKey    ? getVal(operatorKey)               : '',
      testDate:     testDateKey    ? formatDate(row[testDateKey])      : '',
      poNumber:     poNumberKey    ? getVal(poNumberKey)               : '',
      serialNumber: serialKey      ? getVal(serialKey)                 : '',
      remarks:      remarksKey     ? getVal(remarksKey)                : '',
      status,
      testResults,  // { col_id: value }
    }
  }

  function normalizeStatus(raw) {
    if (!raw) return 'Fail'
    const s = String(raw).toUpperCase().trim()
    if (s === 'PASS' || s === 'YES' || s === 'P') return 'Pass'
    return 'Fail'
  }

  // ---------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------
  function reset() {
    importReady.value   = false
    allRows.value       = []
    columnMap.value     = []
    detectedSheet.value = ''
  }

  return {
    columnMap,
    isLoading,
    importReady,
    allRows,
    passCount,
    failCount,
    mappingDisplay,
    detectedSheet,
    validateAndMap,
    reset,
  }
}