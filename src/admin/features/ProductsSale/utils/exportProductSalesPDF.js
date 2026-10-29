import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { setupBattambangFont } from "../../../../utils/pdfFontLoader.js";
import {
  isKhmerText,
  drawKhmerInAutoTableCell,
  drawKhmerText,
} from "../../../../utils/khmerPdfShaper.js";
import { getProductSaleExportTranslations } from "./productSaleExportTranslations.js";
import {
  formatSaleDate,
  formatSaleAmount,
} from "../schemas/productsaleSchemas.js";
import { getProductSaleSummary } from "./productSaleSummary.js";

const JsPDFDocument =
  typeof jsPDF === "function" ? jsPDF : jsPDF?.jsPDF || jsPDF;
const applyAutoTable =
  typeof autoTable === "function" ? autoTable : autoTable?.default || autoTable;

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

export async function exportProductSalesToPDF(
  rows,
  dateRange,
  settings = {},
  options = {},
) {
  if (!rows?.length || !dateRange?.startDate || !dateRange?.endDate) {
    return;
  }

  const language =
    options?.language ||
    (typeof window !== "undefined" ? localStorage.getItem("language") : "en") ||
    "en";
  const isKhmer = language.toLowerCase().startsWith("km");
  const t = getProductSaleExportTranslations(language);
  const summary = getProductSaleSummary(rows);

  const doc = new JsPDFDocument({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Register Battambang font
  const fontReady = await setupBattambangFont(doc);
  const fontName = fontReady ? "Battambang" : "helvetica";

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
  const address = settingData.address || settingData.shop_address || "";

  // Preload shop logo image safely
  const logoUrl = getLogoUrl(rawLogo);
  const imageInfo = await loadImageData(logoUrl);

  // Top header layout (same as original)
  let leftContentX = 14;
  let headerHeight = 24;

  if (imageInfo) {
    const maxBoxSize = 18;
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
        logoH,
      );
      leftContentX = 14 + logoW + 5;
      headerHeight = Math.max(headerHeight, logoH + 6);
    } catch {
      leftContentX = 14;
    }
  }

  // Shop Details (Left)
  let currentY = 15;
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
        color: "#64748b",
        align: "left",
      });
    } else {
      doc.text(phoneText, leftContentX, currentY);
    }
  }

  if (address) {
    currentY += 4.5;
    const splitAddress = doc.splitTextToSize(address, 115);
    doc.text(splitAddress, leftContentX, currentY);
    currentY += (splitAddress.length - 1) * 3.5;
  }

  // Report Details (Right) — use canvas shaper for Khmer
  if (isKhmer) {
    drawKhmerText(doc, t.reportTitle, pageWidth - 14, 15, {
      fontSize: 13,
      bold: true,
      color: "#870d4c",
      align: "right",
    });
  } else {
    doc.setFont(fontName, "bold");
    doc.setFontSize(13);
    doc.setTextColor(135, 13, 76);
    doc.text(t.reportTitle, pageWidth - 14, 15, { align: "right" });
  }

  const periodLabel = `${t.periodPrefix} ${dateRange.startDate} ${isKhmer ? "ដល់" : "to"} ${dateRange.endDate}`;
  if (isKhmer) {
    drawKhmerText(doc, periodLabel, pageWidth - 14, 21, {
      fontSize: 9,
      color: "#475569",
      align: "right",
    });
  } else {
    doc.setFont(fontName, "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(periodLabel, pageWidth - 14, 21, { align: "right" });
  }

  const genDate = `${t.generated} ${new Date().toLocaleDateString(isKhmer ? "km-KH" : "en-GB")}`;
  if (isKhmer) {
    drawKhmerText(doc, genDate, pageWidth - 14, 26, {
      fontSize: 8.5,
      color: "#94a3b8",
      align: "right",
    });
  } else {
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(genDate, pageWidth - 14, 26, { align: "right" });
  }

  // Separator line
  const dividerY = Math.max(currentY + 5, 33);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, dividerY, pageWidth - 14, dividerY);

  // Calculate top product by quantity sold
  const productTotals = rows.reduce((acc, row) => {
    const name = row.product_name || "-";
    const quantity = Number(row.quantity || 0);
    const total = Number(row.total_price || 0);

    if (!acc[name]) {
      acc[name] = { quantity: 0, total: 0 };
    }

    acc[name].quantity += quantity;
    acc[name].total += total;

    return acc;
  }, {});

  const topProduct = Object.entries(productTotals).sort(
    (a, b) => b[1].quantity - a[1].quantity,
  )[0];

  const tableData = rows.map((row, index) => [
    `#${String(index + 1).padStart(2, "0")}`,
    row.product_name || "-",
    Number(row.quantity || 0),
    formatSaleAmount(row.price),
    formatSaleAmount(row.total_price),
    formatSaleDate(row.sale_date, isKhmer ? "km" : "en-US"),
    row.order_no || "-",
    row.seller_name || "-",
  ]);

  const tableHeaders = [
    t.colNo,
    t.colProductName,
    t.colQuantity,
    t.colPrice,
    t.colTotalPrice,
    t.colSaleDate,
    t.colOrderNo,
    t.colSeller,
  ];

  // Track the total amount for each automatically generated page
  const pageTotals = {};
  const tableStartY = dividerY + 4;

  applyAutoTable(doc, {
    startY: tableStartY,

    head: [tableHeaders],

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
      font: fontName,
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
      fillColor: [135, 13, 76],
      textColor: [255, 255, 255],
    },

    columnStyles: {
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
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
      // Accumulate page totals (same as original logic)
      if (data.section === "body" && data.column.index === 0) {
        const row = rows[data.row.index];
        const pageNumber = data.pageNumber;

        if (!pageTotals[pageNumber]) {
          pageTotals[pageNumber] = 0;
        }

        pageTotals[pageNumber] += Number(row.total_price || 0);
      }

      // Overlay shaped Khmer text
      if (isKhmer && isKhmerText(data.cell.raw)) {
        drawKhmerInAutoTableCell(doc, data);
      }
    },

    didDrawPage(data) {
      const pageNumber = data.pageNumber;

      const pageTotalLabel = `${t.pageTotal} ${pageNumber}: ${formatSaleAmount(
        pageTotals[pageNumber] || 0,
      )}`;

      if (isKhmer) {
        drawKhmerText(doc, pageTotalLabel, pageWidth - 14, pageHeight - 14, {
          fontSize: 9.5,
          bold: true,
          color: "#870d4c",
          align: "right",
        });
      } else {
        doc.setFont(fontName, "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(135, 13, 76);
        doc.text(pageTotalLabel, pageWidth - 14, pageHeight - 14, {
          align: "right",
        });
      }
    },
  });

  // Summary Page (same layout as original)
  doc.addPage();

  const summaryTitle = t.salesSummary;
  if (isKhmer) {
    drawKhmerText(doc, summaryTitle, centerX, 24, {
      fontSize: 18,
      bold: true,
      color: "#870d4c",
      align: "center",
    });
  } else {
    doc.setFont(fontName, "bold");
    doc.setFontSize(18);
    doc.setTextColor(135, 13, 76);
    doc.text(summaryTitle, centerX, 24, { align: "center" });
  }

  const summarySubtitle = `${t.periodPrefix} ${dateRange.startDate} ${isKhmer ? "ដល់" : "to"} ${dateRange.endDate}`;
  if (isKhmer) {
    drawKhmerText(doc, summarySubtitle, centerX, 31, {
      fontSize: 9.5,
      color: "#64748b",
      align: "center",
    });
  } else {
    doc.setFont(fontName, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(summarySubtitle, centerX, 31, { align: "center" });
  }

  const summaryRows = [
    [t.totalSales, formatSaleAmount(summary.totalSales)],
    [t.productsSold, String(summary.totalQuantity)],
    [
      t.topSeller,
      summary.topSeller
        ? `${summary.topSeller.name} (${formatSaleAmount(
            summary.topSeller.total,
          )})`
        : "-",
    ],
    [
      isKhmer ? "ទំនិញលក់ដាច់បំផុត" : "Top Product",
      topProduct
        ? `${topProduct[0]} (${topProduct[1].quantity} ${isKhmer ? "បានលក់" : "sold"})`
        : "-",
    ],
  ];

  applyAutoTable(doc, {
    startY: 40,

    head: [[t.metric, t.result]],

    body: summaryRows,

    theme: "grid",

    margin: {
      left: 35,
      right: 35,
    },

    styles: {
      font: fontName,
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
      drawKhmerText(doc, footerLeft, 14, pageHeight - 8, {
        fontSize: 8,
        color: "#94a3b8",
        align: "left",
      });
      drawKhmerText(doc, footerRight, pageWidth - 14, pageHeight - 8, {
        fontSize: 8,
        color: "#94a3b8",
        align: "right",
      });
    } else {
      doc.setFont(fontName, "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(footerLeft, 14, pageHeight - 8);
      doc.text(footerRight, pageWidth - 14, pageHeight - 8, { align: "right" });
    }
  }

  if (typeof doc.save === "function") {
    try {
      doc.save(
        `Product_Sales_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`,
      );
    } catch {
      // In non-browser / test environments
    }
  }

  return doc;
}
