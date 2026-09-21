export function filterOrdersByMonth(orders, selectedMonth) {
  if (!orders || !Array.isArray(orders) || !selectedMonth) return [];

  // selectedMonth is "YYYY-MM"
  const [yearStr, monthStr] = selectedMonth.split('-');
  const selectedYear = parseInt(yearStr, 10);
  const selectedMonthNum = parseInt(monthStr, 10); // 1-12

  if (isNaN(selectedYear) || isNaN(selectedMonthNum)) return [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  // If future month -> return no data
  if (
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedMonthNum > currentMonthNum)
  ) {
    return [];
  }

  const isCurrentMonth =
    selectedYear === currentYear && selectedMonthNum === currentMonthNum;

  // Filter without mutating the original array
  return orders.filter((order) => {
    const orderDateStr = order.createdAt || order.createAt;
    if (!orderDateStr) return false;

    const orderDate = new Date(orderDateStr);
    if (isNaN(orderDate.getTime())) return false;

    const orderYear = orderDate.getFullYear();
    const orderMonthNum = orderDate.getMonth() + 1;

    // Must be same month and year
    if (orderYear !== selectedYear || orderMonthNum !== selectedMonthNum) {
      return false;
    }

    if (isCurrentMonth) {
      // Must not be strictly in the future (from the 1st day until TODAY only)
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);
      if (orderDate > endOfToday) {
        return false;
      }
    }

    return true;
  });
}
