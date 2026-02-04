<template>
  <div class="spreadsheet-container">
    <!-- Enhanced Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="handleImport" class="toolbar-btn import-btn">
          <span class="btn-icon">📤</span>
          <span class="btn-text">Import Excel</span>
        </button>
        <button @click="handleExport" class="toolbar-btn export-btn">
          <span class="btn-icon">📥</span>
          <span class="btn-text">Export Excel</span>
        </button>
        <button @click="recalculateAllFormulas" class="toolbar-btn formula-btn">
          <span class="btn-icon">🔢</span>
          <span class="btn-text">Recalc Formulas</span>
        </button>
        <button @click="addNewSheet" class="toolbar-btn sheet-btn">
          <span class="btn-icon">➕</span>
          <span class="btn-text">New Sheet</span>
        </button>
        <div class="spacer"></div>
        <div class="file-info">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ currentFile || 'No file loaded' }}</span>
          <span v-if="formulaCount > 0" class="formula-count">
            {{ formulaCount }} formula(s)
          </span>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          @change="onFileSelected" 
          accept=".xlsx,.xls" 
          style="display: none"
        />
      </div>
      
      <div class="toolbar-right">
        <span class="workbook-name">{{ workbookName }}</span>
        <span class="sheet-count">{{ sheetCount }} sheet(s)</span>
      </div>
    </div>
    
    <!-- Status Bar -->
    <div v-if="statusMessage" class="status-bar" :class="statusType">
      <span class="status-icon">{{ statusIcon }}</span>
      <span class="status-text">{{ statusMessage }}</span>
    </div>
    
    <!-- Univer Container -->
    <div ref="containerRef" class="univer-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ExcelService, type ImportResult } from '../../utils/excelConverter';

// Import Univer plugins
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';

// Import types untuk formula config
import type { IUniverSheetsFormulaBaseConfig } from '@univerjs/sheets-formula';

// Import CSS
import '@univerjs/design/lib/index.css';
import '@univerjs/ui/lib/index.css';
import '@univerjs/docs-ui/lib/index.css';
import '@univerjs/sheets-ui/lib/index.css';
import '@univerjs/sheets-formula-ui/lib/index.css';
import '@univerjs/sheets-numfmt-ui/lib/index.css';

// Refs
const containerRef = ref<HTMLElement>();
const fileInput = ref<HTMLInputElement>();

// State
const workbookName = ref('New Workbook');
const sheetCount = ref(1);
const currentFile = ref<string>('');
const formulaCount = ref(0);

const statusMessage = ref('');
const statusType = ref<'info' | 'success' | 'error' | 'warning'>('info');
const statusIcon = ref('');

// Univer instances
let univerInstance: Univer | null = null;
let univerAPI: any = null;

// Default workbook data
const defaultWorkbookData = {
  id: 'workbook-01',
  name: 'New Workbook',
  sheetOrder: ['sheet-01'],
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Sheet1',
      cellData: {
        0: { 
          0: { v: 'Product', t: 1 },
          1: { v: 'Price', t: 1 },
          2: { v: 'Quantity', t: 1 },
          3: { v: 'Total', t: 1 }
        },
        1: {
          0: { v: 'Item 1', t: 1 },
          1: { v: 100, t: 2 },
          2: { v: 10, t: 2 },
          3: { f: 'B2*C2', v: 1000, t: 2 } // Formula with result
        },
        2: {
          0: { v: 'Item 2', t: 1 },
          1: { v: 200, t: 2 },
          2: { v: 5, t: 2 },
          3: { f: 'B3*C3', v: 1000, t: 2 }
        }
      },
      rowCount: 100,
      columnCount: 26,
    }
  }
};

/**
 * Show status message
 */
const showStatus = (
  message: string, 
  type: 'info' | 'success' | 'error' | 'warning' = 'info',
  duration: number = 3000
) => {
  statusMessage.value = message;
  statusType.value = type;
  
  switch (type) {
    case 'success': statusIcon.value = '✅'; break;
    case 'error': statusIcon.value = '❌'; break;
    case 'warning': statusIcon.value = '⚠️'; break;
    default: statusIcon.value = 'ℹ️';
  }
  
  if (duration > 0) {
    setTimeout(() => {
      statusMessage.value = '';
    }, duration);
  }
};

/**
 * Initialize Univer
 */
