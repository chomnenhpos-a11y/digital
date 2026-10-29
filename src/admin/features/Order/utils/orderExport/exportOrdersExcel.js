import * as XLSX from "xlsx";
import { getOrderExportSummary } from "./orderExportSummary.js";
import {
  getOrderExportTranslations,
  translateOrderStatus,
} from "./orderExportTranslations.js";

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

export function formatOrderAmount(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function exportOrdersToExcel(
  orders,
  reportPeriod,
  settings = {},
  options = {}
) {
  if (!orders || orders.length === 0) return;

  const language =
    options?.language ||
    (typeof window !== "undefined" ? localStorage.getItem("language") : "en") ||
    "en";
  const isKhmer = language.toLowerCase().startsWith("km");
  const t = getOrderExportTranslations(language);

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

  const periodDisplay = reportPeriod || t.allDates;
  const reportTitle = `${t.reportTitle} - ${periodDisplay}`;

  const exportData = sortedOrders.map((order, index) => [
    `#${String(index + 1).padStart(2, "0")}`,
    order.orderNo || (order.orderNumber ? `ORD-${order.orderNumber}` : `#${order.id || ""}`),
    order.customerPhone || order.phone || "-",
    Number(order.totalAmount || order.total || 0),
    translateOrderStatus(order.paymentStatus, language),
    translateOrderStatus(order.status, language),
    formatOrderDate(order.createdAt || order.createAt, isKhmer ? "km" : "en-US"),
  ]);

  const worksheetData = [
    ...(shopName ? [[shopName.toUpperCase()]] : []),
    [reportTitle],

    [],

    [t.totalOrders, summary.totalOrders],
    [t.totalSales, summary.totalSales],
    [t.paidAmount, summary.paidAmount],
    [t.unpaidAmount, summary.unpaidAmount],
    [t.completedOrders, summary.completedOrders],

    [],

    [
      t.colNo,
      t.colOrderNo,
      t.colCustomerPhone,
      t.colTotalAmount,
      t.colPaymentStatus,
      t.colDeliveryStatus,
      t.colOrderDate,
    ],

    ...exportData,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Column widths with extra padding for Khmer text
  worksheet["!cols"] = [
    { wch: 8 },   // No
    { wch: 22 },  // Order No
    { wch: 20 },  // Customer Phone
    { wch: 18 },  // Total Amount
    { wch: 20 },  // Payment Status
    { wch: 20 },  // Delivery Status
    { wch: 24 },  // Order Date
  ];

  // Apply currency number formatting ($#,##0.00) dynamically
  for (let r = 0; r < worksheetData.length; r++) {
    const row = worksheetData[r];
    if (
      row[0] === t.totalSales ||
      row[0] === t.paidAmount ||
      row[0] === t.unpaidAmount ||
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

  const headerRowIdx = worksheetData.findIndex(
    (row) => row[0] === t.colNo || row[0] === "No"
  );
  if (headerRowIdx !== -1) {
    for (let r = headerRowIdx + 1; r < worksheetData.length; r++) {
      const totalCellAddress = XLSX.utils.encode_cell({ r, c: 3 });
      if (worksheet[totalCellAddress]) {
        worksheet[totalCellAddress].z = "$#,##0.00";
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, t.sheetName || "Orders");

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
