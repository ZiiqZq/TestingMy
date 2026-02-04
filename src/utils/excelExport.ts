import type { 
  IWorkbookData, 
  IStyleData,
  IBorderData
} from '@univerjs/core';

// Import constants
const TextWrap = {
  OVERFLOW: 1,
  TRUNCATE: 2,
  WRAP: 3
} as const;

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeStyles?: boolean;
}

/**
 * Konversi data Univer ke workbook XLSX dengan styling menggunakan ExcelJS
 * Ini adalah export function yang lebih powerful daripada XLSX library
 */
export async function exportUniverToExcelWithStyles(
  workbookData: Partial<IWorkbookData>,
  options?: ExcelExportOptions
): Promise<void> {
  // Dynamic import untuk ExcelJS
  const ExcelJS = (await import('exceljs')).default;
  
  const wb = new ExcelJS.Workbook();
  const filename = options?.filename || workbookData.name || 'export';
  
  workbookData.sheetOrder?.forEach((sheetId) => {
    const sheet = workbookData.sheets?.[sheetId];
    if (!sheet) return;
    
    const ws = wb.addWorksheet(sheet.name || sheetId);
    
    // Process cell data
    const rowKeys = Object.keys(sheet.cellData || {}).map(Number);
    const maxRow = rowKeys.length > 0 ? Math.max(...rowKeys) : 0;
    
    for (let row = 0; row <= maxRow; row++) {
      const rowData = sheet.cellData?.[row] || {};
      const colKeys = Object.keys(rowData).map(Number);
      const maxCol = colKeys.length > 0 ? Math.max(...colKeys) : 0;
      
      for (let col = 0; col <= maxCol; col++) {
        const cell = rowData[col];
        
        if (cell) {
          // ExcelJS menggunakan 1-based indexing
          const excelCell = ws.getCell(row + 1, col + 1);
          
          // Handle cell value
          if (cell.f) {
            // Formula
            excelCell.value = { formula: cell.f };
          } else if (cell.v !== undefined) {
            // Regular value
            switch (cell.t) {
              case 2: // NUMBER
                excelCell.value = Number(cell.v);
                break;
              case 3: // BOOLEAN
                excelCell.value = cell.v ? true : false;
                break;
              case 1: // STRING
              case 4: // FORCE_STRING
              default:
                excelCell.value = String(cell.v);
                break;
            }
          }
          
          // Apply styling
          if (cell.s && workbookData.styles) {
            const styleData = workbookData.styles[cell.s as string];
            if (styleData) {
              applyExcelJSStyle(excelCell, styleData);
            }
          }
        }
      }
    }
    
    // Add column widths
    if (sheet.columnData && Object.keys(sheet.columnData).length > 0) {
      const maxCol = Math.max(...Object.keys(sheet.columnData).map(Number));
      for (let i = 0; i <= maxCol; i++) {
        const col = sheet.columnData[i];
        if (col && 'width' in col) {
          ws.getColumn(i + 1).width = (col.width as number) / 8;
        }
      }
    }
    
    // Add row heights
    if (sheet.rowData && Object.keys(sheet.rowData).length > 0) {
      const maxRowNum = Math.max(...Object.keys(sheet.rowData).map(Number));
      for (let i = 0; i <= maxRowNum; i++) {
        const row = sheet.rowData[i];
        if (row && 'h' in row) {
          ws.getRow(i + 1).height = (row.h as number) * 1.5;
        }
      }
    }
    
    // Add merged cells
    if (sheet.mergeData && sheet.mergeData.length > 0) {
      sheet.mergeData.forEach(merge => {
        const startRow = merge.startRow + 1;
        const startCol = merge.startColumn + 1;
        const endRow = merge.endRow + 1;
        const endCol = merge.endColumn + 1;
        ws.mergeCells(startRow, startCol, endRow, endCol);
      });
    }
  });
  
  // Write file
  await wb.xlsx.writeFile(`${filename}.xlsx`);
}

/**
 * Apply Univer style ke ExcelJS cell dengan full support untuk semua styling
 */
function applyExcelJSStyle(cell: any, style: IStyleData): void {
  // Font
  if (style.ff || style.fs || style.bl || style.it) {
    cell.font = {
      name: style.ff || 'Calibri',
      size: style.fs || 11,
      bold: style.bl === 1,
      italic: style.it === 1
    };
    
    // Font color
    if (style.cl) {
      const rgb = style.cl.rgb?.replace('#', '') || '000000';
      cell.font.color = { argb: `FF${rgb.toUpperCase()}` };
    }
  }
  
  // Fill (background color) - PENTING untuk menampilkan warna background
  if (style.bg) {
    const rgb = style.bg.rgb?.replace('#', '') || '000000';
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${rgb.toUpperCase()}` },
      bgColor: { argb: 'FFFFFFFF' }
    };
  }
  
  // Alignment
  if (style.ht || style.vt || style.tb) {
    cell.alignment = {};
    
    if (style.ht) {
      const hAligns: { [key: number]: string } = {
        1: 'left',
        2: 'center',
        3: 'right'
      };
      cell.alignment.horizontal = hAligns[style.ht] || 'left';
    }
    
    if (style.vt) {
      const vAligns: { [key: number]: string } = {
        1: 'top',
        2: 'center',
        3: 'bottom'
      };
      cell.alignment.vertical = vAligns[style.vt] || 'top';
    }
    
    if (style.tb === TextWrap.WRAP) {
      cell.alignment.wrapText = true;
    }
  }
  
  // Border - PENTING untuk menampilkan border
  if (style.bd) {
    cell.border = {};
    
    const borderStyleMap: { [key: number]: string } = {
      0: 'none',
      1: 'thin',
      2: 'medium',
      3: 'thick',
      4: 'dashed',
      5: 'dotted',
      6: 'double'
    };
    
    // Top border
    if (style.bd.t) {
      const color = style.bd.t.cl ? { argb: `FF${(style.bd.t.cl.rgb?.replace('#', '') || '000000').toUpperCase()}` } : undefined;
      cell.border.top = {
        style: borderStyleMap[style.bd.t.s] || 'thin',
        color
      };
    }
    
    // Bottom border
    if (style.bd.b) {
      const color = style.bd.b.cl ? { argb: `FF${(style.bd.b.cl.rgb?.replace('#', '') || '000000').toUpperCase()}` } : undefined;
      cell.border.bottom = {
        style: borderStyleMap[style.bd.b.s] || 'thin',
        color
      };
    }
    
    // Left border
    if (style.bd.l) {
      const color = style.bd.l.cl ? { argb: `FF${(style.bd.l.cl.rgb?.replace('#', '') || '000000').toUpperCase()}` } : undefined;
      cell.border.left = {
        style: borderStyleMap[style.bd.l.s] || 'thin',
        color
      };
    }
    
    // Right border
    if (style.bd.r) {
      const color = style.bd.r.cl ? { argb: `FF${(style.bd.r.cl.rgb?.replace('#', '') || '000000').toUpperCase()}` } : undefined;
      cell.border.right = {
        style: borderStyleMap[style.bd.r.s] || 'thin',
        color
      };
    }
  }
  
  // Number format
  if (style.n?.pattern) {
    cell.numFmt = style.n.pattern;
  }
}
