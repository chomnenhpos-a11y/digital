import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { orderService } from "../../../../services/orderService";
import { orderKeys } from "../../../../queries/orders/orderKeys";
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useCategoriesQuery } from "../../../../queries/categories/useCategoryQueries";
import {
  getDefaultProductSaleDateRange,
  isValidProductSaleDateRange,
  normalizeProductSaleRows,
} from "../schemas/productsaleSchemas";
import { getProductSaleSummary } from "../utils/productSaleSummary";

const REPORT_PAGE_SIZE = 10;
export default function useProductsSale() {
  const { t, i18n } = useTranslation();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState(getDefaultProductSaleDateRange);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ seller: "", group: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const isRangeValid = isValidProductSaleDateRange(dateRange);

  // ── Report data ────────────────────────────────────────────────────────────
  const rangeKey = `${dateRange.startDate}|${dateRange.endDate}`;
  const { data: rows = [], isPending, isError } = useQuery({
    queryKey: orderKeys.productSales(rangeKey),
    queryFn: ({ signal }) => orderService.getProductSales(dateRange, { signal }),
    enabled: isRangeValid,
    retry: false,
    select: (response) => normalizeProductSaleRows(response?.data ?? response),
  });

  // ── Group (product group == category) reference data ───────────────────────
  const { data: products = [] } = useProductsQuery({});
  const { data: categories = [] } = useCategoriesQuery();

  // product_id -> categoryId, used to group report rows by product group
  const productCategoryMap = useMemo(() => {
    const map = {};
    for (const product of products) {
      if (product?.id != null && product?.categoryId != null) {
        map[String(product.id)] = String(product.categoryId);
      }
    }
    return map;
  }, [products]);

  const groupOptions = useMemo(() => {
    const localized = (category) => {
      const isKhmer = i18n.language?.startsWith("km");
      return isKhmer && category?.name_local ? category.name_local : category?.name;
    };
    return categories
      .map((category) => ({
        value: String(category.id),
        label: localized(category) || `#${category.id}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories, i18n.language]);

  // ── Seller options (from the report rows themselves) ───────────────────────
  const sellerOptions = useMemo(() => {
    const sellers = new Set(
      rows
        .map((row) => row.seller_name)
        .filter((seller) => seller && seller !== "-")
    );
    return [...sellers].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // ── Client-side refinement ─────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => {
        const matchSearch =
          !search.trim() ||
          (row.product_name || "").toLowerCase().includes(search.trim().toLowerCase());

        const matchSeller = !filters.seller || row.seller_name === filters.seller;

        const rowCategoryId = productCategoryMap[String(row.product_id)] || "";
        const matchGroup = !filters.group || rowCategoryId === filters.group;

        return matchSearch && matchSeller && matchGroup;
      })
      .sort((a, b) => {
        const dateA = new Date(a.sale_date || 0);
        const dateB = new Date(b.sale_date || 0);
        return dateB - dateA;
      });
  }, [rows, search, filters, productCategoryMap]);

  // Reset to the first page whenever the window or refinements change
  useEffect(() => {
    setCurrentPage(1);
  }, [rangeKey, search, filters.seller, filters.group]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredRows.length / REPORT_PAGE_SIZE) || 1;
  const paginatedRows = useMemo(
    () =>
      filteredRows.slice(
        (currentPage - 1) * REPORT_PAGE_SIZE,
        currentPage * REPORT_PAGE_SIZE
      ),
    [filteredRows, currentPage]
  );

  // ── KPI summary (over the refined rows, not just the visible page) ────────
  const summary = useMemo(() => getProductSaleSummary(filteredRows), [filteredRows]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDateRangeChange = (nextRange) => {
    if (nextRange && typeof nextRange === "object") {
      setDateRange((prev) => ({ ...prev, ...nextRange }));
    }
  };

  const handleSearchChange = (event) => setSearch(event.target.value);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => {
    setDateRange(getDefaultProductSaleDateRange());
    setSearch("");
    setFilters({ seller: "", group: "" });
    setCurrentPage(1);
  };

  return {
    t,
    i18n,
    isLoading: isPending || !isRangeValid,
    isError,
    dateRange,
    search,
    filters,
    currentPage,
    totalPages,
    paginatedRows,
    filteredRows,
    summary,
    sellerOptions,
    groupOptions,
    setCurrentPage,
    handleDateRangeChange,
    handleSearchChange,
    handleFilterChange,
    handleReset,
  };
}

export { REPORT_PAGE_SIZE as PRODUCT_SALE_PAGE_SIZE };
