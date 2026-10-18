import assert from "node:assert/strict";
import { test } from "node:test";
import { applyBestSellers, calculateBestSellers, calculatePaidOrderBadges, calculatePaidUnitBadges } from "./bestSellers.ts";
import { bestSellerOrderAdapter, bestSellerOrderSource } from "../config/bestSellers.ts";
import type { BestSellerOrderAdapter, Identifier, OrderCoverage } from "./bestSellers.ts";

// Test-domain fixtures, not claims about the store's API schema.
interface Purchase { product: Identifier; returned?: boolean; quantity?: number }
interface Order {
  id: Identifier;
  paid?: boolean;
  completed?: boolean;
  cancelled?: boolean;
  refunded?: boolean;
  completedOn?: string | number;
  purchases?: Purchase[];
  customer?: string;
  createdAt?: number;
}

const NOW = Date.parse("2026-10-17T12:00:00Z");
const DAY = 86_400_000;
const coverage: OrderCoverage = { complete: true, from: NOW - 365 * DAY, through: NOW };
const adapter: BestSellerOrderAdapter<Order, Purchase> = {
  getOrderId: (order) => order.id,
  isPaid: (order) => order.paid,
  isCompleted: (order) => order.completed,
  isCancelled: (order) => order.cancelled,
  getCompletedAt: (order) => order.completedOn,
  isFullyRefunded: (order) => order.refunded,
  getItems: (order) => order.purchases,
  getProductId: (item) => item.product,
  isFullyReturned: (item) => item.returned,
};

function order(id: Identifier, overrides: Partial<Order> = {}): Order {
  return {
    id, paid: true, completed: true, cancelled: false, refunded: false,
    completedOn: NOW - DAY,
    purchases: [{ product: "p1", returned: false, quantity: 1 }],
    customer: "same-customer", ...overrides,
  };
}

function evaluate(orders: Order[], options: Partial<Parameters<typeof calculateBestSellers<Order, Purchase>>[0]> = {}) {
  return calculateBestSellers({ orders, coverage, adapter, now: NOW, ...options });
}

test("requires 20 distinct orders; quantities and customer identity do not change the count", () => {
  const orders = Array.from({ length: 19 }, (_, i) => order(i, {
    purchases: [{ product: "p1", returned: false, quantity: 500 }],
  }));
  assert.deepEqual(evaluate(orders).rankings, []);
  orders.push(order(19));
  assert.deepEqual(evaluate(orders).rankings, [{ productId: "p1", orderCount: 20 }]);
});

test("deduplicates products within an order and order rows across pages", () => {
  const orders = Array.from({ length: 20 }, (_, i) => order(i, {
    purchases: [
      { product: "p1", returned: false },
      { product: "p1", returned: false, quantity: 100 },
    ],
  }));
  assert.deepEqual(evaluate([...orders, ...orders, { ...orders[0], id: "0" }]).rankings,
    [{ productId: "p1", orderCount: 20 }]);
});

test("selects ALL qualifying products and sorts by distinct order count", () => {
  const orders = Array.from({ length: 22 }, (_, i) => order(i, {
    purchases: Array.from({ length: i < 20 ? 14 : 1 }, (_, j) => ({ product: `p${j}`, returned: false })),
  }));
  const result = evaluate(orders);
  assert.equal(result.rankings.length, 14);
  assert.deepEqual(result.rankings[0], { productId: "p0", orderCount: 22 });
  assert.ok(result.rankings.slice(1).every(({ orderCount }) => orderCount === 20));
});

test("excludes unpaid, pending, cancelled, fully refunded and fully returned purchases", () => {
  const excluded = [
    order(1, { paid: false }), order(2, { completed: false }),
    order(3, { cancelled: true }), order(4, { refunded: true }),
    order(5, { purchases: [{ product: "p1", returned: true }] }),
  ];
  assert.deepEqual(evaluate([...excluded, order(6)], { rules: { minimumOrders: 1, days: 30 } }).rankings,
    [{ productId: "p1", orderCount: 1 }]);
});

test("a retained line keeps that product eligible, while fully returned products are excluded", () => {
  const result = evaluate([order(1, { purchases: [
    { product: "p1", returned: true }, { product: "p1", returned: false },
    { product: "p2", returned: true },
  ] })], { rules: { minimumOrders: 1, days: 30 } });
  assert.deepEqual(result.rankings, [{ productId: "p1", orderCount: 1 }]);
});

