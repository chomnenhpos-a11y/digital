export function getOrderExportSummary(orders) {
  let totalOrders = 0;
  let totalSales = 0;
  let paidAmount = 0;
  let unpaidAmount = 0;
  let paidOrders = 0;
  let unpaidOrders = 0;
  let completedOrders = 0;
  let pendingOrders = 0;
  let cancelledOrders = 0;

  if (Array.isArray(orders)) {
    orders.forEach(order => {
      totalOrders++;
      const amount = parseFloat(order.totalAmount) || 0;
      totalSales += amount;

      const normPayment = String(order.paymentStatus || "").toLowerCase().trim();
      const isPaid =
        (normPayment === "paid" || normPayment.includes("បានទូទាត់")) &&
        !normPayment.includes("unpaid") &&
        !normPayment.includes("មិនទាន់");

      if (isPaid) {
        paidAmount += amount;
        paidOrders++;
      } else {
        unpaidAmount += amount;
        unpaidOrders++;
      }

      const normStatus = String(order.status || "").toLowerCase();
      if (normStatus === "completed") {
        completedOrders++;
      } else if (normStatus === "pending") {
        pendingOrders++;
      } else if (normStatus === "cancelled" || normStatus === "canceled") {
        cancelledOrders++;
      }
    });
  }

  return {
    totalOrders,
    totalSales,
    paidAmount,
    unpaidAmount,
    paidOrders,
    unpaidOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders
  };
}
