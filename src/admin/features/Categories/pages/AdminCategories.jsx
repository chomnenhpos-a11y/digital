import React, { useState } from 'react'
import { Plus, Edit, SlidersHorizontal, Search, ImageOff } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import CategoryForm from '../components/CategoryForm'
import DataTable from '../../../components/common/DataTable'
import DataTableSkeleton from '../../../components/common/DataTableSkeleton'
import SearchBar from '../../../components/common/SearchBar'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import PageHeader from '../../../components/common/PageHeader'
import FilterBar from '../../../components/common/FilterBar'
import Pagination from '../../../components/common/Pagination'
import { useProducts } from '../../Products/hooks/useProducts'
import { useTranslation } from 'react-i18next'

export default function AdminCategories() {
  const { t } = useTranslation()
  const { products } = useProducts()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const {
    filters,
    sortOrder,
    currentPage,
    isModalOpen,
    editingCategory,
    paginatedCategories,
    totalPages,
    isCategoriesLoading,
    setCurrentPage,
    handleFilterChange,
    handleSortChange,
    handleSubmit,
    handleEdit,
    openAddModal,
    closeModal,
    setEditingCategory,
    setIsModalOpen,
    updateFilter
  } = useCategories()

  const categoryFilters = [
    {
      key: 'status',
      options: [t('common.all'), 'Active', 'Inactive'],
      defaultValue: t('common.all')
    },
  ]

  const columns = [
    {
      header: 'image',
      render: (row) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden">
          {row.image ? (
            <img
              src={row.image}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <ImageOff size={20} className="text-gray-400"/>
            </div>
          )}
        </div>
      ),
    },
    {
      header: t('category.nameLabel'),
      accessor: 'name',
    },
    {
      header: 'Slug',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 bg-[#fcfafb] px-2 py-1 rounded">
          {row.slug}
        </span>
      ),
    },
    {
      header: t('category.productsLabel'),
      render: (row) => {
        const count = products.filter(
          (product) => String(product.categoryId) === String(row.id)
        ).length;
        return (
          <span className="font-medium text-[#870d4c] bg-[#870d4c]/5 px-2 py-1 rounded">
            {count}
          </span>
        );
      }
    },
    {
      header: 'description',
      accessor: 'description',
    },
    {
        header: t('common.createdAt'),
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
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 bg-[#fcfafb] border border-slate-200 rounded-xl text-amber-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all"
            title={t('category.editTitle')}
          >
            <Edit size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? t('category.editTitle') : t('category.addTitle')}
      >
        <CategoryForm
          initialData={editingCategory}
          onSubmit={handleSubmit}
        />
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={t('category.title')}
          description={t('category.description')}
        />
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          {/* Desktop Filters Layout: Status -- Sort */}
          <div className="hidden md:flex flex-wrap items-center gap-4">
            <FilterBar
              filters={categoryFilters}
              values={filters}
              onChange={handleFilterChange}
            />

            <FilterBar
              filters={[{ key: 'sort', options: [t('common.sortNewest'), t('common.sortAZ'), t('common.sortZA')] }]}
              values={{ sort: sortOrder }}
              onChange={(key, value) => handleSortChange({ target: { value } })}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('category.searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30"
              />
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setEditingCategory(null)
                setIsModalOpen(true)
              }}
              className="shrink-0 whitespace-nowrap h-[42px] px-5"
            >
              <Plus size={16} className="mr-2" />
              <span className="hidden md:inline">{t('category.addCategoryBtn')}</span>
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

        {/* Mobile Filters Dropdown Layout */}
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
                filters={categoryFilters}
                values={filters}
                onChange={handleFilterChange}
              />

              <FilterBar
                filters={[{ key: 'sort', options: [t('common.sortNewest'), t('common.sortAZ'), t('common.sortZA')] }]}
                values={{ sort: sortOrder }}
                onChange={(key, value) => handleSortChange({ target: { value } })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl">
        {isCategoriesLoading ? (
          <DataTableSkeleton columns={columns.length} rows={5} />
        ) : (
          <>
            <DataTable columns={columns} data={paginatedCategories} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  )
}