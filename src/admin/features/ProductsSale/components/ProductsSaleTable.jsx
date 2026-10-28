import React from "react";
import { useTranslation } from "react-i18next";
import DataTable from "../../../components/common/DataTable";
import DataTableSkeleton from "../../../components/common/DataTableSkeleton";
import Pagination from "../../../components/common/Pagination";
import { formatSaleDate, formatSaleAmount } from "../schemas/productsaleSchemas";

export default function ProductsSaleTable({
  rows = [],
  isLoading = false,
  noRowIndex = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return <DataTableSkeleton columns={8} rows={8} />;
  }

  const numberedRows = (rows || []).map((row, index) => ({
    ...row,
    _no: noRowIndex + index + 1,
  }));

  const columns = [
    {
      header: t("productsSale.no") || "#No",
      accessor: "_no",
      render: (row) => (
        <span className="font-semibold text-slate-500">
          {`#${String(row._no).padStart(2, "0")}`}
        </span>
      ),
    },
    {
      header: t("productsSale.productName") || "Product Name",
      accessor: "product_name",
      render: (row) => (
        <span className="font-medium text-slate-800">{row.product_name || "-"}</span>
      ),
    },
    {
      header: t("productsSale.quantity") || "Quantity",
      accessor: "quantity",
      align: "center",
      render: (row) => (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
          {row.quantity}
        </span>
      ),
    },
    {
      header: t("productsSale.price") || "Price",
      accessor: "price",
      align: "right",
      render: (row) => formatSaleAmount(row.price),
    },
    {
      header: t("productsSale.totalPrice") || "Total Price",
      accessor: "total_price",
      align: "right",
      render: (row) => (
        <span className="font-semibold text-[#0d874c]">
          {formatSaleAmount(row.total_price)}
        </span>
      ),
    },
    {
      header: t("productsSale.saleDate") || "Sale Date",
      accessor: "sale_date",
      align: "center",
      render: (row) => (
        <span className="text-slate-500">{formatSaleDate(row.sale_date)}</span>
      ),
    },
    {
      header: t("productsSale.orderNo") || "Order No",
      accessor: "order_no",
    },
    {
      header: t("productsSale.seller") || "Seller",
      accessor: "seller_name",
      render: (row) => (
        <span className="italic text-slate-600">{row.seller_name || "-"}</span>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={numberedRows}
        keyField="_key"
        emptyMessage={
          t("productsSale.emptyMessage") ||
          "No product sales found for the selected window."
        }
      />
      {typeof onPageChange === "function" && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
