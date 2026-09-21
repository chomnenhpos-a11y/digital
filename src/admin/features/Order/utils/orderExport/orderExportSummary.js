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

      if (order.paymentStatus === 'Paid') {
        paidAmount += amount;
        paidOrders++;
      } else {
        unpaidAmount += amount;
        unpaidOrders++;
      }

      if (order.status === 'Completed') {
        completedOrders++;
      } else if (order.status === 'Pending') {
        pendingOrders++;
      } else if (order.status === 'Cancelled' || order.status === 'Canceled') {
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
