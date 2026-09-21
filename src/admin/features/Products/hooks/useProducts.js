import { useState, useMemo } from 'react'
import { useProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from '../../../../queries/products/useProductQueries'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

const ITEMS_PER_PAGE = 5

export function getStockStatus(stock) {
  if (stock === 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}

export function useProducts({ shopCode } = {}) {
  const { t } = useTranslation()
  const { data: products = [], isPending: isLoading } = useProductsQuery(
    { shop_code: shopCode }
  )
  const createMutation = useCreateProductMutation()
  const updateMutation = useUpdateProductMutation()
  const deleteMutation = useDeleteProductMutation()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', status: '' })
  const [sortOrder, setSortOrder] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // ── Filter & Sort (Memoized for Performance) ───────────────────────────────
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchSearch = product.name.toLowerCase().includes(search.toLowerCase())

        const matchCategory =
          !filters.category ||
          filters.category === t('common.all') ||
          product.categoryName === filters.category

        // Using stockQuantity as mapped in ProductContext
        const matchStatus =
          !filters.status ||
          filters.status === t('common.all') ||
          getStockStatus(product.stockQuantity) === filters.status

        return matchSearch && matchCategory && matchStatus
      })
      .sort((a, b) => {
        if (sortOrder === 'Newest First' || sortOrder === 'newest' || sortOrder === '') return b.id - a.id
        if (sortOrder === 'A → Z' || sortOrder === 'asc') return a.name.localeCompare(b.name)
        return b.name.localeCompare(a.name)
      })
  }, [products, search, filters, sortOrder, t])

  // ── Pagination (Memoized) ──────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )
  }, [filteredProducts, currentPage])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleSortChange = (e) => {
    setSortOrder(e.target.value)
    setCurrentPage(1)
  }

  // Receives the FormData payload from ProductsForm.jsx
  const handleSubmit = async (formDataToSend) => {
    try {
      if (editingProduct) {
        // Extract ID depending on whether payload is FormData or a standard Object
        const id = formDataToSend instanceof FormData
          ? Number(formDataToSend.get('id'))
          : formDataToSend.id;

        await updateMutation.mutateAsync({ id, data: formDataToSend })
        Swal.fire({
          icon: 'success',
          title: t('common.success'),
          text: 'Product updated successfully!',
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        await createMutation.mutateAsync(formDataToSend)
        Swal.fire({
          icon: 'success',
          title: t('common.success'),
          text: 'Product added successfully!',
          timer: 1500,
          showConfirmButton: false
        })
      }
      closeModal()
    } catch (error) {
      const data = error?.response?.data
      const backendMsg = data?.message || data?.error || JSON.stringify(data) || error.message
      console.error('Submit error details:', {
        status: error?.response?.status,
        data: JSON.stringify(data),
        message: error?.message,
      })
      Swal.fire({
        icon: 'error',
        title: `Error ${error?.response?.status || ''}`,
        text: backendMsg,
      })
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: t('common.areYouSure'), // Are you sure?
      text: t('common.cannotRevert'), // You won't be able to revert this!
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.yesDelete'), // Yes, delete it
      cancelButtonText: t('common.cancel') // Cancel
    }).then(async (result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id, {
          onSuccess: () => {
            Swal.fire(t('common.deletedSuccess'), t('users.deletedLocally'), 'success')
          },
          onError: () => {
            Swal.fire(t('common.failed'), t('common.deleteError'), 'error')
          }
        })
      }
    })
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const discountPercentage = editingProduct && editingProduct.oldPrice && editingProduct.price
    ? Math.round(((editingProduct.oldPrice - editingProduct.price) / editingProduct.oldPrice) * 100)
    : 0

  return {
    // state
    products,
    isLoading,
    search,
    filters,
    sortOrder,
    currentPage,
    isModalOpen,
    editingProduct,
    discountPercentage,
    // computed
    filteredProducts,
    paginatedProducts,
    totalPages,
    // setters
    setSearch,
    setSortOrder,
    setCurrentPage,
    // handlers
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    openAddModal,
    closeModal,
  }
}