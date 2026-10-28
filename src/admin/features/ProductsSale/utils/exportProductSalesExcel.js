import * as XLSX from "xlsx";
import { formatSaleDate, formatSaleAmount } from "../schemas/productsaleSchemas.js";
import { getProductSaleSummary } from "./productSaleSummary.js";

/**
 * Exports the product-sales report to an Excel workbook.
 * Mirrors the monthly order report export (orderExport/exportOrdersExcel).
 *
 * @param {Array} rows - Normalized product-sale rows
 * @param {{ startDate: string, endDate: string }} dateRange
 * @param {object} [settings] - Shop settings from useSettingsQuery
 */
export function exportProductSalesToExcel(rows, dateRange, settings = {}) {
  if (!rows || rows.length === 0 || !dateRange?.startDate || !dateRange?.endDate) {
    return;
  }

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
    formatSaleDate(row.sale_date),
    row.order_no || "-",
    row.seller_name || "-",
  ]);

  const worksheetData = [
    ...(shopName ? [[shopName.toUpperCase()]] : []),
    [
      `PRODUCT SALES REPORT - ${dateRange.startDate} TO ${dateRange.endDate}`,
    ],

    [],

    ["Total Sales", summary.totalSales],
    ["Products Sold", summary.totalQuantity],
    ["Top Seller", summary.topSeller ? `${summary.topSeller.name} (${formatSaleAmount(summary.topSeller.total)})` : "-"],

    [],

    [
      "No",
      "Product ID",
      "Product Name",
      "Quantity",
      "Price",
      "Total Price",
      "Sale Date",
      "Order No",
      "Seller",
    ],

    ...exportData,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Money + quantity columns are exported as real numbers
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 28 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 22 },
    { wch: 24 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Product Sales");

  XLSX.writeFile(workbook, `Product_Sales_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
}
