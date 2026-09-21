import { useState } from 'react'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'
import { useOrdersQuery, useUpdateOrderMutation } from '../../../../queries/orders/useOrderQueries'

export function useOrders(viewMode) {
  const { t } = useTranslation()
  const { data: orders = [], isPending: isLoading } = useOrdersQuery()
  const updateOrderMutation = useUpdateOrderMutation()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
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

  const handleUpdateSubmit = async (formData) => {
    if (!editingOrder) return
    
    try {
      await updateOrderMutation.mutateAsync({ orderId: editingOrder.id, formData })
      
      Swal.fire({
        icon: 'success',
        title: t('common.success'),
        text: t('order.updatedSuccess'),
        timer: 1500,
        showConfirmButton: false
      })
      
      closeModal()
    } catch (error) {
      console.error('Update error:', error)
      const errorMsg = error?.response?.data?.message || error.message || 'Error updating order'
      Swal.fire({
        icon: 'error',
        title: t('common.failed'),
        text: errorMsg,
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
        matchesDate = matchesDate && orderDate >= new Date(fromDate)
      }
      if (toDate) {
        const to = new Date(toDate)
        to.setHours(23, 59, 59, 999)
        matchesDate = matchesDate && orderDate <= to
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate
  }).sort((a, b) => b.id - a.id) // Ensure most recent orders are first

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return {
    orders: filteredOrders,
    paginatedOrders,
    search,
    setSearch: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    fromDate,
    setFromDate: handleFromDateChange,
    toDate,
    setToDate: handleToDateChange,
    paymentFilter,
    setPaymentFilter: handlePaymentFilterChange,
    currentPage,
    setCurrentPage,
    totalPages,
    isModalOpen,
    editingOrder,
    isSubmitting,
    openEditModal,
    closeModal,
    handleUpdateSubmit,
    isLoading
  }
}