test("uses completion instants, includes the cutoff, excludes older and future completions", () => {
  const orders = [
    order(1, { completedOn: NOW - 30 * DAY, createdAt: NOW - 100 * DAY }),
    order(2, { completedOn: NOW, createdAt: NOW - 100 * DAY }),
    order(3, { completedOn: NOW - 30 * DAY - 1, createdAt: NOW }),
    order(4, { completedOn: NOW + 1 }),
  ];
  assert.deepEqual(evaluate(orders, { rules: { minimumOrders: 1, days: 30 } }).rankings,
    [{ productId: "p1", orderCount: 2 }]);
});

test("the threshold and rolling window are configurable", () => {
  const orders = [order(1, { completedOn: NOW - 8 * DAY }), order(2)];
  assert.deepEqual(evaluate(orders, { rules: { minimumOrders: 2, days: 7 } }).rankings, []);
  assert.deepEqual(evaluate(orders, { rules: { minimumOrders: 1, days: 7 } }).rankings,
    [{ productId: "p1", orderCount: 1 }]);
});

test("never calculates from unverified, partial or insufficient period coverage", () => {
  for (const candidate of [undefined, { ...coverage, complete: false },
    { ...coverage, from: NOW - DAY }, { ...coverage, through: NOW - 1 }]) {
    const result = evaluate([order(1)], { coverage: candidate, rules: { minimumOrders: 1, days: 30 } });
    assert.equal(result.status, "unavailable");
    assert.ok(result.issues.includes("orderCoverage"));
    assert.deepEqual(result.rankings, []);
  }
});

test("reports missing completion, refund and return readers instead of fabricating defaults", () => {
  const result = evaluate([], { adapter: {
    ...adapter, getCompletedAt: undefined, isFullyRefunded: undefined, isFullyReturned: undefined,
  } });
  assert.deepEqual(result.issues.sort(), ["completionDate", "refundState", "returnState"]);
});

test("missing relevant row data suppresses the entire ranking", () => {
  for (const [bad, issue] of [
    [order(2, { completedOn: undefined }), "completionDate"],
    [order(2, { refunded: undefined }), "refundState"],
    [order(2, { completed: undefined }), "orderStatus"],
    [order(2, { purchases: undefined }), "orderItems"],
    [order(2, { purchases: [{ product: "p1" }] }), "returnState"],
    [order(2, { purchases: [{ product: "", returned: false }] }), "productId"],
    [order(""), "orderId"],
  ] as const) {
    const result = evaluate([order(1), bad], { rules: { minimumOrders: 1, days: 30 } });
    assert.equal(result.status, "unavailable");
    assert.ok(result.issues.includes(issue));
    assert.deepEqual(result.rankings, []);
  }
});

test("creation dates never replace missing completion dates; timezone-free dates are rejected", () => {
  for (const completedOn of [undefined, "2026-10-16T12:00:00", "invalid"]) {
    assert.ok(evaluate([order(1, { completedOn, createdAt: NOW })]).issues.includes("completionDate"));
  }
  assert.deepEqual(evaluate([order(1, { completedOn: "2026-10-16T19:00:00+07:00" })],
    { rules: { minimumOrders: 1, days: 30 } }).rankings, [{ productId: "p1", orderCount: 1 }]);
});

test("rejects contradictory versions of the same order", () => {
  const result = evaluate([order(1), order(1, { cancelled: true })],
    { rules: { minimumOrders: 1, days: 30 } });
  assert.deepEqual(result.issues, ["conflictingOrders"]);
  assert.deepEqual(result.rankings, []);
});

test("a partial product page cannot silently truncate global Best Sellers", () => {
  const ranking = evaluate([order(1, { purchases: [
    { product: "p1", returned: false }, { product: "p2", returned: false },
  ] })], { rules: { minimumOrders: 1, days: 30 } });
  const result = applyBestSellers([{ id: "p1", isBestSeller: true }], ranking);
  assert.deepEqual(result.issues, ["productCatalog"]);
  assert.equal(result.products[0].isBestSeller, false);
  assert.deepEqual(result.bestSellingProducts, []);
});

test("joins in ranking order, sets badges, and leaves inputs unchanged", () => {
  const products = [{ id: "p2" }, { id: "p1" }, { id: "p3", isBestSeller: true }];
  const before = structuredClone(products);
  const result = applyBestSellers(products, { status: "ready", issues: [], rankings: [
    { productId: "p1", orderCount: 25 }, { productId: "p2", orderCount: 20 },
  ] });
  assert.deepEqual(result.bestSellingProducts.map(({ id }) => id), ["p1", "p2"]);
  assert.deepEqual(result.products.map(({ isBestSeller }) => isBestSeller), [true, true, false]);
  assert.equal(result.bestSellingProducts[0].bestSellerOrderCount, 25);
  assert.deepEqual(products, before);
});

