export type Identifier = string | number;
export type Timestamp = string | number | Date;
export type BestSellerMode = "paid-units-all-time" | "paid-orders-all-time" | "completed-orders-window";

export interface BestSellerRules {
  minimumOrders: number;
  minimumUnits?: number;
  days: number;
}

export const DEFAULT_BEST_SELLER_RULES: Readonly<BestSellerRules> = Object.freeze({
  minimumOrders: 20,
  minimumUnits: 20,
  days: 30,
});

/** Frontend coverage contract; these are not assumed API response fields. */
export interface OrderCoverage {
  complete: boolean;
  from: Timestamp;
  through: Timestamp;
}

/** Readers must return undefined when the API cannot establish a value. */
export interface BestSellerOrderAdapter<Order, Item> {
  getOrderId: (order: Order) => Identifier | undefined;
  isPaid: (order: Order) => boolean | undefined;
  isCompleted: (order: Order) => boolean | undefined;
  isCancelled: (order: Order) => boolean | undefined;
  getItems: (order: Order) => readonly Item[] | undefined;
  getProductId: (item: Item) => Identifier | undefined;
  getQuantity?: (item: Item) => number | undefined;
  getOrderLineId?: (item: Item) => Identifier | undefined;
  getCompletedAt?: (order: Order) => Timestamp | undefined;
  isFullyRefunded?: (order: Order) => boolean | undefined;
  isFullyReturned?: (item: Item, order: Order) => boolean | undefined;
}

export type BestSellerIssue =
  | "configuration"
  | "orderData"
  | "orderCoverage"
  | "orderId"
  | "orderStatus"
  | "completionDate"
  | "refundState"
  | "orderItems"
  | "productId"
  | "quantity"
  | "returnState"
  | "conflictingOrders"
  | "productCatalog"
  | "shopScope";

export interface BestSellerRank {
  productId: string;
  orderCount: number;
  unitCount?: number;
}

