import type { BestSellerMode, BestSellerOrderAdapter, BestSellerRules, OrderCoverage } from "../utils/bestSellers.ts";
import { DEFAULT_BEST_SELLER_RULES, normalizeIdentifier } from "../utils/bestSellers.ts";

export const BEST_SELLER_RULES: Readonly<BestSellerRules> = {
  ...DEFAULT_BEST_SELLER_RULES,
  minimumUnits: 20,
};
// Selected by the user: 20 paid units sold, including multiple units in one order.
export const BEST_SELLER_MODE: BestSellerMode = "paid-units-all-time";

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}

function matchesStatus(value: unknown, expected: string): boolean | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value.trim().toLowerCase() === expected;
}

// Only fields established by the existing frontend and the supplied API screenshot.
export const bestSellerOrderAdapter: BestSellerOrderAdapter<unknown, unknown> = {
  getOrderId: (order) => normalizeIdentifier(record(order).id),
  isPaid: (order) => matchesStatus(record(order).paymentStatus, "paid"),
  isCompleted: (order) => matchesStatus(record(order).status, "completed"),
  isCancelled: (order) => matchesStatus(record(order).status, "cancelled"),
  getItems: (order) => {
    const row = record(order);
    const items = row.orderDetails ?? row.items;
    return Array.isArray(items) ? items : undefined;
  },
  getProductId: (item) => normalizeIdentifier(record(item).product_id)
    ?? normalizeIdentifier(record(item).productId),
  getQuantity: (item) => {
    const value = record(item).quantity;
    if (typeof value !== "number" && (typeof value !== "string" || !value.trim())) return undefined;
    const quantity = Number(value);
    return Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : undefined;
  },
  getOrderLineId: (item) => normalizeIdentifier(record(item).id),

  getCompletedAt: undefined,
  isFullyRefunded: undefined,
  isFullyReturned: undefined,
};

export const bestSellerOrderSource = {
  getOrders(response: unknown): readonly unknown[] | undefined {
    if (Array.isArray(response)) return response;
    const data = record(response).data;
    return Array.isArray(data) ? data : undefined;
  },
  // No documented pagination/coverage contract is available. An array, a row
  // count, or a requested date range alone does not prove a complete snapshot.
  getCoverage(_response: unknown, _asOf: number): OrderCoverage | undefined {
    return undefined;
  },
};