const initUniver = async (workbookData?: any) => {
  if (!containerRef.value) return;

  try {
    // Cleanup previous instance
    if (univerInstance) {
      univerInstance.dispose();
      univerInstance = null;
      univerAPI = null;
    }

    // Create new Univer instance
    univerInstance = new Univer();

    // Register core plugins
    univerInstance.registerPlugin(UniverRenderEnginePlugin);
    univerInstance.registerPlugin(UniverFormulaEnginePlugin);
    
    // Register UI plugin
    univerInstance.registerPlugin(UniverUIPlugin, {
      container: containerRef.value,
      header: true,
      footer: true,
    });

    // Register docs plugins
    univerInstance.registerPlugin(UniverDocsPlugin);
    univerInstance.registerPlugin(UniverDocsUIPlugin);

    // Register sheets plugins with proper formula configuration
    univerInstance.registerPlugin(UniverSheetsPlugin);
    univerInstance.registerPlugin(UniverSheetsUIPlugin);
    
    // PERBAIKAN: Gunakan config yang benar untuk formula plugin
    univerInstance.registerPlugin(UniverSheetsFormulaPlugin, {
      // Config yang valid sesuai dengan type definition
      notExecuteFormula: false, // Property yang benar (bukan notCalculateFormula)
      // Opsi tambahan jika diperlukan
    } as Partial<IUniverSheetsFormulaBaseConfig>);
    
    univerInstance.registerPlugin(UniverSheetsFormulaUIPlugin);
    univerInstance.registerPlugin(UniverSheetsNumfmtPlugin);
    univerInstance.registerPlugin(UniverSheetsNumfmtUIPlugin);

    // Create workbook
    const dataToUse = workbookData || defaultWorkbookData;
    univerInstance.createUnit(0, dataToUse);

    // Create Facade API
    univerAPI = FUniver.newAPI(univerInstance);

    // Wait for Univer to be ready
    await waitForUniverReady();

    // Update state
    workbookName.value = dataToUse.name || 'New Workbook';
    sheetCount.value = dataToUse.sheetOrder?.length || 1;
    
    // Count formulas
    formulaCount.value = countFormulas(dataToUse);
    
    showStatus('Spreadsheet ready', 'success');
    
  } catch (error: any) {
    console.error('Failed to initialize Univer:', error);
    showStatus('Failed to initialize spreadsheet', 'error');
  }
};

/**
 * Wait for Univer to be ready
 */
const waitForUniverReady = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!univerAPI) {
      resolve();
      return;
    }

    const maxWaitTime = 5000; // 5 seconds max
    const startTime = Date.now();
    
    const checkReady = () => {
      try {
        const activeWorkbook = univerAPI.getActiveWorkbook();
        if (activeWorkbook) {
          resolve();
          return;
        }
        
        if (Date.now() - startTime > maxWaitTime) {
          console.warn('Timeout waiting for Univer to be ready');
          resolve();
          return;
        }
        
        setTimeout(checkReady, 100);
      } catch (error: any) {
        setTimeout(checkReady, 100);
      }
    };
    
    checkReady();
  });
};

/**
 * Handle file import
 */
const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;

  try {
    showStatus(`Importing ${file.name}...`, 'info');
    
    // Import Excel file dengan ExcelService
    const result: ImportResult = await ExcelService.importExcel(file, {
      preserveStyles: true,
      calculateFormulas: true
    });
    
    // Update state
    currentFile.value = file.name;
    formulaCount.value = result.formulas.length;
    
    console.log('Imported workbook:', result.workbookData);
    console.log('Formulas found:', result.formulas);
    
    // Initialize Univer dengan data yang diimport
    await initUniver(result.workbookData);
    
    // Force formula recalculation
    setTimeout(() => {
      recalculateAllFormulas();
    }, 1000);
    
    showStatus(`Successfully imported ${file.name}`, 'success');
    
  } catch (error: any) {
    console.error('Import failed:', error);
    showStatus(`Failed to import file: ${error.message}`, 'error');
  }
  
  // Reset input
  input.value = '';
};

/**
 * Handle export
 */
const handleExport = async () => {
  if (!univerAPI) {
    showStatus('No data to export', 'warning');
    return;
  }

  try {
    showStatus('Exporting to Excel...', 'info');
    
    const activeWorkbook = univerAPI.getActiveWorkbook();
    if (!activeWorkbook) {
      throw new Error('No active workbook found');
    }
    
    // Get snapshot dari Univer
    const snapshot = activeWorkbook.getSnapshot();
    
    // Export ke Excel dengan semua styling
    await ExcelService.exportExcel(snapshot, {
      filename: currentFile.value?.replace(/\.[^/.]+$/, "") || workbookName.value,
      includeStyles: true
    });
    
    showStatus('Excel file exported successfully', 'success');
    
  } catch (error: any) {
    console.error('Export failed:', error);
    showStatus(`Failed to export: ${error.message}`, 'error');
  }
};

/**
 * Recalculate all formulas
 */