test("complete empty data is an accurate empty result, with no fallback products", () => {
  const result = applyBestSellers([{ id: "p1", isBestSeller: true }], evaluate([]));
  assert.equal(result.status, "ready");
  assert.deepEqual(result.bestSellingProducts, []);
  assert.equal(result.products[0].isBestSeller, false);
});

test("invalid configuration and malformed order responses fail closed", () => {
  for (const rules of [{ minimumOrders: 0, days: 30 }, { minimumOrders: 2.5, days: 30 },
    { minimumOrders: 20, days: -1 }, { minimumOrders: 20, days: Infinity }]) {
    assert.deepEqual(evaluate([], { rules }).issues, ["configuration"]);
  }
  assert.deepEqual(evaluate([], { orders: undefined }).issues, ["orderData"]);
});

test("paid-only badges work with the existing API fields and require 20 distinct paid orders", () => {
  const paid = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1, paymentStatus: "Paid", status: "Pending",
    createdAt: "2020-01-01T00:00:00Z", customerPhone: "same-customer",
    orderDetails: [{ productId: 7, quantity: 500 }, { productId: 7, quantity: 1 }],
  }));
  const evaluatePaid = (rows: unknown[]) => calculatePaidOrderBadges({
    orders: bestSellerOrderSource.getOrders({ data: rows }), adapter: bestSellerOrderAdapter,
  });
  assert.deepEqual(evaluatePaid(paid.slice(0, 19)).rankings, []);
  const result = evaluatePaid([
    ...paid, ...paid, { ...paid[0], id: "1" },
    { id: 21, paymentStatus: "Unpaid", orderDetails: [{ productId: 7, quantity: 900 }] },
  ]);
  assert.equal(result.status, "ready");
  assert.deepEqual(result.rankings, [{ productId: "7", orderCount: 20 }]);
  assert.equal(bestSellerOrderAdapter.getCompletedAt, undefined);
  assert.equal(bestSellerOrderSource.getCoverage({}, NOW), undefined);
});

test("paid-only badges annotate a product independently of other catalog pages", () => {
  const result = applyBestSellers([{ id: "p1" }], {
    status: "ready", issues: [], rankings: [
      { productId: "p2", orderCount: 30 }, { productId: "p1", orderCount: 20 },
    ],
  }, { requireCompleteCatalog: false });
  assert.equal(result.products[0].isBestSeller, true);
  assert.equal(result.products[0].bestSellerOrderCount, 20);
  assert.deepEqual(result.bestSellingProducts.map(({ id }) => id), ["p1"]);
});

test("paid-only badges validate source records, duplicate conflicts and configurable thresholds", () => {
  const valid = order(1);
  assert.deepEqual(calculatePaidOrderBadges({ orders: [valid], adapter, minimumOrders: 1 }).rankings,
    [{ productId: "p1", orderCount: 1 }]);
  assert.deepEqual(calculatePaidOrderBadges({ orders: [], adapter, minimumOrders: 0 }).issues,
    ["configuration"]);
  for (const [orders, issue] of [
    [undefined, "orderData"], [[order("")], "orderId"],
    [[order(1, { paid: undefined })], "orderStatus"],
    [[order(1, { purchases: undefined })], "orderItems"],
    [[order(1, { purchases: [{ product: "" }] })], "productId"],
    [[valid, order(1, { paid: false })], "conflictingOrders"],
  ] as const) {
    const result = calculatePaidOrderBadges({ orders, adapter, minimumOrders: 1 });
    assert.equal(result.status, "unavailable");
    assert.ok(result.issues.includes(issue));
    assert.deepEqual(result.rankings, []);
  }
});

test("one unrelated malformed order no longer hides a confirmed Best Seller", () => {
  const orders = Array.from({ length: 21 }, (_, index) => order(index + 1));
  const malformed = [
    order(100, { purchases: [{ product: "" }] }),
    order(101, { purchases: undefined }),
    order(102, { paid: undefined }),
    order(""),
  ];
  const result = calculatePaidOrderBadges({ orders: [...orders, ...malformed], adapter });
  assert.equal(result.status, "ready");
  assert.deepEqual(result.rankings, [{ productId: "p1", orderCount: 21 }]);
  assert.ok(result.issues.includes("productId"));
  assert.ok(result.issues.includes("orderItems"));
  assert.ok(result.issues.includes("orderStatus"));
  assert.ok(result.issues.includes("orderId"));
  assert.equal(applyBestSellers([{ id: "p1" }], result).products[0].isBestSeller, true);
});

