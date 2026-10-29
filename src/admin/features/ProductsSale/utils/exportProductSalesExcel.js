import * as XLSX from "xlsx";
import { formatSaleDate, formatSaleAmount } from "../schemas/productsaleSchemas.js";
import { getProductSaleSummary } from "./productSaleSummary.js";
import { getProductSaleExportTranslations } from "./productSaleExportTranslations.js";

export function exportProductSalesToExcel(
  rows,
  dateRange,
  settings = {},
  options = {}
) {
  if (!rows || rows.length === 0 || !dateRange?.startDate || !dateRange?.endDate) {
    return;
  }

  const language =
    options?.language ||
    (typeof window !== "undefined" ? localStorage.getItem("language") : "en") ||
    "en";
  const isKhmer = language.toLowerCase().startsWith("km");
  const t = getProductSaleExportTranslations(language);

  const summary = getProductSaleSummary(rows);
  const settingData = settings?.data ?? settings ?? {};
  const shopName =
    settingData.shop_name ||
    settingData.shopName ||
    settingData.name ||
    "";

  const exportData = rows.map((row, index) => [
    `#${String(index + 1).padStart(2, "0")}`,
    row.product_id,
    row.product_name || "-",
    Number(row.quantity || 0),
    Number(row.price || 0),
    Number(row.total_price || 0),
    formatSaleDate(row.sale_date, isKhmer ? "km" : "en-US"),
    row.order_no || "-",
    row.seller_name || "-",
  ]);

  const reportTitle = `${t.reportTitle} - ${dateRange.startDate} ${
    isKhmer ? "ដល់" : "TO"
  } ${dateRange.endDate}`;

  const worksheetData = [
    ...(shopName ? [[shopName.toUpperCase()]] : []),
    [reportTitle],

    [],

    [t.totalSales, summary.totalSales],
    [t.productsSold, summary.totalQuantity],
    [
      t.topSeller,
      summary.topSeller
        ? `${summary.topSeller.name} (${formatSaleAmount(summary.topSeller.total)})`
        : "-",
    ],

    [],

    [
      t.colNo,
      t.colProductId,
      t.colProductName,
      t.colQuantity,
      t.colPrice,
      t.colTotalPrice,
      t.colSaleDate,
      t.colOrderNo,
      t.colSeller,
    ],

    ...exportData,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Column widths with comfortable sizing
  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 22 },
    { wch: 24 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, t.sheetName || "Product Sales");

  const fileName = `Product_Sales_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
