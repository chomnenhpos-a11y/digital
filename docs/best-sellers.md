# Best Seller badges

The home product grid and the related product cards on the detail page show a
gold badge on the product image when `product.isBestSeller === true`. The label
is `ទំនិញលក់ដាច់` in Khmer and `Best Seller` in English. There is no separate
Best Sellers section or sales-data warning panel.

## Current rule

The selected rule is **20 paid units sold, all time**, as requested.

- Only orders with the existing `paymentStatus: "Paid"` value count.
- Sum `orderDetails[].quantity` for each `product_id` in paid orders.
- One paid order containing 23 units contributes 23 units and qualifies the product.
- Repeated copies of an order count once. Repeated copies of the same order-line
  ID count once; distinct lines for the same product add their quantities.
- Separate orders from the same customer contribute their paid quantities.
- There is no date limit, completion-status requirement, or Top 10 cap.
- Refund/return filtering is not part of this paid-only rule. Its input is the
  current API payment status, without assumptions about unavailable refund data.

`calculatePaidUnitBadges` in `src/utils/bestSellers.ts` aggregates quantities by
order ID and product ID, deduplicating known order-line IDs. It runs before
search, category filtering, and product pagination. Quantities must be valid
nonnegative whole numbers; numeric API strings are supported.
The observed totals are not an exhaustive global sales ranking when history is
incomplete. Confirming 20 paid units establishes the badge even if other history
has not loaded. Below 20 confirmed paid units, the product receives no badge.

Malformed records are isolated: an unrelated incomplete order cannot erase
confirmed sales. Known product lines in a paid order still count when another
line has no product ID. Contradictory copies of the same order are excluded from
all counts for that order ID. Loading and request errors suppress badges.

## Configuration

`src/config/bestSellers.ts` selects the mode and threshold:

```ts
export const BEST_SELLER_MODE: BestSellerMode = "paid-units-all-time";
export const BEST_SELLER_RULES = { minimumUnits: 20, minimumOrders: 20, days: 30 };
```

`minimumUnits` must be a positive safe integer. `minimumOrders` and `days` are
ignored in paid-units mode. The hook also accepts `mode` and `rules` overrides; use the shared
configuration for consistent badges across the home and detail pages.

## Existing API connection

The hook reuses `orderService.getOrders({ shop_code }, { signal })` and accepts
an array or the existing `{ data: [...] }` response envelope. Its adapter reads
only established fields: order `id`, `paymentStatus`, `orderDetails`/`items`, and
item `productId`/`product_id`, `quantity`, and the order-line `id`.
An order-detail `id` is not treated as a product ID.
No backend changes or invented API fields are needed for the selected rule.

The expanded response confirms that a line with `id: 385`, `order_id: 278`,
`product_id: 70`, and `quantity: 23` belongs to product **70**, not product 385.
It contributes **23 paid units** for product 70 and qualifies that product for
the card badge. Its distinct order count remains one for diagnostics.
The adapter prioritizes this confirmed `product_id` field over the legacy
`productId` alias and never substitutes the line's own `id`.

The query is scoped to the current store and uses the existing `orders/list`
key prefix so existing order mutations invalidate it. It refreshes every minute
and on window focus. If the API paginates history, load all pages using its real
pagination contract to discover every qualifying product. The badge calculation
never treats the first page as proof of complete global coverage.

## Components

`ProductSection.jsx` and `ProductDetail.jsx` already use this connection:

```jsx
const productsQuery = useProductsQuery({ shop_code });
const { products } = useBestSellers({ shopCode: shop_code, catalog: productsQuery });
```

The returned products include boolean `isBestSeller`, observed
`bestSellerUnitCount`, and diagnostic `bestSellerOrderCount` values.
Pass them to the existing `ProductGrid` or
`HorizontalProductGrid`. Both render `ProductCard`, which displays the badge
conditionally. The home page filters and paginates these decorated products.

The hook exposes `loading`, `error`, `unavailable`, `empty`, and `ready` states,
with machine-readable `issues` for incomplete records. Its `diagnostics` value
and React DevTools debug value include the request error/HTTP status, unit
threshold, unit totals, and distinct paid-order counts for matched products,
including totals below 20. A product with 19 paid units reports 19 without a badge.
The normal catalog keeps
its existing loading and empty presentation; no separate badge-status panel is
shown to shoppers.

## Optional strict mode

`BEST_SELLER_MODE = "paid-orders-all-time"` retains the earlier rule of
`minimumOrders` distinct paid orders, independent of quantity. It uses
`calculatePaidOrderBadges`. This is an optional mode, not the selected card rule.

The previous completion-window calculation remains available by selecting
`BEST_SELLER_MODE = "completed-orders-window"`. This mode uses
`calculateBestSellers`, requires full verified order coverage, counts completed
paid orders by their actual completion instant, and excludes cancelled orders,
full order refunds, and fully returned purchase lines. Its period is configurable
with `days`.

The provided screenshot establishes `createdAt`, not a completion instant. Its
expanded order details do not include full refund or return data, and a
49-record response alone does not prove complete history. The unauthenticated
orders endpoint returned HTTP 401 during inspection. Before enabling strict mode,
connect verified API data to the existing configuration extension points:

| Reader | Required meaning |
| --- | --- |
| `getCompletedAt(order)` | Actual completion instant, as epoch milliseconds, a Date, or an ISO string with timezone. |
| `isFullyRefunded(order)` | Whether the order is fully refunded. |
| `isFullyReturned(item, order)` | Whether this purchase line was fully returned. |
| `getCoverage(response, asOf)` | Internal `{ complete, from, through }` contract covering the entire requested period, including all pages. |

These readers currently return no value for unverified data. Do not substitute
`createdAt` for completion, or unknown refund/return values for `false`. Strict
mode suppresses badges until these data requirements are established. It also
checks that every globally qualifying product can be joined to the catalog.

## Validation

```sh
npm run test:best-sellers
npm run typecheck:best-sellers
npm run build
npm run lint
```

The tests use Node's built-in TypeScript support (Node 22.18+ or a newer supported
release) and cover both modes, distinct orders, duplicate rows and items, customer
identity, quantities, thresholds, time windows, exclusions, missing data, and
catalog completeness.
