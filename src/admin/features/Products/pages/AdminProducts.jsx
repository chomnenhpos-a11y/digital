import { useState } from "react";
import { Plus, Edit, SlidersHorizontal, ImageOff } from "lucide-react";
import { useProducts, getStockStatus } from "../hooks/useProducts";
import ProductsForm from "../components/ProductForm";
import DataTable from "../../../components/common/DataTable";
import DataTableSkeleton from "../../../components/common/DataTableSkeleton";
import SearchBar from "../../../components/common/SearchBar";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import PageHeader from "../../../components/common/PageHeader";
import FilterBar from "../../../components/common/FilterBar";
import Pagination from "../../../components/common/Pagination";
import { useCategoriesQuery } from "../../../../queries/categories/useCategoryQueries";
import { useTranslation } from "react-i18next";

export default function AdminProducts() {
  const { t } = useTranslation();
  const { data: categories = [], isPending: isCategoriesPending } = useCategoriesQuery();

  const {
    search,
    filters,
    sortOrder,
    currentPage,
    isModalOpen,
    editingProduct,
    paginatedProducts,
    totalPages,
    isLoading: isProductsLoading,
    setCurrentPage,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    handleSubmit,
    handleEdit,
    openAddModal,
    closeModal,
  } = useProducts();

  const isLoading = isCategoriesPending || isProductsLoading;

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const columns = [
    {
      header: t('products.image'),
      render: (row) =>
        row.image ? (
          <img
            src={row.image}
            alt={row.name}
            className="h-16 w-16 min-w-[4rem] object-cover rounded-lg"
          />
        ) : (
          <div className="h-16 w-16 min-w-[4rem] bg-[#fcfafb] rounded-lg flex items-center justify-center text-xs text-gray-400">
            <ImageOff size={20} className="text-gray-400"/>
          </div>
        ),
    },

    {
      header: t('products.productName'),
      accessor: "name",
    },

    {
      header: "SKU",
      accessor: "sku",
    },

    {
      header: t('products.category'),
      accessor: "categoryName",
    },

    {
      header: t('products.originalPrice'),
      render: (row) => (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#fcfafb] text-slate-600">
          ${Number(row.price).toFixed(2)}
        </span>
      ),
    },
    {
      header: t('products.discount'),
      render: (row) =>
        Number(row.discountPrice) > 0 ? (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
            ${Number(row.discountPrice).toFixed(2)}
          </span>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        ),
    },

    {
      header: t('products.salePrice'),
      render: (row) => (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
          ${Number(row.salePrice).toFixed(2)}
        </span>
      ),
    },

    {
      header: t('products.stock'),
      accessor: "stockQuantity",
    },

    {
      header: t('products.status'),
      render: (row) => {
        const status = getStockStatus(row.stockQuantity);

        const styles = {
          "In Stock": "bg-green-100 text-green-700",
          "Low Stock": "bg-yellow-100 text-yellow-700",
          "Out of Stock": "bg-red-100 text-red-700",
        };

        const statusKhmer =
          status === "In Stock"
            ? t('products.inStock')
            : status === "Low Stock"
              ? t('products.lowStock')
              : status === "Out of Stock"
                ? t('products.outOfStock')
                : status;

        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[status]}`}
          >
            {statusKhmer}
          </span>
        );
      },
    },
    {
      header: t('products.createdAt'),
      render: (row) => (
        <span className="text-sm text-slate-600">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleString("km-KH", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </span>
      ),
    },

    {
      header: t('common.actions'),
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 bg-[#fcfafb] border border-slate-200 rounded-xl text-amber-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all"
            title={t('products.editProduct')}
          >
            <Edit size={18} />
          </button>
        </div>
      ),
    },
  ];

  const productFilters = [
    {
      key: "category",
      options: [t('common.all'), ...categories.map((c) => c.name)],
      searchable: true,
    },
  ];

  const categoryFilters = [
    {
      key: "status",
      options: [t('common.all'), "In Stock", "Low Stock", "Out of Stock"],
    },
  ];

  return (
    <div className="space-y-6">
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? t('products.editProduct') : t('products.addProductTitle')}
      >
        <ProductsForm initialData={editingProduct} onSubmit={handleSubmit} />
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={t('products.pageTitle')}
          description={t('products.pageDescription')}
        />
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          {/* Desktop Filters Layout: Category -- Status -- Sort */}
          <div className="hidden md:flex flex-wrap items-center gap-4">
            <FilterBar
              filters={productFilters}
              values={filters}
              onChange={handleFilterChange}
            />

            <FilterBar
              filters={categoryFilters}
              values={filters}
              onChange={handleFilterChange}
            />

            <FilterBar
              filters={[
                {
                  key: "sort",
                  options: [t('common.sortNewest'), t('common.sortAZ'), t('common.sortZA')],
                },
              ]}
              values={{ sort: sortOrder }}
              onChange={(key, value) =>
                handleSortChange({
                  target: { value },
                })
              }
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder={t('products.searchPlaceholder')}
              className="w-full max-w-sm"
            />

            <Button
              variant="primary"
              onClick={() => openAddModal()}
              className="shrink-0 whitespace-nowrap h-[42px] px-5"
            >
              <Plus size={16} className="mr-2" />

              <span className="hidden md:inline">{t('products.addProduct')}</span>

              <span className="md:hidden">{t('common.addBtn')}</span>
            </Button>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className={`md:hidden shrink-0 w-10 py-2.5 flex items-center justify-center rounded-xl border transition-colors ${
                showAdvancedFilters
                  ? "bg-[#fcfafb] border-slate-300 text-slate-700"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
              title={t('common.showFilters')}
              aria-label={t('common.showFilters')}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Filters Dropdown Layout: Category -- Status -- Sort */}
        <div
          className={`grid transition-all duration-300 ease-in-out md:hidden ${
            showAdvancedFilters
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 !mt-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-nowrap overflow-x-auto justify-between items-center gap-4 p-4 bg-[#fcfafb] border border-slate-200 rounded-xl">
              <FilterBar
                filters={productFilters}
                values={filters}
                onChange={handleFilterChange}
              />

              <FilterBar
                filters={categoryFilters}
                values={filters}
                onChange={handleFilterChange}
              />

              <FilterBar
                filters={[
                  {
                    key: "sort",
                    options: [t('common.sortNewest'), t('common.sortAZ'), t('common.sortZA')],
                  },
                ]}
                values={{ sort: sortOrder }}
                onChange={(key, value) =>
                  handleSortChange({
                    target: { value },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl">
        {isLoading ? (
          <DataTableSkeleton columns={columns.length} rows={5} />
        ) : (
          <>
            <DataTable columns={columns} data={paginatedProducts} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