export interface BestSellerResult {
  status: "ready" | "unavailable";
  issues: BestSellerIssue[];
  rankings: BestSellerRank[];
  orderCounts?: BestSellerRank[];
  unitCounts?: { productId: string; unitCount: number }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeIdentifier(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function timestamp(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  // A completion instant needs a documented timezone, not the browser's locale.
  if (typeof value !== "string" || !/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) {
    return NaN;
  }
  return Date.parse(value);
}

export function unavailableBestSellers(issues: BestSellerIssue[]): BestSellerResult {
  return { status: "unavailable", issues: [...new Set(issues)], rankings: [] };
}

export function calculatePaidOrderBadges<Order, Item>({
  orders,
  adapter,
  minimumOrders = DEFAULT_BEST_SELLER_RULES.minimumOrders,
}: {
  orders: readonly Order[] | undefined;
  adapter: BestSellerOrderAdapter<Order, Item>;
  minimumOrders?: number;
}): BestSellerResult {
  return calculatePaidSalesBadges({ orders, adapter, minimum: minimumOrders, metric: "orders" });
}

/** Paid quantities are summed once per order and, where available, order-line ID. */
export function calculatePaidUnitBadges<Order, Item>({
  orders,
  adapter,
  minimumUnits = DEFAULT_BEST_SELLER_RULES.minimumUnits ?? 20,
}: {
  orders: readonly Order[] | undefined;
  adapter: BestSellerOrderAdapter<Order, Item>;
  minimumUnits?: number;
}): BestSellerResult {
  return calculatePaidSalesBadges({ orders, adapter, minimum: minimumUnits, metric: "units" });
}

function calculatePaidSalesBadges<Order, Item>({
  orders, adapter, minimum, metric,
}: {
  orders: readonly Order[] | undefined;
  adapter: BestSellerOrderAdapter<Order, Item>;
  minimum: number;
  metric: "orders" | "units";
}): BestSellerResult {
  if (!Number.isSafeInteger(minimum) || minimum < 1) {
    return unavailableBestSellers(["configuration"]);
  }
  if (!Array.isArray(orders)) return unavailableBestSellers(["orderData"]);
  if (metric === "units" && !adapter.getQuantity) return unavailableBestSellers(["quantity"]);

  const issues = new Set<BestSellerIssue>();
  const observedOrders = new Map<string, { paid: boolean; sales: Map<string, number>; snapshot: string }>();
  const excludedOrderIds = new Set<string>();
  for (const order of orders) {
    let orderId: string | undefined;
    try {
      orderId = normalizeIdentifier(adapter.getOrderId(order));
      const paid = adapter.isPaid(order);
      if (!orderId) issues.add("orderId");
      if (typeof paid !== "boolean") issues.add("orderStatus");
      if (!orderId) continue;
      if (typeof paid !== "boolean") {
        excludedOrderIds.add(orderId);
        continue;
      }

      const sales = new Map<string, number>();
      if (paid) {
        const orderLines = new Map<string, string>();
        const items = adapter.getItems(order);
        if (!Array.isArray(items)) {
          issues.add("orderItems");
          excludedOrderIds.add(orderId);
          continue;
        }
        for (const item of items) {
          const productId = normalizeIdentifier(adapter.getProductId(item));
          if (!productId) {
            issues.add("productId");
            continue;
          }
          let quantity = 1;
          if (metric === "units") {
            const value = adapter.getQuantity!(item);
            if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
              issues.add("quantity");
              continue;
            }
            quantity = value;
            const lineId = normalizeIdentifier(adapter.getOrderLineId?.(item));
            if (lineId) {
              const line = JSON.stringify([productId, quantity]);
              const previousLine = orderLines.get(lineId);
              if (previousLine !== undefined) {
                if (previousLine !== line) {
                  issues.add("conflictingOrders");
                  excludedOrderIds.add(orderId);
                }
                continue;
              }
              orderLines.set(lineId, line);
            }
          }
          const total = metric === "units" ? (sales.get(productId) ?? 0) + quantity : 1;
          if (!Number.isSafeInteger(total)) {
            issues.add("quantity");
            excludedOrderIds.add(orderId);
            continue;
          }
          sales.set(productId, total);
        }
        if (items.length > 0 && sales.size === 0) {
          excludedOrderIds.add(orderId);
          continue;
        }
      }

      const snapshot = JSON.stringify([paid, [...sales].sort(([a], [b]) => a.localeCompare(b))]);
      const previous = observedOrders.get(orderId);
      if (previous !== undefined && previous.snapshot !== snapshot) {
        issues.add("conflictingOrders");
        excludedOrderIds.add(orderId);
      }
      observedOrders.set(orderId, { paid, sales, snapshot });
    } catch {
      issues.add("orderData");
      if (orderId) excludedOrderIds.add(orderId);
    }
  }

  const orderIdsByProduct = new Map<string, Set<string>>();
  const unitsByProduct = new Map<string, number>();
  let resolvedOrders = 0;
  for (const [orderId, order] of observedOrders) {
    if (excludedOrderIds.has(orderId)) continue;
    resolvedOrders += 1;
    if (!order.paid) continue;
    for (const [productId, quantity] of order.sales) {
      if (quantity <= 0) continue;
      const orderIds = orderIdsByProduct.get(productId) ?? new Set<string>();
      orderIds.add(orderId);
      orderIdsByProduct.set(productId, orderIds);
      if (metric === "units") {
        const total = (unitsByProduct.get(productId) ?? 0) + quantity;
        if (!Number.isSafeInteger(total)) return unavailableBestSellers(["quantity"]);
        unitsByProduct.set(productId, total);
      }
    }
  }
  if (orders.length > 0 && resolvedOrders === 0 && issues.size) {
    return unavailableBestSellers([...issues]);
  }
  const orderCounts = [...orderIdsByProduct]
    .map(([productId, orderIds]) => ({ productId, orderCount: orderIds.size }))
    .sort((a, b) => b.orderCount - a.orderCount || a.productId.localeCompare(b.productId));
  if (metric === "units") {
    const unitCounts = [...unitsByProduct]
      .map(([productId, unitCount]) => ({ productId, unitCount }))
      .sort((a, b) => b.unitCount - a.unitCount || a.productId.localeCompare(b.productId));
    return {
      status: "ready", issues: [...issues], orderCounts, unitCounts,
      rankings: unitCounts.filter(({ unitCount }) => unitCount >= minimum)
        .map(({ productId, unitCount }) => ({ productId, unitCount, orderCount: orderIdsByProduct.get(productId)!.size })),
    };
  }
  return {
    status: "ready",
    issues: [...issues],
    orderCounts,
    rankings: orderCounts.filter(({ orderCount }) => orderCount >= minimum),
  };
}

/**
 * Evaluate the entire store's verified order snapshot, independently of products,
 * search filters, quantities, customer identities, or UI pagination.
 */
export function calculateBestSellers<Order, Item>({
  orders,
  coverage,
  adapter,
  rules = DEFAULT_BEST_SELLER_RULES,
  now = Date.now(),
}: {
  orders: readonly Order[] | undefined;
  coverage: OrderCoverage | undefined;
  adapter: BestSellerOrderAdapter<Order, Item>;
  rules?: Readonly<BestSellerRules>;
  now?: number;
}): BestSellerResult {
  const issues = new Set<BestSellerIssue>();
  if (!Number.isSafeInteger(rules.minimumOrders) || rules.minimumOrders < 1 ||
      !Number.isSafeInteger(rules.days) || rules.days < 1 || !Number.isFinite(now)) {
    return unavailableBestSellers(["configuration"]);
  }

  const from = now - rules.days * DAY_MS;
  if (!coverage?.complete || !Number.isFinite(timestamp(coverage.from)) ||
      !Number.isFinite(timestamp(coverage.through)) ||
      timestamp(coverage.from) > from || timestamp(coverage.through) < now) {
    issues.add("orderCoverage");
  }
  if (!Array.isArray(orders)) issues.add("orderData");
  if (!adapter.getCompletedAt) issues.add("completionDate");
  if (!adapter.isFullyRefunded) issues.add("refundState");
  if (!adapter.isFullyReturned) issues.add("returnState");
  if (issues.size) return unavailableBestSellers([...issues]);

  const orderIdsByProduct = new Map<string, Set<string>>();
  const orderSnapshots = new Map<string, string>();

  for (const order of orders!) {
    try {
      const orderId = normalizeIdentifier(adapter.getOrderId(order));
      if (!orderId) {
        issues.add("orderId");
        continue;
      }

      const paid = adapter.isPaid(order);
      const completed = adapter.isCompleted(order);
      const cancelled = adapter.isCancelled(order);
      if ([paid, completed, cancelled].some((value) => typeof value !== "boolean")) {
        issues.add("orderStatus");
        continue;
      }

      let snapshot = "excluded";
      const retainedProductIds = new Set<string>();
      if (paid && completed && !cancelled) {
        const refunded = adapter.isFullyRefunded!(order);
        if (typeof refunded !== "boolean") {
          issues.add("refundState");
          continue;
        }
        if (!refunded) {
          const completedAt = timestamp(adapter.getCompletedAt!(order));
          if (!Number.isFinite(completedAt)) {
            issues.add("completionDate");
            continue;
          }
          // Include both endpoints, and never count future completions.
          if (completedAt >= from && completedAt <= now) {
            const items = adapter.getItems(order);
            if (!Array.isArray(items)) {
              issues.add("orderItems");
              continue;
            }
            for (const item of items) {
              const productId = normalizeIdentifier(adapter.getProductId(item));
              const returned = adapter.isFullyReturned!(item, order);
              if (!productId) issues.add("productId");
              if (typeof returned !== "boolean") issues.add("returnState");
              if (productId && returned === false) retainedProductIds.add(productId);
            }
            snapshot = JSON.stringify([completedAt, [...retainedProductIds].sort()]);
          }
        }
      }

      // Repeated rows/pages are harmless; contradictory versions are not.
      const previous = orderSnapshots.get(orderId);
      if (previous !== undefined && previous !== snapshot) issues.add("conflictingOrders");
      orderSnapshots.set(orderId, snapshot);
      for (const productId of retainedProductIds) {
        const orderIds = orderIdsByProduct.get(productId) ?? new Set<string>();
        orderIds.add(orderId);
        orderIdsByProduct.set(productId, orderIds);
      }
    } catch {
      issues.add("orderData");
    }
  }

  // Never publish a partial ranking when any relevant data is unknown.
  if (issues.size) return unavailableBestSellers([...issues]);
  const rankings = [...orderIdsByProduct]
    .map(([productId, orderIds]) => ({ productId, orderCount: orderIds.size }))
    .filter(({ orderCount }) => orderCount >= rules.minimumOrders)
    .sort((a, b) => b.orderCount - a.orderCount || a.productId.localeCompare(b.productId));
  return { status: "ready", issues: [], rankings };
}

/** Join sales metrics to cards; strict rankings require every qualifying product. */
export function applyBestSellers<Product extends { id: Identifier }>(
  products: readonly Product[],
  result: BestSellerResult,
  { requireCompleteCatalog = true }: { requireCompleteCatalog?: boolean } = {},
) {
  const catalogIds = new Set(products.map((product) => normalizeIdentifier(product.id)));
  const verified = result.status === "ready" &&
    (!requireCompleteCatalog || result.rankings.every(({ productId }) => catalogIds.has(productId)));
  const resolved = result.status === "ready" && !verified
    ? unavailableBestSellers(["productCatalog"])
    : result;
  const counts = new Map(verified
    ? (result.orderCounts ?? result.rankings).map((rank) => [rank.productId, rank.orderCount]) : []);
  const qualifyingIds = new Set(verified ? result.rankings.map(({ productId }) => productId) : []);
  const unitCounts = new Map(verified ? (result.unitCounts ?? []).map(({ productId, unitCount }) => [productId, unitCount]) : []);
  const decorated = products.map((product) => {
    const productId = normalizeIdentifier(product.id) ?? "";
    const orderCount = counts.get(productId) ?? 0;
    return {
      ...product,
      isBestSeller: qualifyingIds.has(productId),
      bestSellerOrderCount: orderCount,
      bestSellerUnitCount: unitCounts.get(productId) ?? 0,
    };
  });
  const byId = new Map(decorated.map((product) => [normalizeIdentifier(product.id), product]));
  return {
    ...resolved,
    products: decorated,
    bestSellingProducts: verified ? result.rankings.flatMap(({ productId }) => {
      const product = byId.get(productId);
      return product ? [product] : [];
    }) : [],
  };
}