test("conflicting duplicate orders are excluded without affecting other confirmed orders", () => {
  const orders = Array.from({ length: 20 }, (_, index) => order(index + 1));
  const result = calculatePaidOrderBadges({ orders: [
    ...orders, order(999), order(999, { paid: false }),
  ], adapter });
  assert.equal(result.status, "ready");
  assert.ok(result.issues.includes("conflictingOrders"));
  assert.deepEqual(result.rankings, [{ productId: "p1", orderCount: 20 }]);
});

test("known product lines remain countable when another line has a missing product ID", () => {
  const result = calculatePaidOrderBadges({ orders: [order(1, {
    purchases: [{ product: "p1" }, { product: "" }],
  })], adapter, minimumOrders: 1 });
  assert.equal(result.status, "ready");
  assert.deepEqual(result.rankings, [{ productId: "p1", orderCount: 1 }]);
  assert.ok(result.issues.includes("productId"));
});

test("diagnostic counts include products below the threshold without giving them badges", () => {
  const result = calculatePaidOrderBadges({
    orders: Array.from({ length: 19 }, (_, index) => order(index + 1)), adapter,
  });
  assert.deepEqual(result.orderCounts, [{ productId: "p1", orderCount: 19 }]);
  const product = applyBestSellers([{ id: "p1" }], result).products[0];
  assert.equal(product.bestSellerOrderCount, 19);
  assert.equal(product.isBestSeller, false);
});

test("payment status matching accepts casing and whitespace without counting Unpaid", () => {
  const orders = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1, paymentStatus: index % 2 ? " paid " : "PAID",
    orderDetails: [{ product_id: "7", quantity: 1 }],
  }));
  const result = calculatePaidOrderBadges({ orders: [
    ...orders, { id: 21, paymentStatus: "Unpaid", orderDetails: [{ product_id: "7", quantity: 100 }] },
  ], adapter: bestSellerOrderAdapter });
  assert.deepEqual(result.rankings, [{ productId: "7", orderCount: 20 }]);
});

test("the supplied orderDetails schema matches product_id, not the order-line id", () => {
  const order = {
    id: 278, status: "Completed", paymentStatus: "Paid",
    orderDetails: [{ id: 385, order_id: 278, product_id: 70, quantity: 23, price: "429.00", product_name: "D1" }],
  };
  const result = calculatePaidOrderBadges({ orders: [order], adapter: bestSellerOrderAdapter });
  assert.deepEqual(result.orderCounts, [{ productId: "70", orderCount: 1 }]);
  const products = applyBestSellers([{ id: 70 }, { id: 385 }], result).products;
  assert.equal(products[0].bestSellerOrderCount, 1);
  assert.equal(products[1].bestSellerOrderCount, 0);
  assert.equal(products[0].isBestSeller, false);
});

test("20 distinct paid orders with the supplied snake_case schema badge only product 70", () => {
  const orders = Array.from({ length: 20 }, (_, index) => ({
    id: 278 + index, paymentStatus: "Paid", status: "Completed",
    orderDetails: [{ id: 385 + index, order_id: 278 + index, product_id: 70, quantity: 23 }],
  }));
  const result = calculatePaidOrderBadges({ orders: [...orders, ...orders], adapter: bestSellerOrderAdapter });
  assert.deepEqual(result.rankings, [{ productId: "70", orderCount: 20 }]);
  const products = applyBestSellers([{ id: 70 }, { id: 385 }], result).products;
  assert.equal(products[0].isBestSeller, true);
  assert.equal(products[1].isBestSeller, false);
});

test("the verified product_id field takes precedence over a legacy alias", () => {
  assert.equal(bestSellerOrderAdapter.getProductId({ id: 385, product_id: 70, productId: 385 }), "70");
  assert.equal(bestSellerOrderAdapter.getProductId({ id: 385 }), undefined);
});

test("23 paid units in the supplied order immediately badge product 70", () => {
  const order = { id: 278, paymentStatus: "Paid", status: "Completed", orderDetails: [
    { id: 385, order_id: 278, product_id: 70, quantity: 23, price: "429.00", product_name: "D1" },
  ] };
  const result = calculatePaidUnitBadges({ orders: [order], adapter: bestSellerOrderAdapter });
  assert.deepEqual(result.rankings, [{ productId: "70", unitCount: 23, orderCount: 1 }]);
  const products = applyBestSellers([{ id: 70 }, { id: 385 }], result).products;
  assert.equal(products[0].isBestSeller, true);
  assert.equal(products[0].bestSellerUnitCount, 23);
  assert.equal(products[0].bestSellerOrderCount, 1);
  assert.equal(products[1].isBestSeller, false);
});

