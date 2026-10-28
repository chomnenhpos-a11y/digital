import { formatSaleAmount } from "../schemas/productsaleSchemas.js";

/**
 * Computes the KPI summary of a product-sales report:
 * total revenue, total quantity sold, the top seller (by revenue)
 * and the top product (by units sold, tie-broken by revenue).
 * All values are computed from the rows passed in — i.e. always
 * reference the currently filtered data.
 *
 * @param {Array} rows - Normalized product-sale rows (already filtered)
 * @returns {{
 *   totalSales: number,
 *   totalQuantity: number,
 *   topSeller: { name: string, total: number } | null,
 *   topProduct: { id: number|string, name: string, total: number, quantity: number } | null,
 * }}
 */
export function getProductSaleSummary(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      totalSales: 0,
      totalQuantity: 0,
      topSeller: null,
      topProduct: null,
      formattedTotalSales: formatSaleAmount(0),
    };
  }

  const salesBySeller = new Map();
  const salesByProduct = new Map();

  const summary = rows.reduce(
    (acc, row) => {
      const rowTotal = Number(row.total_price || 0);
      acc.totalSales += rowTotal;
      acc.totalQuantity += Number(row.quantity || 0);

      const seller = row.seller_name || "-";
      const sellerEntry = salesBySeller.get(seller) || { name: seller, total: 0 };
      sellerEntry.total += rowTotal;
      salesBySeller.set(seller, sellerEntry);

      const productKey = `${row.product_id}`;
      const productEntry = salesByProduct.get(productKey) || {
        id: row.product_id,
        name: row.product_name || "-",
        total: 0,
        quantity: 0,
      };
      productEntry.total += rowTotal;
      productEntry.quantity += Number(row.quantity || 0);
      salesByProduct.set(productKey, productEntry);

      return acc;
    },
    { totalSales: 0, totalQuantity: 0, topSeller: null, topProduct: null }
  );

  const sellers = [...salesBySeller.values()];
  // Skip the placeholder "-" seller so the report never credits nobody
  const realSellers = sellers.filter((seller) => seller.name !== "-");
  summary.topSeller =
    realSellers.sort((a, b) => b.total - a.total)[0] || sellers[0] || null;

  const products = [...salesByProduct.values()];
  // "Top Product" = best-SELLING product: most UNITS sold first,
  // ties broken by higher revenue — NOT by revenue alone
  summary.topProduct =
    products.sort((a, b) => b.quantity - a.quantity || b.total - a.total)[0] ||
    null;

  summary.formattedTotalSales = formatSaleAmount(summary.totalSales);

  return summary;
}
