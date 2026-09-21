import React, { useState } from 'react'
import { Plus, Edit, SlidersHorizontal, Ban, CheckCircle2, XCircle, Search } from 'lucide-react'
import { useDeliveryProviders } from '../hooks/useDeliveryProviders'
import DeliveryProviderForm from '../components/DeliveryProviderForm'
import DataTable from '../../../components/common/DataTable'
import DataTableSkeleton from '../../../components/common/DataTableSkeleton'
import SearchBar from '../../../components/common/SearchBar'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import PageHeader from '../../../components/common/PageHeader'
import FilterBar from '../../../components/common/FilterBar'
import Pagination from '../../../components/common/Pagination'
import { useTranslation } from 'react-i18next'

export default function AdminDeliveryProviders() {
  const { t } = useTranslation()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const {
    search,
    filters,
    sortOrder,
    currentPage,
    isModalOpen,
    editingProvider,
    paginatedProviders,
    totalPages,
    isProvidersLoading,
    setCurrentPage,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    handleSubmit,
    handleEdit,
    openAddModal,
    closeModal,
    setEditingProvider,
    setIsModalOpen,
    updateFilter,
  } = useDeliveryProviders()

  const providerFilters = [
    {
      key: 'is_active',
      options: [t('common.all'), 'Active', 'Inactive'],
      defaultValue: t('common.all')
    },
  ]

  const columns = [
    {
      header: 'Logo',
      render: (row) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white">
          {row.logo ? (
            <img
              src={row.logo}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#fcfafb] flex items-center justify-center">
              <Ban size={20} className="text-gray-300" />
            </div>
          )}
        </div>
      ),
    },
    {
      header: t('delivery.providerName'),
      accessor: 'name',
    },
    {
      header: t('delivery.phone'),
      render: (row) => (
        <span className="text-slate-600">{row.phone}</span>
      ),
    },
    {
      header: t('delivery.shippingFee'),
      render: (row) => (
        <span className="font-semibold text-[#870d4c] bg-[#870d4c]/5 px-2 py-1 rounded">
          ${parseFloat(row.shipping_fee || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: t('common.status'),
      render: (row) => (
        <div className="flex items-center">
          {row.is_active == 1 ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 size={14} /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
              <XCircle size={14} /> Inactive
            </span>
          )}
        </div>
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
            title={t('common.edit')}
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
        title={editingProvider ? t('delivery.editProvider') : t('delivery.addProviderTitle')}
      >
        <DeliveryProviderForm
          initialData={editingProvider}
          onSubmit={handleSubmit}
        />
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={t('delivery.title')}
          description={t('delivery.description')}
        />
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden md:flex flex-wrap items-center gap-4">
            <FilterBar
              filters={providerFilters}
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
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder={t('delivery.searchPlaceholder')}
              className="w-full max-w-sm"
            />

            <button
              onClick={() => {
                setEditingProvider(null)
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#9d1159] text-white rounded-lg hover:bg-[#9d1159] transition-colors font-medium text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden md:inline">{t('delivery.addProvider')}</span>
              <span className="md:hidden">{t('common.addBtn')}</span>
            </button>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              title={t('common.showFilters')}
              aria-label={t('common.showFilters')}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        <div
          className={`grid transition-all duration-300 ease-in-out md:hidden ${
            isFilterOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 !mt-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-4 p-4 bg-[#fcfafb] border border-slate-200 rounded-xl">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('delivery.searchPlaceholder')}
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30"
                  />
                </div>
              </div>
              <FilterBar
                filters={providerFilters}
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
        {isProvidersLoading ? (
          <DataTableSkeleton columns={columns.length} rows={5} />
        ) : (
          <>
            <DataTable columns={columns} data={paginatedProviders} />
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
