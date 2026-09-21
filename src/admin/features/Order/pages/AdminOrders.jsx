import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageHeader from '../../../components/common/PageHeader'
import OrderFilterBar from '../components/OrderFilterBar'
import OrderCard from '../components/OrderCard'
import OrderList from '../components/OrderList'
import OrderUpdateForm from '../components/OrderUpdateForm'
import Modal from '../../../components/common/Modal'
import Pagination from '../../../components/common/Pagination'
import DataTableSkeleton from '../../../components/common/DataTableSkeleton'
import DataCardSkeletonGrid from '../../../components/common/DataCardSkeleton'
import { PackageOpen, LayoutGrid, List, PackageX } from 'lucide-react'
import OrderExportActions from '../components/OrderExportActions'

import { useOrders } from '../hooks/useOrders'

export default function AdminOrders() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState('list')
  const {
    orders,
    paginatedOrders,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    currentPage,
    setCurrentPage,
    totalPages,
    isModalOpen,
    editingOrder,
    isSubmitting,
    isLoading,
    closeModal,
    openEditModal,
    handleUpdateSubmit
  } = useOrders(viewMode)

  return (
    <div className="space-y-6">
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingOrder ? `#${editingOrder.orderNo}` : t('order.editOrderTitle')}
      >
        <OrderUpdateForm
          initialData={editingOrder}
          onSubmit={handleUpdateSubmit}
          onCancel={closeModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Responsive Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <PageHeader
            title={t('order.ordersTitle')}
            description={t('order.ordersSubtitle')}
          />
        </div>
      
        <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
          
          <OrderExportActions />
          {/* View Toggle */}
          <div className="flex items-center bg-[#fcfafb] p-1 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#870d4c] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List size={16} />
              <span className="hidden sm:inline">{t('order.viewList')}</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'card'
                  ? 'bg-white text-[#870d4c] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">{t('order.viewCard')}</span>
            </button>
          </div>
        </div>
      </div>

      <OrderFilterBar
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={(e) => setStatusFilter(e.target.value)}
        paymentFilter={paymentFilter}
        onPaymentChange={(e) => setPaymentFilter(e.target.value)}
        fromDate={fromDate}
        onFromDateChange={(e) => setFromDate(e.target.value)}
        toDate={toDate}
        onToDateChange={(e) => setToDate(e.target.value)}
      />

      {isLoading ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            <DataCardSkeletonGrid count={8} />
          </div>
        ) : (
          <DataTableSkeleton columns={9} rows={5} />
        )
      ) : orders.length > 0 ? (
        <div className="flex flex-col">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {paginatedOrders.map(order => (
                <OrderCard key={order.id} order={order} onEdit={() => openEditModal(order)} />
              ))}
            </div>
          ) : (
            <OrderList orders={paginatedOrders} onEdit={openEditModal} />
          )}
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <PackageX size={64} className="mb-4 mt-20 text-slate-300" strokeWidth={1.5} />
          <h3 className="text-lg font-medium text-slate-600 mb-1">{t('order.ordersNotFound')}</h3>
          <p className="text-sm">{t('order.searchOrFilterHint')}</p>
        </div>
      )}
    </div>
  )
}