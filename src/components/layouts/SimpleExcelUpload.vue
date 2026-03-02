<!-- SimpleExcelUpload -->
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Convert Excel to JSON</h1>
    
    <!-- Upload Area -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Pilih File Excel</label>
      <input
        type="file"
        accept=".xlsx,.xls"
        @change="handleFileUpload"
        class="block w-full border rounded-lg p-2"
        :disabled="isLoading"
      />
      <p v-if="fileName" class="mt-2 text-sm text-gray-600">
        File: {{ fileName }}
      </p>
    </div>
    
    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4">Mengkonversi file...</p>
    </div>
    
    <!-- Hasil Konversi -->
    <div v-if="jsonResult && !isLoading" class="mt-6">
      <h2 class="text-lg font-semibold mb-4">Hasil Konversi:</h2>
      
      <!-- Sheet List -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Pilih Sheet:</label>
        <select 
          v-model="selectedSheet" 
          class="border rounded-lg p-2"
          @change="onSheetChange"
        >
          <option v-for="sheet in sheetNames" :key="sheet" :value="sheet">
            {{ sheet }}
          </option>
        </select>
      </div>

      <!-- Info bar -->
      <div class="mb-4 flex flex-wrap gap-3">
        <span class="text-sm bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-1">
          <strong>{{ filteredRows.length }}</strong> baris data valid
        </span>
        <span class="text-sm bg-gray-100 text-gray-600 rounded-lg px-3 py-1">
          <strong>{{ columns.length }}</strong> kolom
        </span>
        <span v-if="passCount > 0" class="text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-1">
          PASS: <strong>{{ passCount }}</strong>
        </span>
        <span v-if="failCount > 0" class="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-1">
          FAIL: <strong>{{ failCount }}</strong>
        </span>
      </div>
      
      <!-- Tabel semua data -->
      <div v-if="columns.length > 0" class="border rounded-lg overflow-hidden">
        <div class="bg-gray-50 px-4 py-2 border-b">
          <span class="font-medium">Data ({{ filteredRows.length }} baris):</span>
        </div>
        
        <div class="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th 
                  v-for="col in columns" 
                  :key="col.key" 
                  class="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap border-b border-gray-200"
                  :title="col.label"
                >
                  <!-- Potong label panjang agar header tidak terlalu lebar -->
                  {{ col.shortLabel }}
                </th>
              </tr>
              <!-- Baris kedua: label lengkap jika ada \n -->
              <tr v-if="hasMultilineHeaders" class="bg-gray-100">
                <th
                  v-for="col in columns"
                  :key="'sub-' + col.key"
                  class="px-3 py-1 text-left text-xs text-gray-400 whitespace-nowrap border-b border-gray-200 font-normal"
                >
                  {{ col.subLabel }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="(row, idx) in filteredRows" 
                :key="idx"
                :class="getRowClass(row)"
              >
                <td 
                  v-for="col in columns" 
                  :key="col.key"
                  class="px-3 py-2 whitespace-nowrap"
                >
                  {{ formatCell(row[col.key]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Raw JSON semua data -->
      <div class="mt-6">
        <label class="block text-sm font-medium mb-2">Raw JSON (semua data):</label>
        <pre class="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">{{ 
          JSON.stringify(filteredRows, null, 2)
        }}</pre>
      </div>
      
      <!-- Reset Button -->
      <button 
        @click="reset" 
        class="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Reset
      </button>
    </div>
    
    <!-- Error -->
    <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useExcelConverter } from '@/composables/useExcelConverter';

const {
  jsonResult,
  sheetNames,
  isLoading,
  error,
  convertFile,
  getSheetData,
  reset: resetConverter
} = useExcelConverter();

const fileName      = ref('');
const selectedSheet = ref('');

// columns = array { key, label, shortLabel, subLabel }
// dibaca dinamis dari baris header Excel per sheet
const columns = ref([]);

// ----------------------------------------------------------------
// Computed
// ----------------------------------------------------------------
const filteredRows = computed(() => {
  if (!selectedSheet.value || !jsonResult.value) return [];
  const raw = getSheetData(selectedSheet.value);
  return filterRows(raw);
});

const hasMultilineHeaders = computed(() =>
  columns.value.some(c => c.subLabel)
);

const statusKey = computed(() =>
  // Cari key kolom Status secara dinamis dari columns
  columns.value.find(c => c.label.toUpperCase().includes('STATUS'))?.key || null
);

const passCount = computed(() => {
  if (!statusKey.value) return 0;
  return filteredRows.value.filter(r =>
    (r[statusKey.value] || '').toString().toUpperCase() === 'PASS'
  ).length;
});

const failCount = computed(() => {
  if (!statusKey.value) return 0;
  return filteredRows.value.filter(r =>
    (r[statusKey.value] || '').toString().toUpperCase() === 'FAIL'
  ).length;
});

// ----------------------------------------------------------------
// Handle upload — sama dengan kode lama yang bisa jalan
// ----------------------------------------------------------------
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileName.value  = file.name;
  columns.value   = [];

  try {
    await convertFile(file);
    if (sheetNames.value.length > 0) {
      selectedSheet.value = sheetNames.value[0];
      buildColumns(selectedSheet.value);
    }
  } catch (err) {
    console.error('Upload failed:', err);
  }
};

const onSheetChange = () => {
  buildColumns(selectedSheet.value);
};

watch(selectedSheet, onSheetChange);

// ----------------------------------------------------------------
// buildColumns — baca header dinamis dari baris yang ada
// SERIAL + OPERATOR di sheet yang dipilih
// ----------------------------------------------------------------
const buildColumns = (sheet) => {
  if (!jsonResult.value || !sheet) return;

  const raw = getSheetData(sheet);
  columns.value = [];

  for (const row of raw) {
    const rowText = Object.values(row).join(' ').toUpperCase();
    if (rowText.includes('SERIAL') && rowText.includes('OPERATOR')) {
      // Ini baris header — baca key → label
      columns.value = Object.entries(row)
        .filter(([, val]) => val !== null && val !== undefined && val.toString().trim() !== '')
        .map(([key, val]) => {
          const fullLabel = val.toString().replace(/\r\n|\r|\n/g, ' ').trim();
          // Pisah jadi baris pertama dan kedua (untuk header 2 baris)
          const parts = val.toString().split(/\r\n|\r|\n/);
          return {
            key,
            label:      fullLabel,
            shortLabel: parts[0].trim(),
            subLabel:   parts.slice(1).join(' ').trim() || null,
          };
        });
      break;
    }
  }
};

// ----------------------------------------------------------------
// filterRows — buang header, judul, USL, LSL, baris kosong
// ----------------------------------------------------------------
function filterRows(rows) {
  let dataStartIndex = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowText = Object.values(rows[i]).join(' ').toUpperCase();
    if (rowText.includes('SERIAL') && rowText.includes('OPERATOR')) {
      dataStartIndex = i + 3; // skip: header row + USL + LSL
      break;
    }
  }

  return rows.slice(dataStartIndex).filter(row => {
    const values = Object.values(row);

    // Buang baris hampir kosong
    const filled = values.filter(v =>
      v !== null && v !== undefined && v.toString().trim() !== ''
    ).length;
    if (filled < 3) return false;

    // Buang sisa baris USL/LSL/header
    const firstFilled = values.find(v => v?.toString().trim() !== '');
    const firstStr = firstFilled?.toString().toUpperCase().trim() || '';
    if (['USL', 'LSL', 'NO', 'SERIAL NUMBER'].includes(firstStr)) return false;

    return true;
  });
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
const formatCell = (val) => {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) return val.toLocaleDateString('id-ID');
  const str = val.toString();
  if (str.startsWith('=IF(') || str.startsWith('=if(')) return '(formula)';
  return str;
};

const getRowClass = (row) => {
  if (!statusKey.value) return '';
  const s = (row[statusKey.value] || '').toString().toUpperCase().trim();
  if (s === 'PASS') return 'bg-green-50';
  if (s === 'FAIL') return 'bg-red-50';
  return '';
};

const reset = () => {
  resetConverter();
  fileName.value      = '';
  selectedSheet.value = '';
  columns.value       = [];
};
</script>