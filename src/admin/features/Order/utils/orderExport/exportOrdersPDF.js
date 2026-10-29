
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getOrderExportSummary } from "./orderExportSummary.js";

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
  selectedMonth,
  settings = {}
) {
  if (!orders || orders.length === 0) return;

  const summary = getOrderExportSummary(orders);

  const doc = new JsPDFDocument({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(shopName, leftContentX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  if (phone) {
    currentY += 5;
    doc.text(`Tel: ${phone}`, leftContentX, currentY);
  }

  if (address) {
    currentY += 4.5;

    const splitAddress = doc.splitTextToSize(address, 105);

    doc.text(splitAddress, leftContentX, currentY);

    currentY += (splitAddress.length - 1) * 3.5;
  }

  const [year, monthStr] = (selectedMonth || "").split("-");
  const yearNumber = Number(year);
  const monthNumber = Number(monthStr);

  const monthDate =
    yearNumber && monthNumber >= 1 && monthNumber <= 12
      ? new Date(yearNumber, monthNumber - 1, 1)
      : new Date();

  const monthName = monthDate.toLocaleString("en-US", {
    month: "long",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(135, 13, 76);

  doc.text("MONTHLY ORDER REPORT", rightX, 15, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text(
    `Period: ${monthName} ${year || ""}`.trim(),
    rightX,
    21,
    { align: "right" }
  );

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);

  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB")}`,
    rightX,
    26,
    { align: "right" }
  );

  const dividerY = Math.max(currentY + 7, 34);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, dividerY, rightX, dividerY);

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.createAt || 0);
    const dateB = new Date(b.createdAt || b.createAt || 0);

    return dateA - dateB;
  });

const tableData = sortedOrders.map((order) => {
  const totalAmount = Number(order.totalAmount || order.total || 0);

  const deliveryFee = Number(
    order.deliveryProvider?.shippingFee || 0
  );

  const subTotal = totalAmount - deliveryFee;

  return [
    order.orderNo ||
      (order.orderNumber
        ? `ORD-${order.orderNumber}`
        : `#${order.id || ""}`),

    order.customerPhone || order.phone || "-",

    formatOrderAmount(totalAmount),

    formatOrderAmount(subTotal),

    `${order.deliveryProvider?.name || "-"} (${formatOrderAmount(
      deliveryFee
    )})`,

    order.paymentStatus || "-",
    order.status || "-",
    order.seller?.name || "-",
    formatOrderDate(order.createdAt || order.createAt),
  ];
});

  const pageTotals = {};
  const tableStartY = dividerY + 5;

  applyAutoTable(doc, {
    startY: tableStartY,

    head: [[
      "Order No",
      "Customer Phone",
      "Total Amount",
      "Sub Total",
      "Delivery",
      "Payment Status",
      "Delivery Status",
      "Seller",
      "Order Date",
    ]],

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
      font: "helvetica",
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

    didDrawCell(data) {
      if (data.section !== "body" || data.column.index !== 0) {
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
      doc.setFontSize(9);
      doc.setTextColor(135, 13, 76);

      doc.text(
        `Total for Page ${pageNumber}: ${formatOrderAmount(
          pageTotals[pageNumber] || 0
        )}`,
        rightX,
        pageHeight - 14,
        { align: "right" }
      );
    },
  });

  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(135, 13, 76);

  doc.text("Order Summary", centerX, 25, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);

  doc.text(
    `${shopName} · Period: ${monthName} ${year || ""}`.trim(),
    centerX,
    32,
    { align: "center" }
  );

  const summaryRows = [
    ["Total Orders", String(summary.totalOrders || 0)],
    ["Total Sales", formatOrderAmount(summary.totalSales)],
    [
      "Paid Amount",
      `${formatOrderAmount(summary.paidAmount)} (${summary.paidOrders || 0} orders)`,
    ],
    [
      "Unpaid Amount",
      `${formatOrderAmount(summary.unpaidAmount)} (${summary.unpaidOrders || 0} orders)`,
    ],
    ["Completed Orders", String(summary.completedOrders || 0)],
    ["Pending Orders", String(summary.pendingOrders || 0)],
    ["Cancelled Orders", String(summary.cancelledOrders || 0)],
  ];

  applyAutoTable(doc, {
    startY: 41,

    head: [["Metric", "Result"]],

    body: summaryRows,

    theme: "grid",

    margin: {
      left: 35,
      right: 35,
    },

    styles: {
      font: "helvetica",
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
  });

  const totalPagesCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPagesCount; i++) {
    doc.setPage(i);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.text(
      `${shopName} · Monthly Order Report`,
      margin,
      pageHeight - 7
    );

    doc.text(
      `Page ${i} of ${totalPagesCount}`,
      rightX,
      pageHeight - 7,
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
    }
  }

  return doc;
}