const recalculateAllFormulas = () => {
  if (!univerAPI) return;
  
  try {
    const activeWorkbook = univerAPI.getActiveWorkbook();
    if (activeWorkbook) {
      if (typeof activeWorkbook.recalculate === 'function') {
        activeWorkbook.recalculate();
        showStatus('Formulas recalculated', 'success');
      }
      
      // Update formula count
      const snapshot = activeWorkbook.getSnapshot();
      formulaCount.value = countFormulas(snapshot);
    }
  } catch (error: any) {
    console.warn('Formula recalculation failed:', error);
    showStatus('Failed to recalculate formulas', 'warning');
  }
};

/**
 * Add new sheet
 */
const addNewSheet = () => {
  if (!univerAPI) {
    showStatus('Spreadsheet not ready', 'warning');
    return;
  }

  try {
    const activeWorkbook = univerAPI.getActiveWorkbook();
    if (!activeWorkbook) return;

    const newSheetName = `Sheet${sheetCount.value + 1}`;
    activeWorkbook.addWorksheet(newSheetName);
    
    // Update sheet count
    sheetCount.value = activeWorkbook.getSheets().length;
    
    showStatus(`Added new sheet: ${newSheetName}`, 'success');
    
  } catch (error: any) {
    console.error('Failed to add new sheet:', error);
    showStatus('Failed to add new sheet', 'error');
  }
};

/**
 * Count formulas in workbook
 */
const countFormulas = (workbookData: any): number => {
  let count = 0;
  
  if (!workbookData?.sheets) return 0;
  
  Object.values(workbookData.sheets).forEach((sheet: any) => {
    const cellData = sheet.cellData || {};
    Object.values(cellData).forEach((row: any) => {
      if (row && typeof row === 'object') {
        Object.values(row).forEach((cell: any) => {
          if (cell?.f) count++;
        });
      }
    });
  });
  
  return count;
};

/**
 * Handle import button click
 */
const handleImport = () => {
  fileInput.value?.click();
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initUniver();
  });
});

onBeforeUnmount(() => {
  if (univerInstance) {
    univerInstance.dispose();
    univerInstance = null;
    univerAPI = null;
  }
});
</script>

<style scoped>
.spreadsheet-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* Toolbar Styles */
.toolbar {
  padding: 12px 20px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toolbar-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
  min-width: 120px;
  justify-content: center;
}

.toolbar-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.toolbar-btn:active {
  transform: translateY(0);
}

.import-btn {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.import-btn:hover {
  background: linear-gradient(135deg, #219653 0%, #27ae60 100%);
}

.export-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.export-btn:hover {
  background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
}

.formula-btn {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.formula-btn:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
}

.sheet-btn {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.sheet-btn:hover {
  background: linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 13px;
}

.spacer {
  flex: 1;
  min-width: 20px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.file-icon {
  font-size: 14px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.formula-count {
  font-size: 12px;
  background: rgba(241, 196, 15, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid rgba(241, 196, 15, 0.3);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.workbook-name {
  font-size: 16px;
  font-weight: bold;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 150px;
  text-align: center;
}

.sheet-count {
  font-size: 13px;
  opacity: 0.9;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

/* Status Bar */
.status-bar {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.status-bar.info {
  background: rgba(52, 152, 219, 0.1);
  color: #2980b9;
  border-bottom: 1px solid rgba(52, 152, 219, 0.2);
}

.status-bar.success {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border-bottom: 1px solid rgba(46, 204, 113, 0.2);
}

.status-bar.error {
  background: rgba(231, 76, 60, 0.1);
  color: #c0392b;
  border-bottom: 1px solid rgba(231, 76, 60, 0.2);
}

.status-bar.warning {
  background: rgba(243, 156, 18, 0.1);
  color: #d35400;
  border-bottom: 1px solid rgba(243, 156, 18, 0.2);
}

.status-icon {
  font-size: 14px;
}

.status-text {
  font-weight: 500;
}

/* Univer Container */
.univer-container {
  flex: 1;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  margin: 10px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .toolbar-left {
    gap: 8px;
  }
  
  .toolbar-btn {
    min-width: 100px;
    padding: 6px 12px;
  }
  
  .btn-text {
    font-size: 12px;
  }
  
  .file-name {
    max-width: 150px;
  }
}

@media (max-width: 900px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  
  .toolbar-left {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .toolbar-right {
    width: 100%;
    justify-content: flex-start;
  }
  
  .toolbar-btn {
    min-width: 90px;
    font-size: 12px;
  }
  
  .btn-text {
    display: none;
  }
  
  .toolbar-btn {
    min-width: auto;
    padding: 8px;
  }
}
</style>  