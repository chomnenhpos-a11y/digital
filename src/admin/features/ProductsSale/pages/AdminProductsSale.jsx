import React, { useState } from "react";
import { FileSpreadsheet, FileText, LayoutGrid, Table2 } from "lucide-react";
import Swal from "../../../../lib/alert";
import PageHeader from "../../../components/common/PageHeader";
import Pagination from "../../../components/common/Pagination";
import useProductsSale, { PRODUCT_SALE_PAGE_SIZE } from "../hooks/useProductsSale";
import ProductsSaleToolbar from "../components/ProductsSaleToolbar";
import ProductsSaleStats from "../components/ProductsSaleStats";
import ProductsSaleTable from "../components/ProductsSaleTable";
import ProductsSaleCardView from "../components/ProductsSaleCardView";
import { getTodayISODate } from "../schemas/productsaleSchemas";
import { exportProductSalesToExcel } from "../utils/exportProductSalesExcel";
import { exportProductSalesToPDF } from "../utils/exportProductSalesPDF";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsQuery } from "../../../../queries/settings/useSettingQueries";

export default function AdminProductsSale() {
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const { user } = useAuth();
  const shopCode = user?.shop?.code || user?.shop_code || "";
  const { data: settings } = useSettingsQuery(shopCode);

  const {
    isLoading,
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
    t,
    i18n,
    setCurrentPage,
    handleDateRangeChange,
    handleSearchChange,
    handleFilterChange,
    handleReset,
  } = useProductsSale();

  const labels = {
    from: t("productsSale.from") || "From",
    to: t("productsSale.to") || "To",
    searchPlaceholder: t("productsSale.searchPlaceholder") || "Search by Product Name",
    seller: t("productsSale.selectSeller") || "Select Seller",
    group: t("productsSale.selectGroup") || "Select Group",
    reset: t("productsSale.reset") || "Reset",
    totalSales: t("productsSale.totalSales") || "Total Sales",
    productsSold: t("productsSale.productsSold") || "Products Sold",
    topSeller: t("productsSale.topSeller") || "Top Seller",
    topProduct: t("productsSale.topProduct") || "Top Product",
    unitsSold: t("productsSale.unitsSold") || "units sold",
    itemsInWindow: t("productsSale.itemsInWindow") || "items in this window",
    ofSales: t("productsSale.ofSales") || "of sales",
    noSellerData: t("productsSale.noSellerData") || "No seller data in this window",
    noProductData: t("productsSale.noProductData") || "No product data in this window",
    empty: t("productsSale.emptyMessage") || "No product sales found for the selected window.",
  };

  const notifyNoData = () => {
    Swal.fire({
      icon: "info",
      title: t("productsSale.noDataTitle") || "No Data",
      text: t("productsSale.noDataMessage") || "No product sales found for the selected window.",
    });
  };

  const noRowIndex = (currentPage - 1) * PRODUCT_SALE_PAGE_SIZE;

  const currentLang =
    i18n?.language?.split("-")[0] ||
    (typeof window !== "undefined" ? localStorage.getItem("language") : "en") ||
    "en";

  const handleExcelExport = () => {
    if (!filteredRows || filteredRows.length === 0) {
      notifyNoData();
      return;
    }
    exportProductSalesToExcel(filteredRows, dateRange, settings, { language: currentLang });
  };

  const handlePDFExport = async () => {
    if (!filteredRows || filteredRows.length === 0) {
      notifyNoData();
      return;
    }
    setIsExportingPDF(true);
    try {
      await exportProductSalesToPDF(filteredRows, dateRange, settings, { language: currentLang });
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={t("productsSale.title") || "Product Sales Report"}
          description={
            t("productsSale.subtitle") ||
            "Analyze and track your product sales performance."
          }
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExcelExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            {t("productsSale.excel") || "Excel"}
          </button>
          <button
            type="button"
            disabled={isExportingPDF}
            onClick={handlePDFExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 border border-red-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <FileText size={14} className={isExportingPDF ? "animate-pulse" : ""} />
            {isExportingPDF ? "..." : (t("productsSale.pdf") || "PDF")}
          </button>
          <button
            type="button"
            onClick={() => setViewMode((prev) => (prev === "table" ? "card" : "table"))}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
            title={
              viewMode === "table"
                ? t("productsSale.switchToCard") || "Switch to card view"
                : t("productsSale.switchToTable") || "Switch to table view"
            }
          >
            {viewMode === "table" ? <LayoutGrid size={14} /> : <Table2 size={14} />}
            {viewMode === "table"
              ? t("productsSale.viewCard") || "Card"
              : t("productsSale.viewTable") || "Table"}
          </button>
        </div>
      </div>

      <ProductsSaleStats summary={summary} isLoading={isLoading} labels={labels} />
      <ProductsSaleToolbar
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        sellerOptions={sellerOptions}
        groupOptions={groupOptions}
        labels={labels}
        maxDate={getTodayISODate()}
      />

      {isError ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-sm text-slate-500">
          {t("productsSale.errorLoading") ||
            "Could not load the product sales report. Please try resetting the date range."}
        </div>
      ) : viewMode === "table" ? (
        <ProductsSaleTable
          rows={paginatedRows}
          isLoading={isLoading}
          noRowIndex={noRowIndex}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : (
        <>
          <ProductsSaleCardView
            rows={paginatedRows}
            isLoading={isLoading}
            emptyLabel={labels.empty}
          />
          {!isLoading && (
            <div className="flex items-center justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
