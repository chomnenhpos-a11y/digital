import { z } from "zod";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Validates the date-range payload sent to the backend. */
export const productSaleFilterSchema = z
  .object({
    startDate: z.string().regex(ISO_DATE_PATTERN, "start date must be YYYY-MM-DD"),
    endDate: z.string().regex(ISO_DATE_PATTERN, "end date must be YYYY-MM-DD"),
  })
  .refine(
    (range) => new Date(range.startDate) <= new Date(range.endDate),
    { message: "startDate must be on or before endDate" }
  );

/** Validates + coerces a single row returned by the backend. */
export const productSaleRowSchema = z.object({
  product_id: z.coerce.number().int().positive(),
  product_name: z.coerce.string().default(""),
  quantity: z.coerce.number().min(0).default(0),
  price: z.coerce.number().min(0).default(0),
  total_price: z.coerce.number().min(0).default(0),
  sale_date: z.coerce.string().default(""),
  order_no: z.coerce.string().default(""),
  setting_id: z.coerce.number().nullable().optional(),
  seller_name: z.coerce.string().nullable().default(null),
});

/** Local "today" as YYYY-MM-DD (no UTC shifting). */
export function getTodayISODate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Local "yesterday" as YYYY-MM-DD (no UTC shifting). */
export function getYesterdayISODate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate());
  return [
    yesterday.getFullYear(),
    String(yesterday.getMonth() + 1).padStart(2, "0"),
    String(yesterday.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getDefaultProductSaleDateRange() {
  return {
    startDate: getYesterdayISODate(),
    endDate: getTodayISODate(),
  };
}

/** Guards a manual date-range change against invalid/partial input. */
export function isValidProductSaleDateRange(range) {
  return productSaleFilterSchema.safeParse(range).success;
}

export function normalizeProductSaleRows(rawRows) {
  if (!Array.isArray(rawRows)) return [];

  return rawRows.reduce((rows, rawRow) => {
    if (typeof rawRow !== "object" || rawRow === null) return rows;

    const normalizedInput = {
      ...rawRow,
      product_name: rawRow.product_name ?? rawRow.productname ?? "",
      seller_name:
        rawRow.seller_name ??
        (typeof rawRow.seller === "string" ? rawRow.seller : rawRow.seller?.name) ??
        null,
    };

    const parsed = productSaleRowSchema.safeParse(normalizedInput);
    if (!parsed.success) return rows;

    const row = { ...parsed.data, seller_name: parsed.data.seller_name || "-" };
    row._key = `${row.order_no || "no-order"}-${row.product_id}-${rows.length}`;
    rows.push(row);
    return rows;
  }, []);
}

/** Formats a backend sale_date for display (e.g. "10/20/2026, 07:25 PM"). */
export function formatSaleDate(saleDate, locale = "en-US") {
  if (!saleDate) return "-";
  const date = new Date(saleDate);
  if (Number.isNaN(date.getTime())) return String(saleDate);
  return date.toLocaleString(locale === "km" ? "en-GB" : locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Formats money values consistently across the page, cards and exports. */
export function formatSaleAmount(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}
