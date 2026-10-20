export function canDeleteOrder(order) {
  return order?.status === "Pending" && order?.paymentStatus === "Unpaid";
}
