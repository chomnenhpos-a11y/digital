import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const JsPDFDocument = typeof jsPDF === "function" ? jsPDF : jsPDF?.jsPDF || jsPDF;
const applyAutoTable = typeof autoTable === "function" ? autoTable : autoTable?.default || autoTable;
import {
  formatSaleDate,
  formatSaleAmount,
} from "../schemas/productsaleSchemas.js";
import { getProductSaleSummary } from "./productSaleSummary.js";

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
 * Exports the product sales report to a high-quality PDF document.
 * Displays shop branding (Logo, Shop Name, Phone, Address) retrieved from settings.
 *
 * @param {Array<object>} rows - Filtered product sales rows
 * @param {{ startDate: string, endDate: string }} dateRange - Active date range
 * @param {object} [settings] - Shop settings from useSettingsQuery
 */
export async function exportProductSalesToPDF(rows, dateRange, settings = {}) {
  if (
    !rows?.length ||
    !dateRange?.startDate ||
    !dateRange?.endDate
  ) {
    return;
  }

  const summary = getProductSaleSummary(rows);

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

  // Report Details (Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(135, 13, 76); // Brand primary #870d4c
  doc.text("PRODUCT SALES REPORT", pageWidth - 14, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Period: ${dateRange.startDate} to ${dateRange.endDate}`,
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
    (a, b) => b[1].quantity - a[1].quantity
  )[0];

  const tableData = rows.map((row, index) => [
    `#${String(index + 1).padStart(2, "0")}`,
    row.product_name || "-",
    Number(row.quantity || 0),
    formatSaleAmount(row.price),
    formatSaleAmount(row.total_price),
    formatSaleDate(row.sale_date),
    row.order_no || "-",
    row.seller_name || "-",
  ]);

  // Track the total amount for each automatically generated page
  const pageTotals = {};
  const tableStartY = dividerY + 4;

  applyAutoTable(doc, {
    startY: tableStartY,

    head: [[
      "No",
      "Product Name",
      "Qty",
      "Price",
      "Total Price",
      "Sale Date",
      "Order No",
      "Seller",
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
      fillColor: [135, 13, 76],
      textColor: [255, 255, 255],
    },

    columnStyles: {
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
    },

    didDrawCell(data) {
      if (
        data.section !== "body" ||
        data.column.index !== 0
      ) {
        return;
      }

      const row = rows[data.row.index];
      const pageNumber = data.pageNumber;

      if (!pageTotals[pageNumber]) {
        pageTotals[pageNumber] = 0;
      }

      pageTotals[pageNumber] += Number(
        row.total_price || 0
      );
    },

    didDrawPage(data) {
      const pageNumber = data.pageNumber;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(135, 13, 76);

      doc.text(
        `Total for Page ${pageNumber}: ${formatSaleAmount(
          pageTotals[pageNumber] || 0
        )}`,
        pageWidth - 14,
        pageHeight - 14,
        { align: "right" }
      );
    },
  });

  // Summary Page
  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(135, 13, 76);
  doc.text("Sales Summary", centerX, 24, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);

  doc.text(
    `${shopName} · Period: ${dateRange.startDate} to ${dateRange.endDate}`,
    centerX,
    31,
    { align: "center" }
  );

  const summaryRows = [
    [
      "Total Sales",
      formatSaleAmount(summary.totalSales),
    ],
    [
      "Products Sold",
      String(summary.totalQuantity),
    ],
    [
      "Top Seller",
      summary.topSeller
        ? `${summary.topSeller.name} (${formatSaleAmount(
            summary.topSeller.total
          )})`
        : "-",
    ],
    [
      "Top Product",
      topProduct
        ? `${topProduct[0]} (${topProduct[1].quantity} sold)`
        : "-",
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
      `${shopName} · Product Sales Report`,
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

  if (typeof doc.save === "function") {
    try {
      doc.save(
        `Product_Sales_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`
      );
    } catch {
      // In non-browser / test environments
    }
  }

  return doc;
}
