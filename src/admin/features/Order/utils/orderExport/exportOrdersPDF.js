import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getOrderExportSummary } from "./orderExportSummary.js";

const JsPDFDocument = typeof jsPDF === "function" ? jsPDF : jsPDF?.jsPDF || jsPDF;
const applyAutoTable = typeof autoTable === "function" ? autoTable : autoTable?.default || autoTable;

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
 * Formats currency amount for report display (e.g. "$45.00").
 *
 * @param {number|string} value
 * @returns {string}
 */
export function formatOrderAmount(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

/**
 * Resolves full logo URL from raw setting path or external link.
 *
 * @param {string} rawLogo - Raw logo path or URL from settings
 * @returns {string} Full URL or empty string
 */
function getLogoUrl(rawLogo) {
  if (!rawLogo || typeof rawLogo !== "string") return "";
  if (
    rawLogo.startsWith("http://") ||
    rawLogo.startsWith("https://") ||
    rawLogo.startsWith("data:") ||
    rawLogo.startsWith("blob:")
  ) {
    return rawLogo;
  }
  const baseUrl = import.meta.env?.VITE_API_URL?.replace(/\/$/, "") || "";
  return `${baseUrl}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`;
}

/**
 * Preloads image and converts to PNG Data URL so jsPDF can embed cleanly.
 *
 * @param {string} url - Image URL
 * @returns {Promise<{ dataUrl?: string, img?: any, width: number, height: number } | null>}
 */
async function loadImageData(url) {
  if (!url || typeof window === "undefined" || typeof Image === "undefined") {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const width = img.naturalWidth || img.width || 100;
          const height = img.naturalHeight || img.height || 100;
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            resolve({ dataUrl, width, height });
            return;
          }
          resolve({ img, width, height });
        } catch {
          // If canvas is tainted due to CORS, fall back to passing the loaded img directly
          resolve({
            img,
            width: img.naturalWidth || 100,
            height: img.naturalHeight || 100,
          });
        }
      };

      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Exports the monthly order report to a high-quality PDF document.
 * Matches 100% of the concept design style used in exportProductSalesToPDF:
 * - Shop Branding (Logo, Name, Phone, Address)
 * - Executive Maroon theme (#870d4c)
 * - Per-page running totals ("Total for Page X: $...")
 * - Running footer on all pages
 * - Dedicated Executive Summary final page
 *
 * @param {Array<object>} orders - Filtered order records
 * @param {string} selectedMonth - Selected month string (e.g. "2026-10")
 * @param {object} [settings] - Shop settings from useSettingsQuery
 * @returns {Promise<object|undefined>}
 */
export async function exportOrdersToPDF(orders, selectedMonth, settings = {}) {
  if (!orders || orders.length === 0) return;

  const summary = getOrderExportSummary(orders);

  const doc = new JsPDFDocument({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // Extract shop settings
  const settingData = settings?.data ?? settings ?? {};
  const shopName =
    settingData.shop_name ||
    settingData.shopName ||
    settingData.name ||
    "Chomnenh Shop";
  const rawLogo = settingData.logo || settingData.shop_logo;
  const phone =
    settingData.phone ||
    settingData.telephone ||
    settingData.contact_phone ||
    "";
  const address =
    settingData.address ||
    settingData.shop_address ||
    "";

  // Preload shop logo image safely
  const logoUrl = getLogoUrl(rawLogo);
  const imageInfo = await loadImageData(logoUrl);

  // Top header layout
  let leftContentX = 14;
  let headerHeight = 24;

  if (imageInfo) {
    const maxBoxSize = 18; // mm
    const aspect = (imageInfo.width || 1) / (imageInfo.height || 1);
    let logoW = maxBoxSize;
    let logoH = maxBoxSize / aspect;
    if (logoH > maxBoxSize) {
      logoH = maxBoxSize;
      logoW = maxBoxSize * aspect;
    }

    try {
      doc.addImage(
        imageInfo.dataUrl || imageInfo.img,
        "PNG",
        14,
        10,
        logoW,
        logoH
      );
      leftContentX = 14 + logoW + 5;
      headerHeight = Math.max(headerHeight, logoH + 6);
    } catch {
      leftContentX = 14;
    }
  }

  // Shop Details (Left)
  let currentY = 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(shopName, leftContentX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500

  if (phone) {
    currentY += 5;
    doc.text(`Tel: ${phone}`, leftContentX, currentY);
  }

  if (address) {
    currentY += 4.5;
    const splitAddress = doc.splitTextToSize(address, 115);
    doc.text(splitAddress, leftContentX, currentY);
    currentY += (splitAddress.length - 1) * 3.5;
  }

  // Month Title
  const [year, monthStr] = (selectedMonth || "").split("-");
  const yearNumber = Number(year);
  const monthNumber = Number(monthStr);
  const monthDate = yearNumber && monthNumber ? new Date(yearNumber, monthNumber - 1, 1) : new Date();
  const monthName = !isNaN(monthDate.getTime())
    ? monthDate.toLocaleString("en-US", { month: "long" })
    : "";

  // Report Details (Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(135, 13, 76); // Brand primary #870d4c
  doc.text("MONTHLY ORDER REPORT", pageWidth - 14, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Period: ${monthName} ${year || ""}`.trim(),
    pageWidth - 14,
    21,
    { align: "right" }
  );

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB")}`,
    pageWidth - 14,
    26,
    { align: "right" }
  );

  // Separator line
  const dividerY = Math.max(currentY + 5, 33);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(14, dividerY, pageWidth - 14, dividerY);

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.createAt || 0);
    const dateB = new Date(b.createdAt || b.createAt || 0);
    return dateA - dateB;
  });

  const tableData = sortedOrders.map((order, index) => [
    `#${String(index + 1).padStart(2, "0")}`,
    order.orderNo || (order.orderNumber ? `ORD-${order.orderNumber}` : `#${order.id || ""}`),
    order.customerPhone || order.phone || "-",
    formatOrderAmount(order.totalAmount || order.total || 0),
    order.paymentStatus || "-",
    order.status || "-",
    formatOrderDate(order.createdAt || order.createAt),
  ]);

  // Track running total amount for each page
  const pageTotals = {};
  const tableStartY = dividerY + 4;

  applyAutoTable(doc, {
    startY: tableStartY,

    head: [[
      "No",
      "Order No",
      "Customer Phone",
      "Total Amount",
      "Payment Status",
      "Delivery Status",
      "Order Date",
    ]],

    body: tableData,

    theme: "grid",

    margin: {
      top: 20,
      bottom: 22,
      left: 14,
      right: 14,
    },

    showHead: "everyPage",

    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      valign: "middle",
      lineWidth: 0.1,
    },

    headStyles: {
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      fillColor: [135, 13, 76], // Brand primary #870d4c
      textColor: [255, 255, 255],
    },

    columnStyles: {
      0: { halign: "center", cellWidth: 16 },
      1: { cellWidth: 42 },
      2: { cellWidth: 38 },
      3: { halign: "right", cellWidth: 32 },
      4: { halign: "center", cellWidth: 32 },
      5: { halign: "center", cellWidth: 35 },
      6: { halign: "center", cellWidth: "auto" },
    },

    didDrawCell(data) {
      if (
        data.section !== "body" ||
        data.column.index !== 0
      ) {
        return;
      }

      const order = sortedOrders[data.row.index];
      const pageNumber = data.pageNumber;

      if (!pageTotals[pageNumber]) {
        pageTotals[pageNumber] = 0;
      }

      pageTotals[pageNumber] += Number(
        order?.totalAmount || order?.total || 0
      );
    },

    didDrawPage(data) {
      const pageNumber = data.pageNumber;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(135, 13, 76);

      doc.text(
        `Total for Page ${pageNumber}: ${formatOrderAmount(
          pageTotals[pageNumber] || 0
        )}`,
        pageWidth - 14,
        pageHeight - 14,
        { align: "right" }
      );
    },
  });

  // Dedicated Executive Summary Page
  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(135, 13, 76);
  doc.text("Order Summary", centerX, 24, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);

  doc.text(
    `${shopName} · Period: ${monthName} ${year || ""}`.trim(),
    centerX,
    31,
    { align: "center" }
  );

  const summaryRows = [
    [
      "Total Orders",
      String(summary.totalOrders || 0),
    ],
    [
      "Total Sales",
      formatOrderAmount(summary.totalSales),
    ],
    [
      "Paid Amount",
      `${formatOrderAmount(summary.paidAmount)} (${summary.paidOrders || 0} orders)`,
    ],
    [
      "Unpaid Amount",
      `${formatOrderAmount(summary.unpaidAmount)} (${summary.unpaidOrders || 0} orders)`,
    ],
    [
      "Completed Orders",
      String(summary.completedOrders || 0),
    ],
    [
      "Pending Orders",
      String(summary.pendingOrders || 0),
    ],
    [
      "Cancelled Orders",
      String(summary.cancelledOrders || 0),
    ],
  ];

  applyAutoTable(doc, {
    startY: 40,

    head: [["Metric", "Result"]],

    body: summaryRows,

    theme: "grid",

    margin: {
      left: 35,
      right: 35,
    },

    styles: {
      font: "helvetica",
      fontSize: 11,
      cellPadding: 6,
      valign: "middle",
      lineWidth: 0.15,
    },

    headStyles: {
      fontStyle: "bold",
      fillColor: [135, 13, 76],
      textColor: [255, 255, 255],
    },

    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 65,
      },
      1: {
        cellWidth: "auto",
      },
    },
  });

  // Footer on all pages (Shop name and Page Number)
  const totalPagesCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPagesCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.text(
      `${shopName} · Monthly Order Report`,
      14,
      pageHeight - 8
    );
    doc.text(
      `Page ${i} of ${totalPagesCount}`,
      pageWidth - 14,
      pageHeight - 8,
      { align: "right" }
    );
  }

  const fileName = selectedMonth
    ? `Order_Report_${selectedMonth}.pdf`
    : `Order_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

  if (typeof doc.save === "function") {
    try {
      doc.save(fileName);
    } catch {
      // In non-browser / test environments
    }
  }

  return doc;
}
