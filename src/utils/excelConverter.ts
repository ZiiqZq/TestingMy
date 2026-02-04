import ExcelJS from 'exceljs';
import type { 
  IWorkbookData, 
  ICellData, 
  IStyleData,
  IBorderData,
  IColorStyle,
  IBorderStyleData
} from '@univerjs/core';

// Cell value types (Univer standard)
const CellValueType = {
  STRING: 1,
  NUMBER: 2,
  BOOLEAN: 3,
  FORCE_STRING: 4
} as const;

// Horizontal alignment values
const HorizontalAlign = {
  LEFT: 1,
  CENTER: 2,
  RIGHT: 3
} as const;

// Vertical alignment values
const VerticalAlign = {
  TOP: 1,
  MIDDLE: 2,
  BOTTOM: 3
} as const;

// Text wrap values
const TextWrap = {
  OVERFLOW: 1,
  TRUNCATE: 2,
  WRAP: 3
} as const;

// Border style values
const BorderStyle = {
  NONE: 0,
  THIN: 1,
  MEDIUM: 2,
  THICK: 3,
  DASHED: 4,
  DOTTED: 5,
  DOUBLE: 6
} as const;

export interface ImportOptions {
  preserveStyles?: boolean;
  calculateFormulas?: boolean;
  sheetIndex?: number;
}

export interface ExportOptions {
  filename?: string;
  includeStyles?: boolean;
  sheetName?: string;
}

export interface ImportResult {
  workbookData: Partial<IWorkbookData>;
  formulas: Array<{row: number; col: number; formula: string; result: any}>;
}

// Type untuk ExcelJS Cell Alignment
interface ExcelJSAlignment {
  horizontal?: 'left' | 'center' | 'right' | 'fill' | 'justify' | 'centerContinuous' | 'distributed';
  vertical?: 'top' | 'middle' | 'bottom' | 'distributed' | 'justify';
  wrapText?: boolean;
  textRotation?: number | 'vertical';
  indent?: number;
  readingOrder?: 'rtl' | 'ltr';
  shrinkToFit?: boolean;
}

// Type untuk ExcelJS Border
interface ExcelJSBorder {
  top?: { style?: ExcelJS.BorderStyle; color?: Partial<ExcelJS.Color> };
  bottom?: { style?: ExcelJS.BorderStyle; color?: Partial<ExcelJS.Color> };
  left?: { style?: ExcelJS.BorderStyle; color?: Partial<ExcelJS.Color> };
  right?: { style?: ExcelJS.BorderStyle; color?: Partial<ExcelJS.Color> };
  diagonal?: { style?: ExcelJS.BorderStyle; color?: Partial<ExcelJS.Color> };
}

/**
 * Service utama untuk Excel operations menggunakan ExcelJS
 * Menangani semua: formula, styling, borders, alignment, merge cells, dll.
 */
export class ExcelService {
  
