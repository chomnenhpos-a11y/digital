import * as XLSX from "xlsx";
import { getOrderExportSummary } from "./orderExportSummary.js";

/**
 * Formats an order date for report display (e.g. "10/28/2026, 04:30 PM").
 *
 * @param {string|Date} orderDate
 * @param {string} [locale="en-US"]
 * @returns {string}
 */
export function formatOrderDate(orderDate, locale = "en-US") {
  if (!orderDate) return "-";
  const date = new Date(orderDate);
  if (Number.isNaN(date.getTime())) return String(orderDate);
  return date.toLocaleString(locale === "km" ? "en-GB" : locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats currency amount for display consistency.
 *
 * @param {number|string} value
 * @returns {string}
 */
export function formatOrderAmount(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

/**
 * Exports the filtered order report to an Excel workbook.
 * Matches the layout and executive styling of exportProductSalesToExcel.
 *
 * @param {Array} orders - Filtered order records
 * @param {string} reportPeriod - Date range or period description for the report
 * @param {object} [settings] - Shop settings from useSettingsQuery
 * @returns {{ workbook: object, worksheet: object, fileName: string } | undefined}
 */
export function exportOrdersToExcel(orders, reportPeriod, settings = {}) {
  if (!orders || orders.length === 0) return;

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.createAt || 0);
    const dateB = new Date(b.createdAt || b.createAt || 0);
    return dateA - dateB;
  });

  const summary = getOrderExportSummary(sortedOrders);

  const settingData = settings?.data ?? settings ?? {};
  const shopName =
    settingData.shop_name ||
    settingData.shopName ||
    settingData.name ||
    "";

  const reportTitle = reportPeriod
    ? `ORDER REPORT - ${reportPeriod.toUpperCase()}`
    : "ORDER REPORT";

  const exportData = sortedOrders.map((order, index) => [
    `#${String(index + 1).padStart(2, "0")}`,
    order.orderNo || (order.orderNumber ? `ORD-${order.orderNumber}` : `#${order.id || ""}`),
    order.customerPhone || order.phone || "-",
    Number(order.totalAmount || order.total || 0),
    order.paymentStatus || "-",
    order.status || "-",
    formatOrderDate(order.createdAt || order.createAt),
  ]);

  const worksheetData = [
    ...(shopName ? [[shopName.toUpperCase()]] : []),
    [reportTitle],

    [],

    ["Total Orders", summary.totalOrders],
    ["Total Sales", summary.totalSales],
    ["Paid Amount", summary.paidAmount],
    ["Unpaid Amount", summary.unpaidAmount],
    ["Completed Orders", summary.completedOrders],

    [],

    [
      "No",
      "Order No",
      "Customer Phone",
      "Total Amount",
      "Payment Status",
      "Delivery Status",
      "Order Date",
    ],

    ...exportData,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Column widths matching ProductsSale Excel style
  worksheet["!cols"] = [
    { wch: 6 },   // No
    { wch: 22 },  // Order No
    { wch: 18 },  // Customer Phone
    { wch: 14 },  // Total Amount
    { wch: 16 },  // Payment Status
    { wch: 16 },  // Delivery Status
    { wch: 24 },  // Order Date
  ];

  // Apply currency number formatting ($#,##0.00) dynamically
  for (let r = 0; r < worksheetData.length; r++) {
    const row = worksheetData[r];
    if (
      row[0] === "Total Sales" ||
      row[0] === "Paid Amount" ||
      row[0] === "Unpaid Amount"
    ) {
      const cellAddress = XLSX.utils.encode_cell({ r, c: 1 });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].z = "$#,##0.00";
      }
    }
  }

  const headerRowIdx = worksheetData.findIndex((row) => row[0] === "No");
  if (headerRowIdx !== -1) {
    for (let r = headerRowIdx + 1; r < worksheetData.length; r++) {
      const totalCellAddress = XLSX.utils.encode_cell({ r, c: 3 });
      if (worksheet[totalCellAddress]) {
        worksheet[totalCellAddress].z = "$#,##0.00";
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  const safePeriod = (reportPeriod || new Date().toISOString().slice(0, 10))
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "");
  const fileName = `Order_Report_${safePeriod}.xlsx`;

  if (typeof XLSX.writeFile === "function") {
    try {
      XLSX.writeFile(workbook, fileName);
    } catch {
      // In non-browser / test environments
    }
  }

  return { workbook, worksheet, fileName };
}
