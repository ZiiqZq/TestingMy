# Export Flow Summary - Univer to Excel

## Arsitektur Export

### 1. **UniverSheet.vue** (View Component)
- Button "📥 Export Excel" trigger `handleExport()`
- Get snapshot dari workbook aktif via Facade API
- Call `exportUniverToExcelAdvanced()` dari excelConverter.ts
- Show notification dengan hasil

### 2. **excelConverter.ts** (Main Logic)
```typescript
export async function exportUniverToExcelAdvanced(
  workbookData: Partial<IWorkbookData>,
  options?: ExcelExportOptions
): Promise<void>
```

**Features:**
- ✅ Cell values (STRING, NUMBER, BOOLEAN, FORCE_STRING)
- ✅ Formulas (stored as `{ formula: 'B2*C2' }`)
- ✅ Styling dengan border dan background color
- ✅ Column widths dan row heights
- ✅ Merged cells
- ✅ Multiple sheets support

### 3. **Style Application** (applyUniversStyleToExcelCell)
```typescript
- Font: name, size, bold, italic, underline, color
- Fill: background color dengan pattern 'solid'
- Border: top, bottom, left, right dengan style dan color
- Alignment: horizontal, vertical, text wrap
- Number format
```

## Cell Type Mapping

| Univer Type | Value | Excel Type |
|-------------|-------|-----------|
| STRING | 1 | s (string) |
| NUMBER | 2 | n (number) |
| BOOLEAN | 3 | b (boolean) |
| FORCE_STRING | 4 | s (string) |

## Export Flow Sequence

```
1. User klik "Export Excel" button
   ↓
2. handleExport() di UniverSheet.vue
   ↓
3. Get active workbook via Facade API
   ↓
4. Get snapshot: activeWorkbook.getSnapshot()
   ↓
5. Call exportUniverToExcelAdvanced(snapshot)
   ↓
6. Create ExcelJS Workbook
   ↓
7. For each sheet in sheetOrder:
   - Create worksheet
   - For each cell in cellData:
     * Set value (formula or regular)
     * Apply styling (applyUniversStyleToExcelCell)
   - Set column widths
   - Set row heights
   - Merge cells
   ↓
8. Write file: workbook.xlsx.writeFile(filename)
   ↓
9. Show success notification
```

## Styling yang Disupport

### ✅ Colors
- Font color: `#RRGGBB` format
- Background color: `#RRGGBB` format (converted to ARGB for Excel)
- Border color: per-side dengan `#RRGGBB` format

### ✅ Border Styles
- NONE (0)
- THIN (1)
- MEDIUM (2)
- THICK (3)
- DASHED (4)
- DOTTED (5)
- DOUBLE (6)

### ✅ Text Alignment
- Horizontal: LEFT (1), CENTER (2), RIGHT (3)
- Vertical: TOP (1), MIDDLE (2), BOTTOM (3)
- Text Wrap

### ✅ Formulas
- Format: `=B2*C2` (standard Excel formula)
- Support: SUM, COUNT, IF, dll (semua Excel function)

## Testing Checklist

- [ ] Build successfully: `npm run build` ✅
- [ ] No TypeScript errors ✅
- [ ] Import export functions work
- [ ] Cell values exported correctly
- [ ] Border muncul di Excel file
- [ ] Background color muncul di Excel file
- [ ] Formula menampilkan hasil kalkulasi
- [ ] Multiple sheets export
- [ ] Styling preserved (font, alignment, dll)

## Files Involved

1. **src/components/layouts/UniverSheet.vue**
   - Handle UI dan export button
   - Get snapshot via Facade API
   
2. **src/utils/excelConverter.ts**
   - Main export function: `exportUniverToExcelAdvanced`
   - Style conversion: `applyUniversStyleToExcelCell`
   - Helper functions untuk border, alignment, dll

3. **src/utils/excelExport.ts** (Backup/Alternative)
   - Alternative export function: `exportUniverToExcelWithStyles`
   - Dynamic import approach untuk compatibility

## Notes

- ExcelJS digunakan untuk reliable styling support
- Static import di excelConverter.ts (sudah available)
- All cell values correctly typed per Univer standard
- Formula formula automatically calculated oleh Excel saat dibuka
- RGBA colors NOT supported (can cause transparency issues)
