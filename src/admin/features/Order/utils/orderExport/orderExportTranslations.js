export const ORDER_EXPORT_TRANSLATIONS = {
  en: {
    // Header & Titles
    reportTitle: "ORDER REPORT",
    periodPrefix: "Period:",
    allDates: "All dates",
    generated: "Generated:",
    tel: "Tel:",
    ordersUnit: "orders",
    monthlyReport: "Monthly Order Report",
    pageOf: "Page {current} of {total}",

    // Summary Page & Metric Labels
    orderSummary: "Order Summary",
    metric: "Metric",
    result: "Result",
    totalOrders: "Total Orders",
    totalSales: "Total Sales",
    paidAmount: "Paid Amount",
    unpaidAmount: "Unpaid Amount",
    completedOrders: "Completed Orders",
    pendingOrders: "Pending Orders",
    cancelledOrders: "Cancelled Orders",
    pageTotal: "Total for Page",
    footerNote: "This report is automatically generated for internal shop management.",

    // Table Column Headers
    colNo: "No",
    colOrderNo: "Order No",
    colCustomerPhone: "Customer Phone",
    colTotalAmount: "Total Amount",
    colSubTotal: "Sub Total",
    colDelivery: "Delivery",
    colPaymentStatus: "Payment Status",
    colDeliveryStatus: "Delivery Status",
    colSeller: "Seller",
    colOrderDate: "Order Date",

    // Sheet Name
    sheetName: "Orders",

    // Status mapping
    statuses: {
      paid: "Paid",
      unpaid: "Unpaid",
      pending: "Pending",
      failed: "Failed",
      completed: "Completed",
      delivered: "Delivered",
      shipped: "Shipped",
      processing: "Processing",
      cancelled: "Cancelled",
    },
  },

  km: {
    // Header & Titles
    reportTitle: "របាយការណ៍ការបញ្ជាទិញ",
    periodPrefix: "កាលបរិច្ឆេទ:",
    allDates: "គ្រប់កាលបរិច្ឆេទ",
    generated: "កាលបរិច្ឆេទបង្កើត:",
    tel: "ទូរស័ព្ទ:",
    ordersUnit: "ការបញ្ជាទិញ",
    monthlyReport: "របាយការណ៍ការបញ្ជាទិញប្រចាំខែ",
    pageOf: "ទំព័រទី {current} នៃ {total}",

    // Summary Page & Metric Labels
    orderSummary: "សង្ខេបរបាយការណ៍ការបញ្ជាទិញ",
    metric: "ព័ត៌មាន",
    result: "លទ្ធផល",
    totalOrders: "ការបញ្ជាទិញសរុប",
    totalSales: "ការលក់សរុប",
    paidAmount: "ទឹកប្រាក់បានទូទាត់",
    unpaidAmount: "ទឹកប្រាក់មិនទាន់ទូទាត់",
    completedOrders: "ការបញ្ជាទិញបានបញ្ចប់",
    pendingOrders: "ការបញ្ជាទិញរង់ចាំ",
    cancelledOrders: "ការបញ្ជាទិញបានបោះបង់",
    pageTotal: "សរុបទំព័រ",
    footerNote: "របាយការណ៍នេះត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិសម្រាប់ការគ្រប់គ្រងផ្ទៃក្នុងហាង។",

    // Table Column Headers
    colNo: "ល.រ",
    colOrderNo: "លេខបញ្ជាទិញ",
    colCustomerPhone: "លេខទូរស័ព្ទអតិថិជន",
    colTotalAmount: "ចំនួនទឹកប្រាក់សរុប",
    colSubTotal: "តម្លៃទំនិញ",
    colDelivery: "ការដឹកជញ្ជូន",
    colPaymentStatus: "ស្ថានភាពទូទាត់",
    colDeliveryStatus: "ស្ថានភាពដឹកជញ្ជូន",
    colSeller: "អ្នកលក់",
    colOrderDate: "កាលបរិច្ឆេទបញ្ជាទិញ",

    // Sheet Name
    sheetName: "ការបញ្ជាទិញ",

    // Status mapping
    statuses: {
      paid: "បានទូទាត់",
      unpaid: "មិនទាន់ទូទាត់",
      pending: "រង់ចាំ",
      failed: "បរាជ័យ",
      completed: "បានបញ្ចប់",
      delivered: "បានដឹកជញ្ជូន",
      shipped: "កំពុងដឹកជញ្ជូន",
      processing: "កំពុងដំណើរការ",
      cancelled: "បានបោះបង់",
    },
  },
};


export function getOrderExportTranslations(lang) {
  const currentLang = (
    lang ||
    (typeof window !== "undefined" ? localStorage.getItem("language") : "en") ||
    "en"
  )
    .toLowerCase()
    .split("-")[0];

  return ORDER_EXPORT_TRANSLATIONS[currentLang === "km" ? "km" : "en"];
}


export function translateOrderStatus(status, lang) {
  if (!status) return "-";
  const t = getOrderExportTranslations(lang);
  const normalizedKey = String(status).toLowerCase().trim();
  return t.statuses[normalizedKey] || status;
}

