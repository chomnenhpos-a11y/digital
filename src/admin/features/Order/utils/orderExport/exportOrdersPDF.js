import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { setupBattambangFont } from "../../../../../utils/pdfFontLoader.js";
import {
  isKhmerText,
  drawKhmerInAutoTableCell,
  drawKhmerText,
} from "../../../../../utils/khmerPdfShaper.js";
import { getOrderExportSummary } from "./orderExportSummary.js";
import {
  getOrderExportTranslations,
  translateOrderStatus,
} from "./orderExportTranslations.js";

const JsPDFDocument =
  typeof jsPDF === "function" ? jsPDF : jsPDF?.jsPDF || jsPDF;

const applyAutoTable =
  typeof autoTable === "function"
    ? autoTable
    : autoTable?.default || autoTable;

export function formatOrderDate(orderDate, locale = "en-US") {
  if (!orderDate) return "-";

  const date = new Date(orderDate);

  if (Number.isNaN(date.getTime())) return String(orderDate);

  return date.toLocaleString(locale === "km" ? "en-GB" : locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatOrderAmount(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getLogoUrl(rawLogo) {
  if (!rawLogo || typeof rawLogo !== "string") return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(rawLogo)) {
    return rawLogo;
  }

  const baseUrl = import.meta.env?.VITE_API_URL?.replace(/\/$/, "") || "";

  return `${baseUrl}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`;
}

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

          if (!ctx) {
            resolve({ img, width, height });
            return;
          }

          ctx.drawImage(img, 0, 0);

          resolve({
            dataUrl: canvas.toDataURL("image/png"),
            width,
            height,
          });
        } catch {
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

export async function exportOrdersToPDF(
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
  const summary = getOrderExportSummary(orders);

  const doc = new JsPDFDocument({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Register Battambang font in jsPDF VFS + browser FontFace
  const fontReady = await setupBattambangFont(doc);
  const fontName = fontReady ? "Battambang" : "helvetica";

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const rightX = pageWidth - margin;
  const centerX = pageWidth / 2;

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

  const imageInfo = await loadImageData(getLogoUrl(rawLogo));

  let leftContentX = margin;
  let currentY = 15;

  if (imageInfo) {
    const maxLogoSize = 18;
    const aspect = (imageInfo.width || 1) / (imageInfo.height || 1);

    let logoW = maxLogoSize;
    let logoH = maxLogoSize / aspect;

    if (logoH > maxLogoSize) {
      logoH = maxLogoSize;
      logoW = maxLogoSize * aspect;
    }

    try {
      doc.addImage(
        imageInfo.dataUrl || imageInfo.img,
        "PNG",
        margin,
        10,
        logoW,
        logoH
      );

      leftContentX = margin + logoW + 5;
      currentY = 15;
    } catch {
      leftContentX = margin;
    }
  }

  // Shop name (left)
  doc.setFont(fontName, "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(shopName, leftContentX, currentY);

  doc.setFont(fontName, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  if (phone) {
    currentY += 5;
    const phoneText = `${t.tel} ${phone}`;
    
    if (isKhmer) {
      drawKhmerText(doc, phoneText, leftContentX, currentY, {
        fontSize: 8.5,
        color: "#64748b", // ពណ៌ត្រូវគ្នានឹង rgb(100, 116, 139)
        align: "left",
      });
    } else {
      doc.text(phoneText, leftContentX, currentY);
    }
  }

  if (address) {
    currentY += 4.5;

    const splitAddress = doc.splitTextToSize(address, 105);

    doc.text(splitAddress, leftContentX, currentY);

    currentY += (splitAddress.length - 1) * 3.5;
  }

  // Report title (right) — use canvas shaper for Khmer
  if (isKhmer) {
    drawKhmerText(doc, t.reportTitle, rightX, 15, {
      fontSize: 13,
      bold: true,
      color: "#870d4c",
      align: "right",
    });
  } else {
    doc.setFont(fontName, "bold");
    doc.setFontSize(13);
    doc.setTextColor(135, 13, 76);
    doc.text(t.reportTitle, rightX, 15, { align: "right" });
  }

  doc.setFont(fontName, "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const periodLabel = `${t.periodPrefix} ${reportPeriod || t.allDates}`;
  if (isKhmer) {
    drawKhmerText(doc, periodLabel, rightX, 21, {
      fontSize: 9,
      color: "#475569",
      align: "right",
    });
  } else {
    doc.text(periodLabel, rightX, 21, { align: "right" });
  }

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);

  const genDate = `${t.generated} ${new Date().toLocaleDateString(isKhmer ? "km-KH" : "en-GB")}`;
  if (isKhmer) {
    drawKhmerText(doc, genDate, rightX, 26, {
      fontSize: 8.5,
      color: "#94a3b8",
      align: "right",
    });
  } else {
    doc.text(genDate, rightX, 26, { align: "right" });
  }

  const dividerY = Math.max(currentY + 7, 34);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, dividerY, rightX, dividerY);

  // Table data
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.createAt || 0);
    const dateB = new Date(b.createdAt || b.createAt || 0);
    return dateA - dateB;
  });

  const tableData = sortedOrders.map((order) => {
    const totalAmount = Number(order.totalAmount || order.total || 0);
    const deliveryFee = Number(order.deliveryProvider?.shippingFee || 0);
    const subTotal = totalAmount - deliveryFee;

    return [
      order.orderNo ||
        (order.orderNumber
          ? `ORD-${order.orderNumber}`
          : `#${order.id || ""}`),

      order.customerPhone || order.phone || "-",

      formatOrderAmount(totalAmount),

      formatOrderAmount(subTotal),

      `${order.deliveryProvider?.name || "-"} (${formatOrderAmount(deliveryFee)})`,

      translateOrderStatus(order.paymentStatus, language),
      translateOrderStatus(order.status, language),
      order.seller?.name || "-",
      formatOrderDate(order.createdAt || order.createAt, isKhmer ? "km" : "en-US"),
    ];
  });

  const tableHeaders = [
    t.colOrderNo,
    t.colCustomerPhone,
    t.colTotalAmount,
    t.colSubTotal,
    t.colDelivery,
    t.colPaymentStatus,
    t.colDeliveryStatus,
    t.colSeller,
    t.colOrderDate,
  ];

  const pageTotals = {};
  const tableStartY = dividerY + 5;

  applyAutoTable(doc, {
    startY: tableStartY,

    head: [tableHeaders],

    body: tableData,

    theme: "grid",

    margin: {
      top: 12,
      bottom: 23,
      left: margin,
      right: margin,
    },

    showHead: "everyPage",

    styles: {
      font: fontName,
      fontSize: 8,
      cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [226, 232, 240],
      overflow: "linebreak",
    },

    headStyles: {
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: { top: 3, right: 1.5, bottom: 3, left: 1.5 },
      fillColor: [135, 13, 76],
      textColor: [255, 255, 255],
      lineColor: [135, 13, 76],
    },

    alternateRowStyles: {
      fillColor: [252, 250, 251],
    },

    columnStyles: {
      0: { halign: "center", cellWidth: "auto" },
      1: { halign: "center", cellWidth: 29 },
      2: { halign: "right", cellWidth: 25 },
      3: { halign: "right", cellWidth: 25 },
      4: { halign: "center", cellWidth: 31 },
      5: { halign: "center", cellWidth: 27 },
      6: { halign: "center", cellWidth: 27 },
      7: { halign: "center", cellWidth: 25 },
      8: { halign: "center", cellWidth: "auto" },
    },

    // Prevent autoTable from drawing unshaped broken glyphs; save lines for shaped overlay
    willDrawCell(data) {
      if (isKhmer && isKhmerText(data.cell.raw)) {
        data.cell._khmerLines =
          Array.isArray(data.cell.text) && data.cell.text.length > 0
            ? [...data.cell.text]
            : [String(data.cell.raw || "")];
        data.cell.text = [];
      }
    },

    didDrawCell(data) {
      // Accumulate page totals (same as original logic)
      if (data.section === "body" && data.column.index === 0) {
        const order = sortedOrders[data.row.index];
        const pageNumber = data.pageNumber;

        if (!pageTotals[pageNumber]) {
          pageTotals[pageNumber] = 0;
        }

        pageTotals[pageNumber] += Number(
          order?.totalAmount || order?.total || 0
        );
      }

      // Overlay shaped Khmer text
      if (isKhmer && isKhmerText(data.cell.raw)) {
        drawKhmerInAutoTableCell(doc, data);
      }
    },

    didDrawPage(data) {
      const pageNumber = data.pageNumber;

      const pageTotalLabel = `${t.pageTotal} ${pageNumber}: ${formatOrderAmount(
        pageTotals[pageNumber] || 0
      )}`;

      if (isKhmer) {
        drawKhmerText(doc, pageTotalLabel, rightX, pageHeight - 14, {
          fontSize: 9,
          bold: true,
          color: "#870d4c",
          align: "right",
        });
      } else {
        doc.setFont(fontName, "bold");
        doc.setFontSize(9);
        doc.setTextColor(135, 13, 76);
        doc.text(pageTotalLabel, rightX, pageHeight - 14, { align: "right" });
      }
    },
  });

  // Summary Page (same layout as original)
  doc.addPage();

  const summaryTitle = t.orderSummary;
  if (isKhmer) {
    drawKhmerText(doc, summaryTitle, centerX, 25, {
      fontSize: 18,
      bold: true,
      color: "#870d4c",
      align: "center",
    });
  } else {
    doc.setFont(fontName, "bold");
    doc.setFontSize(18);
    doc.setTextColor(135, 13, 76);
    doc.text(summaryTitle, centerX, 25, { align: "center" });
  }

  const summarySubtitle = [`${t.periodPrefix} ${reportPeriod || t.allDates}`]
    .filter(Boolean)
    .join(" · ");

  if (isKhmer) {
    drawKhmerText(doc, summarySubtitle, centerX, 32, {
      fontSize: 9.5,
      color: "#64748b",
      align: "center",
    });
  } else {
    doc.setFont(fontName, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(summarySubtitle, centerX, 32, { align: "center" });
  }

  const summaryRows = [
    [t.totalOrders, String(summary.totalOrders || 0)],
    [t.totalSales, formatOrderAmount(summary.totalSales)],
    [
      t.paidAmount,
      `${formatOrderAmount(summary.paidAmount)} (${summary.paidOrders || 0} ${t.ordersUnit})`,
    ],
    [
      t.unpaidAmount,
      `${formatOrderAmount(summary.unpaidAmount)} (${summary.unpaidOrders || 0} ${t.ordersUnit})`,
    ],
    [t.completedOrders, String(summary.completedOrders || 0)],
    [t.pendingOrders, String(summary.pendingOrders || 0)],
    [t.cancelledOrders, String(summary.cancelledOrders || 0)],
  ];

  applyAutoTable(doc, {
    startY: 41,

    head: [[t.metric, t.result]],

    body: summaryRows,

    theme: "grid",

    margin: {
      left: 35,
      right: 35,
    },

    styles: {
      font: fontName,
      fontSize: 10,
      cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
      valign: "middle",
      lineWidth: 0.1,
      lineColor: [226, 232, 240],
    },

    headStyles: {
      fontSize: 10,
      fontStyle: "bold",
      cellPadding: 4,
      fillColor: [135, 13, 76],
      textColor: [255, 255, 255],
    },

    alternateRowStyles: {
      fillColor: [252, 250, 251],
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

    willDrawCell(data) {
      if (isKhmer && isKhmerText(data.cell.raw)) {
        data.cell._khmerLines =
          Array.isArray(data.cell.text) && data.cell.text.length > 0
            ? [...data.cell.text]
            : [String(data.cell.raw || "")];
        data.cell.text = [];
      }
    },

    didDrawCell(data) {
      if (isKhmer && isKhmerText(data.cell.raw)) {
        drawKhmerInAutoTableCell(doc, data);
      }
    },
  });

  // Footer on all pages (Shop name and Page Number)
  const totalPagesCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPagesCount; i++) {
    doc.setPage(i);

    const footerLeft = `${shopName} · ${t.monthlyReport}`;
    const footerRight = t.pageOf
      .replace("{current}", String(i))
      .replace("{total}", String(totalPagesCount));

    if (isKhmer) {
      drawKhmerText(doc, footerLeft, margin, pageHeight - 7, {
        fontSize: 8,
        color: "#94a3b8",
        align: "left",
      });
      drawKhmerText(doc, footerRight, rightX, pageHeight - 7, {
        fontSize: 8,
        color: "#94a3b8",
        align: "right",
      });
    } else {
      doc.setFont(fontName, "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(footerLeft, margin, pageHeight - 7);
      doc.text(footerRight, rightX, pageHeight - 7, { align: "right" });
    }
  }

  const safePeriod = (reportPeriod || new Date().toISOString().slice(0, 10))
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "");
  const fileName = `Order_Report_${safePeriod}.pdf`;

  if (typeof doc.save === "function") {
    try {
      doc.save(fileName);
    } catch {
    }
  }

  return doc;
}
