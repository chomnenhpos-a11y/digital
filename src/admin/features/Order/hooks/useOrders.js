import { useRef, useState } from 'react'
import Swal from '../../../../lib/alert'
import { useTranslation } from 'react-i18next'
import { useOrdersQuery, useUpdateOrderMutation, useDeleteOrderMutation} from '../../../../queries/orders/useOrderQueries'
import { canDeleteOrder } from '../../../../utils/orderRules.js'

export function useOrders(viewMode) {
  const { t } = useTranslation()
  const { data: orders = [], isPending: isLoading } = useOrdersQuery()
  const updateOrderMutation = useUpdateOrderMutation()
  const deleteOrderMutation = useDeleteOrderMutation()
  const deleteInProgress = useRef(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  const defaultDateRange = getDefaultDateRange()
  const [fromDate, setFromDate] = useState(defaultDateRange.fromDate)
  const [toDate, setToDate] = useState(defaultDateRange.toDate)
  const [currentPage, setCurrentPage] = useState(1)
  

  const ITEMS_PER_PAGE = viewMode === 'list' ? 5 : 8

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  
  const isSubmitting = updateOrderMutation.isPending

  // Handlers
  const openEditModal = (order) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingOrder(null)
  }

  const handleDeleteOrder = async (orderId) => {
    if (!orderId || deleteInProgress.current) return

    const order = orders.find((item) => String(item.id) === String(orderId))
    if (!canDeleteOrder(order)) {
      await Swal.fire({
        icon: 'warning',
        title: t('common.failed'),
        text: t('order.deleteNotAllowed'),
      })
      return
    }

    deleteInProgress.current = true
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: t('common.confirm'),
        text: t('order.confirmDeleteOrder', {
          orderNo: order.orderNo || order.orderNumber || order.id,
        }),
        showCancelButton: true,
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
      })

      if (!result.isConfirmed) return
      await deleteOrderMutation.mutateAsync({ orderId })
      if (String(editingOrder?.id) === String(orderId)) closeModal()

      await Swal.fire({
        icon: 'success',
        title: t('common.deletedSuccess'),
        text: t('order.deleteSuccess'),
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: t('common.deleteFailed'),
        text: error.code === 'ORDER_DELETE_NOT_ALLOWED'
          ? t('order.deleteNotAllowed')
          : error?.response?.data?.message || error?.response?.data?.error || t('order.deleteError'),
      })
    } finally {
      deleteInProgress.current = false
    }
  }

  const handleUpdateSubmit = async (formData) => {
    if (!editingOrder) return
    
    try {
      await updateOrderMutation.mutateAsync({ orderId: editingOrder.id, formData })
      
      Swal.fire({
        icon: 'success',
        title: t('common.success'),
        text: t('order.orderUpdatedSuccess'),
        timer: 1500,
        showConfirmButton: false
      })
      
      closeModal()
    } catch (error) {
      console.error('Update error:', error)
      Swal.fire({
        icon: 'error',
        title: t('common.failed'),
        text: t('order.updateOrderError'),
        confirmButtonText: t('common.ok'),
      })
    }
  }

  const handleSearchChange = (val) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const handlePaymentFilterChange = (val) => {
    setPaymentFilter(val)
    setCurrentPage(1)
  }

  const handleFromDateChange = (val) => {
    setFromDate(val)
    setCurrentPage(1)
  }

  const handleToDateChange = (val) => {
    setToDate(val)
    setCurrentPage(1)
  }

  // Filter and sort logic
  const filteredOrders = orders.filter(order => {
    const searchLower = search.trim().toLowerCase()
    const matchesSearch =
      searchLower === '' ||
      (order.orderNo && String(order.orderNo).toLowerCase().includes(searchLower)) ||
      (order.customerPhone && String(order.customerPhone).includes(searchLower)) ||
      (order.customerName && String(order.customerName).toLowerCase().includes(searchLower)) ||
      (order.id && String(order.id).includes(searchLower))
    const matchesStatus =
      statusFilter === '' || statusFilter === 'All' || order.status === statusFilter
    const matchesPayment =
      paymentFilter === '' || paymentFilter === 'All' || order.paymentStatus === paymentFilter

    let matchesDate = true
    if (fromDate || toDate) {
      const orderDate = new Date(order.createdAt || order.createAt)
      if (fromDate) {
        matchesDate = matchesDate && orderDate >= new Date(`${fromDate}T00:00:00`)
      }
      if (toDate) {
        const to = new Date(`${toDate}T23:59:59.999`)
        matchesDate = matchesDate && orderDate <= to
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate
  }).sort((a, b) => b.id - a.id) // Ensure most recent orders are first

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const activePage = Math.min(currentPage, Math.max(1, totalPages))
  const paginatedOrders = filteredOrders.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  )

  function getDefaultDateRange() {
    const today = new Date()
    const yesterday = new Date(today)

    yesterday.setDate(yesterday.getDate() - 1)

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")

      return `${year}-${month}-${day}`
    }

    return {
      fromDate: formatDate(yesterday),
      toDate: formatDate(today),
    }
  }
  return {
    orders: filteredOrders,
    allOrders: orders,
    paginatedOrders,
    search,
    setSearch: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,

    getDefaultDateRange,
    fromDate,
    setFromDate: handleFromDateChange,
    toDate,
    setToDate: handleToDateChange,
    paymentFilter,
    setPaymentFilter: handlePaymentFilterChange,
    currentPage: activePage,
    setCurrentPage,
    totalPages,
    isModalOpen,
    editingOrder,
    isSubmitting,
    openEditModal,
    closeModal,
    handleUpdateSubmit,
    handleDeleteOrder,
    isDeleting: deleteOrderMutation.isPending,
    isLoading
  }
}
