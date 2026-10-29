import * as XLSX from "xlsx";
export function exportHtmlTableToExcel(
  tableOrSelector,
  fileName = "Export.xlsx",
  sheetName = "Sheet1"
) {
  if (typeof window === "undefined") return;

  const tableElement =
    typeof tableOrSelector === "string"
      ? document.querySelector(tableOrSelector)
      : tableOrSelector;

  if (!tableElement) {
    console.warn("[excelExportUtils] HTML Table element not found.");
    return;
  }

  // Convert HTML Table DOM element directly to SheetJS Workbook
  const workbook = XLSX.utils.table_to_book(tableElement, {
    sheet: sheetName,
    raw: false,
  });

  const safeFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
}

