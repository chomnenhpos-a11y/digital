/**
 * Calculates executive KPI metrics across all order statuses from an array of order records.
 *
 * @param {Array<object>} orders - List of order objects
 * @returns {{
 *   totalOrders: number,
 *   pendingCount: number,
 *   pickupCount: number,
 *   deliveringCount: number,
 *   completedCount: number,
 *   cancelledCount: number,
 *   totalRevenue: number
 * }}
 */
export function computeOrderStats(orders = []) {
  if (!Array.isArray(orders)) {
    return {
      totalOrders: 0,
      pendingCount: 0,
      pickupCount: 0,
      deliveringCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      totalRevenue: 0,
    };
  }

  let pendingCount = 0;
  let pickupCount = 0;
  let deliveringCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let totalRevenue = 0;

  for (const order of orders) {
    if (!order || typeof order !== 'object') continue;

    const status = (order.status || '').trim().toLowerCase();
    const paymentStatus = (order.paymentStatus || '').trim().toLowerCase();
    const amount = Number(order.totalAmount || order.total || 0) || 0;

    if (status === 'pending') {
      pendingCount += 1;
    } else if (status === 'pickup') {
      pickupCount += 1;
    } else if (status === 'delivering') {
      deliveringCount += 1;
    } else if (status === 'completed') {
      completedCount += 1;
    } else if (status === 'cancelled') {
      cancelledCount += 1;
    }

    if (status !== 'cancelled' && (paymentStatus === 'paid' || status === 'completed')) {
      totalRevenue += amount;
    }
  }

  return {
    totalOrders: orders.length,
    pendingCount,
    pickupCount,
    deliveringCount,
    completedCount,
    cancelledCount,
    totalRevenue,
  };
}
