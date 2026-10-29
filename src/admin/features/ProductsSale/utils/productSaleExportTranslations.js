export const PRODUCT_SALE_EXPORT_TRANSLATIONS = {
  en: {
    reportTitle: "PRODUCT SALES REPORT",
    periodPrefix: "Period:",
    generated: "Generated:",
    tel: "Tel:",
    sheetName: "Product Sales",
    monthlyReport: "Monthly Sales Report",
    pageOf: "Page {current} of {total}",

    // Metrics
    salesSummary: "Sales Summary",
    metric: "Metric",
    result: "Result",
    totalSales: "Total Sales",
    productsSold: "Products Sold",
    topSeller: "Top Seller",
    uniqueOrders: "Unique Orders",
    averageOrderValue: "Average Order Value",
    pageTotal: "Total for Page",
    footerNote: "This report is automatically generated for internal shop management.",

    // Table Headers
    colNo: "No",
    colProductId: "Product ID",
    colProductName: "Product Name",
    colQuantity: "Quantity",
    colPrice: "Price",
    colTotalPrice: "Total Price",
    colSaleDate: "Sale Date",
    colOrderNo: "Order No",
    colSeller: "Seller",
  },

  km: {
    reportTitle: "របាយការណ៍ការលក់ទំនិញ",
    periodPrefix: "កាលបរិច្ឆេទ:",
    generated: "កាលបរិច្ឆេទបង្កើត:",
    tel: "ទូរស័ព្ទ:",
    sheetName: "ការលក់ទំនិញ",
    monthlyReport: "របាយការណ៍ការលក់ប្រចាំខែ",
    pageOf: "ទំព័រទី {current} នៃ {total}",

    // Metrics
    salesSummary: "សង្ខេបការលក់ទំនិញ",
    metric: "ព័ត៌មាន",
    result: "លទ្ធផល",
    totalSales: "ការលក់សរុប",
    productsSold: "ចំនួនទំនិញបានលក់",
    topSeller: "អ្នកលក់ឆ្នើម",
    uniqueOrders: "ការបញ្ជាទិញសរុប",
    averageOrderValue: "តម្លៃជាមធ្យមក្នុងមួយការបញ្ជាទិញ",
    pageTotal: "សរុបទំព័រ",
    footerNote: "របាយការណ៍នេះត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិសម្រាប់ការគ្រប់គ្រងផ្ទៃក្នុងហាង។",

    // Table Headers
    colNo: "ល.រ",
    colProductId: "លេខកូដទំនិញ",
    colProductName: "ឈ្មោះទំនិញ",
    colQuantity: "ចំនួន",
    colPrice: "តម្លៃ",
    colTotalPrice: "តម្លៃសរុប",
    colSaleDate: "កាលបរិច្ឆេទលក់",
    colOrderNo: "លេខបញ្ជាទិញ",
    colSeller: "អ្នកលក់",
  },
};

export function getProductSaleExportTranslations(lang) {
  const currentLang = (
    lang ||
    (typeof window !== "undefined" ? localStorage.getItem("language") : "en") ||
    "en"
  )
    .toLowerCase()
    .split("-")[0];

  return PRODUCT_SALE_EXPORT_TRANSLATIONS[currentLang === "km" ? "km" : "en"];
}