test("paid unit totals cross the 20-unit threshold across different orders", () => {
  const first = { id: 1, paymentStatus: "Paid", orderDetails: [{ id: 1, product_id: 70, quantity: 11 }] };
  const second = { id: 2, paymentStatus: "Paid", orderDetails: [{ id: 2, product_id: 70, quantity: "9" }] };
  const before = calculatePaidUnitBadges({ orders: [first], adapter: bestSellerOrderAdapter });
  assert.deepEqual(before.rankings, []);
  assert.deepEqual(before.unitCounts, [{ productId: "70", unitCount: 11 }]);
  const after = calculatePaidUnitBadges({ orders: [first, second], adapter: bestSellerOrderAdapter });
  assert.deepEqual(after.rankings, [{ productId: "70", unitCount: 20, orderCount: 2 }]);
});

test("duplicate orders and duplicate line IDs do not inflate paid quantities", () => {
  const line = { id: 385, product_id: 70, quantity: 12 };
  const order = { id: 278, paymentStatus: "Paid", orderDetails: [line, line] };
  const result = calculatePaidUnitBadges({ orders: [order, order, { ...order, id: "278" }], adapter: bestSellerOrderAdapter });
  assert.deepEqual(result.unitCounts, [{ productId: "70", unitCount: 12 }]);
  assert.deepEqual(result.rankings, []);
});

test("distinct lines for the same product add quantities within one paid order", () => {
  const result = calculatePaidUnitBadges({ orders: [{ id: 278, paymentStatus: "Paid", orderDetails: [
    { id: 385, product_id: 70, quantity: 11 }, { id: 386, product_id: 70, quantity: 12 },
  ] }], adapter: bestSellerOrderAdapter });
  assert.deepEqual(result.rankings, [{ productId: "70", unitCount: 23, orderCount: 1 }]);
});

test("unpaid orders and invalid quantities do not inflate confirmed paid units", () => {
  const orders = [
    { id: 1, paymentStatus: "Paid", orderDetails: [{ id: 1, product_id: 70, quantity: 20 }] },
    { id: 2, paymentStatus: "Unpaid", orderDetails: [{ id: 2, product_id: 70, quantity: 100 }] },
    ...[-2, 1.5, "invalid", "", null, undefined].map((quantity, index) => ({
      id: index + 3, paymentStatus: "Paid", orderDetails: [{ id: index + 3, product_id: 70, quantity }],
    })),
  ];
  const result = calculatePaidUnitBadges({ orders, adapter: bestSellerOrderAdapter });
  assert.deepEqual(result.rankings, [{ productId: "70", unitCount: 20, orderCount: 1 }]);
  assert.ok(result.issues.includes("quantity"));
});

test("paid-unit threshold is configurable and every qualifying product is included", () => {
  const orders = [{ id: 278, paymentStatus: "Paid", orderDetails: Array.from({ length: 14 }, (_, index) => ({
    id: 385 + index, product_id: index + 1, quantity: index + 20,
  })) }];
  const result = calculatePaidUnitBadges({ orders, adapter: bestSellerOrderAdapter });
  assert.equal(result.rankings.length, 14);
  assert.deepEqual(result.rankings[0], { productId: "14", unitCount: 33, orderCount: 1 });
  assert.equal(calculatePaidUnitBadges({ orders, adapter: bestSellerOrderAdapter, minimumUnits: 30 }).rankings.length, 4);
  assert.deepEqual(calculatePaidUnitBadges({ orders, adapter: bestSellerOrderAdapter, minimumUnits: 0 }).issues, ["configuration"]);
});

test("contradictory quantities for one order are excluded without erasing other sales", () => {
  const order = { id: 1, paymentStatus: "Paid", orderDetails: [{ id: 1, product_id: 70, quantity: 20 }] };
  const duplicate = { ...order, orderDetails: [{ id: 1, product_id: 70, quantity: 100 }] };
  const other = { id: 2, paymentStatus: "Paid", orderDetails: [{ id: 2, product_id: 70, quantity: 23 }] };
  const result = calculatePaidUnitBadges({ orders: [order, duplicate, other], adapter: bestSellerOrderAdapter });
  assert.deepEqual(result.rankings, [{ productId: "70", unitCount: 23, orderCount: 1 }]);
  assert.ok(result.issues.includes("conflictingOrders"));
});