  /**
   * Import file Excel ke format Univer dengan semua styling dan formula
   */
  static async importExcel(file: File, options: ImportOptions = {}): Promise<ImportResult> {
    const preserveStyles = options.preserveStyles ?? true;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      
      // Load workbook dengan semua data
      await workbook.xlsx.load(arrayBuffer);
      
      // Convert ke Univer format dengan semua detail
      const workbookData = await this.convertToUniverFormat(workbook, preserveStyles);
      
      // Extract semua formula
      const formulas = this.extractFormulas(workbookData);
      
      // Ensure semua formula memiliki hasil
      await this.ensureFormulaResults(workbookData, workbook);
      
      return {
        workbookData,
        formulas
      };
      
    } catch (error: any) {
      console.error('Import error:', error);
      throw new Error(`Failed to import Excel file: ${error.message}`);
    }
  }
  
  /**
   * Convert ExcelJS workbook ke Univer format dengan semua styling
   */
  private static async convertToUniverFormat(
    workbook: ExcelJS.Workbook, 
    preserveStyles: boolean
  ): Promise<Partial<IWorkbookData>> {
    
    const sheets: Record<string, any> = {};
    const sheetOrder: string[] = [];
    const styles: Record<string, IStyleData> = {};
    
    let styleCounter = 0;
    let cellCounter = 0;
    
    // Process setiap worksheet
    workbook.eachSheet((worksheet, sheetId) => {
      const sheetIndex = Array.from(workbook.worksheets.keys())
        .findIndex((_, idx) => workbook.worksheets[idx].name === worksheet.name);
      const sheetKey = `sheet-${sheetIndex + 1}`;
      
      const cellData: Record<number, Record<number, ICellData>> = {};
      const mergeData: Array<{
        startRow: number;
        startColumn: number;
        endRow: number;
        endColumn: number;
      }> = [];
      
      // Process merged cells - PERBAIKAN: gunakan worksheet.model.merges
      try {
        // Akses model merges secara internal
        const model = (worksheet as any).model;
        if (model && model.merges) {
          const merges: string[] = model.merges;
          merges.forEach((mergeRange: string) => {
            const [startCell, endCell] = mergeRange.split(':');
            const start = this.parseCellAddress(startCell);
            const end = this.parseCellAddress(endCell);
            
            mergeData.push({
              startRow: start.row,
              startColumn: start.col,
              endRow: end.row,
              endColumn: end.col
            });
          });
        }
      } catch (mergeError) {
        console.warn('Error reading merged cells:', mergeError);
      }
      
      // Process setiap row
      worksheet.eachRow((row, rowNumber) => {
        const rowIndex = rowNumber - 1;
        cellData[rowIndex] = cellData[rowIndex] || {};
        
        row.eachCell((cell, colNumber) => {
          const colIndex = colNumber - 1;
          cellCounter++;
          
          // Skip jika cell ini bagian dari merge (bukan top-left)
          if (this.isCellInMerge(mergeData, rowIndex, colIndex)) {
            return;
          }
          
          const cellObj: ICellData = {};
          
          // Process cell value dan formula
          this.processCellValue(cell, cellObj);
          
          // Process styling jika diperlukan
          if (preserveStyles) {
            const style = this.convertExcelJSStyle(cell);
            if (style && Object.keys(style).length > 0) {
              const styleId = `s${styleCounter++}`;
              styles[styleId] = style;
              cellObj.s = styleId;
            }
          }
          
          // Process number format
          if (cell.numFmt && preserveStyles) {
            if (!cellObj.s) {
              const styleId = `s${styleCounter++}`;
              styles[styleId] = { n: { pattern: cell.numFmt } };
              cellObj.s = styleId;
            } else {
              const style = styles[cellObj.s as string];
              if (style) {
                style.n = style.n || { pattern: cell.numFmt };
              }
            }
          }
          
          cellData[rowIndex][colIndex] = cellObj;
        });
      });
      
      // Column widths
      const columnData: Record<number, any> = {};
      const cols = worksheet.columns;
      if (cols) {
        cols.forEach((col, idx) => {
          if (col && col.width) {
            columnData[idx] = { width: Math.round(col.width * 8) }; // Convert to pixels
          }
        });
      }
      
      // Row heights
      const rowData: Record<number, any> = {};
      worksheet.eachRow((row, rowNum) => {
        if (row.height) {
          rowData[rowNum - 1] = { h: row.height };
        }
      });
      
      sheets[sheetKey] = {
        id: sheetKey,
        name: worksheet.name,
        cellData,
        rowCount: worksheet.rowCount || 100,
        columnCount: worksheet.columnCount || 26,
        mergeData,
        columnData,
        rowData
      };
      
      sheetOrder.push(sheetKey);
    });
    
    return {
      id: `workbook-${Date.now()}`,
      name: workbook.title || workbook.worksheets[0]?.name || 'Imported Workbook',
      sheetOrder,
      sheets,
      styles: Object.keys(styles).length > 0 ? styles : undefined
    };
  }
  
  /**
   * Process cell value dari ExcelJS
   */
  private static processCellValue(cell: ExcelJS.Cell, cellObj: ICellData): void {
    if (cell.value === null || cell.value === undefined) {
      return;
    }
    
    // Handle formula cells
    if (typeof cell.value === 'object') {
      const valueObj = cell.value as any;
      
      if (valueObj.formula) {
        // Formula cell
        cellObj.f = valueObj.formula;
        
        // PENTING: Simpan result jika ada
        if (valueObj.result !== undefined && valueObj.result !== null) {
          this.setCellValue(cellObj, valueObj.result);
        } else if (cell.result !== undefined) {
          // Coba ambil dari property result
          this.setCellValue(cellObj, cell.result);
        }
        return;
      }
      
      if (valueObj.sharedFormula) {
        // Shared formula
        cellObj.f = valueObj.sharedFormula;
        return;
      }
    }
    
    // Regular value
    this.setCellValue(cellObj, cell.value);
  }
  
  /**
   * Set cell value dengan tipe yang benar
   */
  private static setCellValue(cellObj: ICellData, value: any): void {
    if (value instanceof Date) {
      cellObj.v = value.toISOString();
      cellObj.t = CellValueType.STRING;
    } else if (typeof value === 'string') {
      cellObj.v = value;
      cellObj.t = CellValueType.STRING;
      
      // Check if it's a number string
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        cellObj.t = CellValueType.FORCE_STRING;
      }
    } else if (typeof value === 'number') {
      cellObj.v = value;
      cellObj.t = CellValueType.NUMBER;
    } else if (typeof value === 'boolean') {
      cellObj.v = value ? 1 : 0;
      cellObj.t = CellValueType.BOOLEAN;
    } else if (value === null || value === undefined) {
      cellObj.v = '';
      cellObj.t = CellValueType.STRING;
    }
  }
  
  /**
   * Convert ExcelJS style ke Univer IStyleData (LENGKAP)
   */
  private static convertExcelJSStyle(cell: ExcelJS.Cell): IStyleData | undefined {
    const style: IStyleData = {};
    
    // === FONT STYLING ===
    if (cell.font) {
      const font = cell.font;
      
      // Font family
      if (font.name && font.name !== 'Calibri') { // Default font
        style.ff = font.name;
      }
      
      // Font size
      if (font.size && font.size !== 11) { // Default size
        style.fs = font.size;
      }
      
      // Bold
      if (font.bold) {
        style.bl = 1;
      }
      
      // Italic
      if (font.italic) {
        style.it = 1;
      }
      
      // Underline
      if (font.underline) {
        style.ul = {
          s: 1,
          cl: font.color ? { rgb: this.convertColorToRgb(font.color) } : undefined
        };
      }
      
      // Strikethrough
      if (font.strike) {
        style.st = {
          s: 1,
          cl: font.color ? { rgb: this.convertColorToRgb(font.color) } : undefined
        };
      }
      
      // Font color
      if (font.color) {
        style.cl = { rgb: this.convertColorToRgb(font.color) };
      }
    }
    
    // === FILL/BACKGROUND COLOR ===
    if (cell.fill && cell.fill.type === 'pattern') {
      const fill = cell.fill as any;
      if (fill.fgColor) {
        style.bg = { rgb: this.convertColorToRgb(fill.fgColor) };
      }
    }
    
    // === BORDERS (SEMUA SISI) ===
    if (cell.border) {
      const border: IBorderData = {};
      const borderObj = cell.border as ExcelJSBorder;
      
      // Top border
      if (borderObj.top && borderObj.top.style) {
        border.t = {
          s: this.convertBorderStyle(borderObj.top.style),
          cl: { rgb: this.convertColorToRgb(borderObj.top.color) }
        };
      }
      
      // Bottom border
      if (borderObj.bottom && borderObj.bottom.style) {
        border.b = {
          s: this.convertBorderStyle(borderObj.bottom.style),
          cl: { rgb: this.convertColorToRgb(borderObj.bottom.color) }
        };
      }
      
      // Left border
      if (borderObj.left && borderObj.left.style) {
        border.l = {
          s: this.convertBorderStyle(borderObj.left.style),
          cl: { rgb: this.convertColorToRgb(borderObj.left.color) }
        };
      }
      
      // Right border
      if (borderObj.right && borderObj.right.style) {
        border.r = {
          s: this.convertBorderStyle(borderObj.right.style),
          cl: { rgb: this.convertColorToRgb(borderObj.right.color) }
        };
      }
      
      if (Object.keys(border).length > 0) {
        style.bd = border;
      }
    }
    
    // === ALIGNMENT ===
    if (cell.alignment) {
      const alignment = cell.alignment as ExcelJSAlignment;
      
      // Horizontal alignment
      if (alignment.horizontal) {
        switch (alignment.horizontal) {
          case 'left':
            style.ht = HorizontalAlign.LEFT;
            break;
          case 'center':
            style.ht = HorizontalAlign.CENTER;
            break;
          case 'right':
            style.ht = HorizontalAlign.RIGHT;
            break;
          case 'fill':
          case 'justify':
          case 'centerContinuous':
          case 'distributed':
            // Fallback to center for complex alignments
            style.ht = HorizontalAlign.CENTER;
            break;
        }
      }
      
      // Vertical alignment
      if (alignment.vertical) {
        switch (alignment.vertical) {
          case 'top':
            style.vt = VerticalAlign.TOP;
            break;
          case 'middle':
            style.vt = VerticalAlign.MIDDLE;
            break;
          case 'bottom':
            style.vt = VerticalAlign.BOTTOM;
            break;
          case 'distributed':
          case 'justify':
            style.vt = VerticalAlign.MIDDLE;
            break;
        }
      }
      
      // Text wrap
      if (alignment.wrapText) {
        style.tb = TextWrap.WRAP;
      }
      
      // Text rotation - handle both number and string types
      if (alignment.textRotation !== undefined && alignment.textRotation !== null) {
        if (typeof alignment.textRotation === 'number') {
          style.tr = {
            a: alignment.textRotation,
            v: alignment.textRotation === 90 || alignment.textRotation === -90 ? 1 : 0 // 1 = vertical
          };
        } else if (alignment.textRotation === 'vertical') {
          style.tr = {
            a: 90,
            v: 1
          };
        }
      }
    }
    
    return Object.keys(style).length > 0 ? style : undefined;
  }
  
  /**
   * Ensure semua formula memiliki hasil
   */
  private static async ensureFormulaResults(
    workbookData: Partial<IWorkbookData>,
    excelWorkbook: ExcelJS.Workbook
  ): Promise<void> {
    
    if (!workbookData.sheets) return;
    
    // Process setiap sheet
    Object.entries(workbookData.sheets).forEach(([sheetId, sheet]) => {
      const cellData = sheet.cellData as Record<number, Record<number, ICellData>>;
      
      // Find corresponding ExcelJS worksheet
      const sheetName = sheet.name;
      const excelWorksheet = excelWorkbook.getWorksheet(sheetName);
      
      if (!excelWorksheet) return;
      
      // Process setiap cell
      Object.keys(cellData).forEach(rowStr => {
        const row = parseInt(rowStr);
        
        Object.keys(cellData[row]).forEach(colStr => {
          const col = parseInt(colStr);
          const cell = cellData[row][col];
          
          // Jika ada formula tapi tidak ada hasil
          if (cell?.f && (cell.v === undefined || cell.v === null)) {
            try {
              const excelCell = excelWorksheet.getCell(row + 1, col + 1);
              
              // Coba ambil result dari ExcelJS
              if (excelCell.value && typeof excelCell.value === 'object' && 'result' in excelCell.value) {
                const result = (excelCell.value as any).result;
                if (result !== undefined) {
                  this.setCellValue(cell, result);
                }
              }
              
              // Jika masih tidak ada, coba evaluasi formula sederhana
              if (cell.v === undefined && cell.f) {
                const simpleResult = this.evaluateSimpleFormula(cell.f, cellData);
                if (simpleResult !== null) {
                  cell.v = simpleResult;
                  cell.t = typeof simpleResult === 'number' ? CellValueType.NUMBER : CellValueType.STRING;
                }
              }
              
            } catch (error: any) {
              console.warn(`Failed to get formula result for [${row},${col}]:`, error);
            }
          }
        });
      });
    });
  }
  
  /**
   * Export Univer data ke Excel dengan semua styling
   */
  static async exportExcel(
    workbookData: Partial<IWorkbookData>, 
    options: ExportOptions = {}
  ): Promise<void> {
    
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.title = workbookData.name || 'Exported Workbook';
      
      // Process setiap sheet
      workbookData.sheetOrder?.forEach((sheetId, index) => {
        const sheet = workbookData.sheets?.[sheetId];
        if (!sheet) return;
        
        const worksheet = workbook.addWorksheet(sheet.name || `Sheet${index + 1}`);
        
        // === SET COLUMN WIDTHS ===
        if (sheet.columnData) {
          Object.entries(sheet.columnData).forEach(([colStr, colData]: [string, any]) => {
            const colIndex = parseInt(colStr);
            const width = colData?.width ? colData.width / 8 : 15;
            worksheet.getColumn(colIndex + 1).width = width;
          });
        }
        
        // === SET ROW HEIGHTS ===
        if (sheet.rowData) {
          Object.entries(sheet.rowData).forEach(([rowStr, rowData]: [string, any]) => {
            const rowIndex = parseInt(rowStr);
            const height = rowData?.h;
            if (height) {
              worksheet.getRow(rowIndex + 1).height = height;
            }
          });
        }
        
        // === ADD MERGED CELLS ===
        if (sheet.mergeData && sheet.mergeData.length > 0) {
          sheet.mergeData.forEach(merge => {
            const startRow = merge.startRow + 1;
            const startCol = merge.startColumn + 1;
            const endRow = merge.endRow + 1;
            const endCol = merge.endColumn + 1;
            worksheet.mergeCells(startRow, startCol, endRow, endCol);
          });
        }
        
        // === PROCESS CELL DATA ===
        const cellData = sheet.cellData || {};
        Object.entries(cellData).forEach(([rowStr, row]) => {
          const rowNum = parseInt(rowStr) + 1;
          
          Object.entries(row as Record<number, ICellData>).forEach(([colStr, cell]) => {
            const colNum = parseInt(colStr) + 1;
            const excelCell = worksheet.getCell(rowNum, colNum);
            
            // Set cell value
            this.setExcelCellValue(excelCell, cell);
            
            // Apply styling
            if (cell.s && workbookData.styles && options.includeStyles !== false) {
              const styleData = workbookData.styles[cell.s as string];
              if (styleData) {
                this.applyUniverStyle(excelCell, styleData);
              }
            }
          });
        });
      });
      
      // === WRITE TO FILE ===
      const buffer = await workbook.xlsx.writeBuffer();
      this.downloadFile(
        buffer, 
        `${options.filename || workbookData.name || 'export'}.xlsx`
      );
      
    } catch (error: any) {
      console.error('Export error:', error);
      throw new Error(`Failed to export Excel file: ${error.message}`);
    }
  }
  
  /**
   * Set ExcelJS cell value dari Univer cell data
   */
  private static setExcelCellValue(excelCell: ExcelJS.Cell, cell: ICellData): void {
    if (cell.f) {
      // Formula
      excelCell.value = { 
        formula: cell.f.startsWith('=') ? cell.f.substring(1) : cell.f 
      };
      
      // Add result jika ada
      if (cell.v !== undefined) {
        (excelCell.value as any).result = cell.v;
      }
      
    } else if (cell.v !== undefined) {
      // Regular value
      switch (cell.t) {
        case CellValueType.NUMBER:
          excelCell.value = Number(cell.v);
          break;
        case CellValueType.BOOLEAN:
          excelCell.value = Boolean(cell.v);
          break;
        case CellValueType.STRING:
        case CellValueType.FORCE_STRING:
        default:
          excelCell.value = String(cell.v);
          break;
      }
    }
  }
  
  /**
   * Apply Univer style ke ExcelJS cell
   */
  private static applyUniverStyle(cell: ExcelJS.Cell, style: IStyleData): void {
    // === FONT ===
    if (style.ff || style.fs || style.bl || style.it || style.cl || style.ul || style.st) {
      cell.font = cell.font || {};
      
      if (style.ff) cell.font.name = style.ff;
      if (style.fs) cell.font.size = style.fs;
      if (style.bl) cell.font.bold = true;
      if (style.it) cell.font.italic = true;
      if (style.ul?.s) cell.font.underline = true;
      if (style.st?.s) cell.font.strike = true;
      
      if (style.cl?.rgb) {
        cell.font.color = { argb: this.rgbToArgb(style.cl.rgb) };
      }
    }
    
    // === BACKGROUND ===
    if (style.bg?.rgb) {
      cell.fill = {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: this.rgbToArgb(style.bg.rgb) },
        bgColor: { argb: 'FFFFFFFF' }
      };
    }
    
    // === BORDERS ===
    if (style.bd) {
      cell.border = {};
      const borderStyle = this.convertUniverBorderStyle;
      
      if (style.bd.t) {
        const borderStyleValue = borderStyle(style.bd.t.s);
        cell.border.top = {
          style: borderStyleValue as ExcelJS.BorderStyle,
          color: { argb: this.rgbToArgb(style.bd.t.cl?.rgb || '#000000') }
        };
      }
      
      if (style.bd.b) {
        const borderStyleValue = borderStyle(style.bd.b.s);
        cell.border.bottom = {
          style: borderStyleValue as ExcelJS.BorderStyle,
          color: { argb: this.rgbToArgb(style.bd.b.cl?.rgb || '#000000') }
        };
      }
      
      if (style.bd.l) {
        const borderStyleValue = borderStyle(style.bd.l.s);
        cell.border.left = {
          style: borderStyleValue as ExcelJS.BorderStyle,
          color: { argb: this.rgbToArgb(style.bd.l.cl?.rgb || '#000000') }
        };
      }
      
      if (style.bd.r) {
        const borderStyleValue = borderStyle(style.bd.r.s);
        cell.border.right = {
          style: borderStyleValue as ExcelJS.BorderStyle,
          color: { argb: this.rgbToArgb(style.bd.r.cl?.rgb || '#000000') }
        };
      }
    }
    
    // === ALIGNMENT ===
    if (style.ht || style.vt || style.tb === TextWrap.WRAP || style.tr) {
      cell.alignment = cell.alignment || {};
      
      // Horizontal alignment
      if (style.ht) {
        switch (style.ht) {
          case HorizontalAlign.LEFT:
            cell.alignment.horizontal = 'left';
            break;
          case HorizontalAlign.CENTER:
            cell.alignment.horizontal = 'center';
            break;
          case HorizontalAlign.RIGHT:
            cell.alignment.horizontal = 'right';
            break;
        }
      }
      
      // Vertical alignment
      if (style.vt) {
        switch (style.vt) {
          case VerticalAlign.TOP:
            cell.alignment.vertical = 'top';
            break;
          case VerticalAlign.MIDDLE:
            cell.alignment.vertical = 'middle';
            break;
          case VerticalAlign.BOTTOM:
            cell.alignment.vertical = 'bottom';
            break;
        }
      }
      
      // Text wrap
      if (style.tb === TextWrap.WRAP) {
        cell.alignment.wrapText = true;
      }
      
      // Text rotation
      if (style.tr) {
        cell.alignment.textRotation = style.tr.a;
      }
    }
    
    // === NUMBER FORMAT ===
    if (style.n?.pattern) {
      cell.numFmt = style.n.pattern;
    }
  }
  
  /**
   * Helper: Convert ExcelJS border style to number
   */
  private static convertBorderStyle(style: ExcelJS.BorderStyle | undefined): number {
    if (!style) return BorderStyle.NONE;
    
    switch (style) {
      case 'thin': return BorderStyle.THIN;
      case 'medium': return BorderStyle.MEDIUM;
      case 'thick': return BorderStyle.THICK;
      case 'dashed': return BorderStyle.DASHED;
      case 'dotted': return BorderStyle.DOTTED;
      case 'double': return BorderStyle.DOUBLE;
      case 'hair': return BorderStyle.THIN;
      case 'mediumDashed': return BorderStyle.DASHED;
      case 'mediumDashDot': return BorderStyle.DASHED;
      case 'mediumDashDotDot': return BorderStyle.DASHED;
      case 'slantDashDot': return BorderStyle.DASHED;
      default: return BorderStyle.NONE;
    }
  }
  
  /**
   * Helper: Convert Univer border style to ExcelJS style
   */
  private static convertUniverBorderStyle(style: number): string {
    switch (style) {
      case BorderStyle.THIN: return 'thin';
      case BorderStyle.MEDIUM: return 'medium';
      case BorderStyle.THICK: return 'thick';
      case BorderStyle.DASHED: return 'dashed';
      case BorderStyle.DOTTED: return 'dotted';
      case BorderStyle.DOUBLE: return 'double';
      case BorderStyle.NONE:
      default: return 'none';
    }
  }
  
  /**
   * Helper: Convert ExcelJS color to RGB hex
   */
  private static convertColorToRgb(color: any): string {
    if (!color) return '#000000';
    
    if (color.argb) {
      // ARGB format -> remove alpha channel
      return `#${color.argb.substring(2)}`;
    } else if (color.rgb) {
      return `#${color.rgb}`;
    } else if (color.theme !== undefined) {
      // Theme color - default to black
      return '#000000';
    } else if (color.indexed !== undefined) {
      // Indexed color
      const indexedColors: Record<number, string> = {
        1: '#000000',  // Black
        2: '#FFFFFF',  // White
        3: '#FF0000',  // Red
        4: '#00FF00',  // Green
        5: '#0000FF',  // Blue
        6: '#FFFF00',  // Yellow
        7: '#FF00FF',  // Magenta
        8: '#00FFFF',  // Cyan
      };
      return indexedColors[color.indexed] || '#000000';
    }
    
    return '#000000';
  }
  
  /**
   * Helper: Convert RGB hex to ARGB
   */
  private static rgbToArgb(rgb: string): string {
    if (!rgb.startsWith('#')) return 'FF000000';
    const hex = rgb.substring(1);
    return `FF${hex.padStart(6, '0').toUpperCase()}`;
  }
  
  /**
   * Helper: Parse cell address like "A1" to row/col
   */
  private static parseCellAddress(address: string): { row: number; col: number } {
    const match = address.match(/([A-Z]+)(\d+)/);
    if (!match) return { row: 0, col: 0 };
    
    const colLetters = match[1];
    const row = parseInt(match[2]) - 1;
    const col = this.columnLettersToIndex(colLetters);
    
    return { row, col };
  }
  
  /**
   * Helper: Convert column letters to index
   */
  private static columnLettersToIndex(letters: string): number {
    let result = 0;
    for (let i = 0; i < letters.length; i++) {
      result = result * 26 + (letters.charCodeAt(i) - 64);
    }
    return result - 1;
  }
  
  /**
   * Helper: Check if cell is in merge range (not top-left)
   */
  private static isCellInMerge(
    mergeData: Array<{startRow: number; startColumn: number; endRow: number; endColumn: number}>,
    row: number,
    col: number
  ): boolean {
    for (const merge of mergeData) {
      if (row >= merge.startRow && row <= merge.endRow &&
          col >= merge.startColumn && col <= merge.endColumn) {
        // Check if it's not the top-left cell
        if (row === merge.startRow && col === merge.startColumn) {
          return false;
        }
        return true;
      }
    }
    return false;
  }
  
  /**
   * Helper: Extract semua formula dari workbook
   */
  private static extractFormulas(workbookData: Partial<IWorkbookData>) {
    const formulas: Array<{row: number; col: number; formula: string; result: any}> = [];
    
    if (!workbookData.sheets) return formulas;
    
    Object.values(workbookData.sheets).forEach(sheet => {
      const cellData = sheet.cellData as Record<number, Record<number, ICellData>>;
      
      Object.keys(cellData).forEach(rowStr => {
        const row = parseInt(rowStr);
        Object.keys(cellData[row]).forEach(colStr => {
          const col = parseInt(colStr);
          const cell = cellData[row][col];
          
          if (cell?.f) {
            formulas.push({
              row,
              col,
              formula: cell.f,
              result: cell.v
            });
          }
        });
      });
    });
    
    return formulas;
  }
  
  /**
   * Helper: Evaluasi formula sederhana untuk fallback
   */
  private static evaluateSimpleFormula(formula: string, cellData: Record<number, Record<number, ICellData>>): any {
    try {
      const cleanFormula = formula.startsWith('=') ? formula.substring(1) : formula;
      
      // Basic arithmetic: A1+B1, A1-B1, A1*B1, A1/B1
      const arithmeticMatch = cleanFormula.match(/^([A-Z]+)(\d+)\s*([+\-*/])\s*([A-Z]+)(\d+)$/);
      if (arithmeticMatch) {
        const [, col1, row1, operator, col2, row2] = arithmeticMatch;
        const row1Num = parseInt(row1) - 1;
        const row2Num = parseInt(row2) - 1;
        const col1Num = this.columnLettersToIndex(col1);
        const col2Num = this.columnLettersToIndex(col2);
        
        const val1 = Number(cellData[row1Num]?.[col1Num]?.v || 0);
        const val2 = Number(cellData[row2Num]?.[col2Num]?.v || 0);
        
        switch (operator) {
          case '+': return val1 + val2;
          case '-': return val1 - val2;
          case '*': return val1 * val2;
          case '/': return val2 !== 0 ? val1 / val2 : 0;
        }
      }
      
      // Cell reference: A1
      const cellRefMatch = cleanFormula.match(/^([A-Z]+)(\d+)$/);
      if (cellRefMatch) {
        const [, col, row] = cellRefMatch;
        const rowNum = parseInt(row) - 1;
        const colNum = this.columnLettersToIndex(col);
        return cellData[rowNum]?.[colNum]?.v || 0;
      }
      
      // SUM function: SUM(A1:B5)
      const sumMatch = cleanFormula.match(/^SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)$/i);
      if (sumMatch) {
        const [, startCol, startRow, endCol, endRow] = sumMatch;
        const startRowNum = parseInt(startRow) - 1;
        const endRowNum = parseInt(endRow) - 1;
        const startColNum = this.columnLettersToIndex(startCol);
        const endColNum = this.columnLettersToIndex(endCol);
        
        let sum = 0;
        for (let r = startRowNum; r <= endRowNum; r++) {
          for (let c = startColNum; c <= endColNum; c++) {
            sum += Number(cellData[r]?.[c]?.v || 0);
          }
        }
        return sum;
      }
      
      return null;
    } catch (error: any) {
      console.warn('Formula evaluation error:', error);
      return null;
    }
  }
  
  /**
   * Helper: Download file dari buffer
   */
  private static downloadFile(buffer: ArrayBuffer, filename: string): void {
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}