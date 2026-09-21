import { useState } from 'react'
import { useCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../../../../queries/categories/useCategoryQueries'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

const ITEMS_PER_PAGE = 5

export function useCategories() {
  const { t } = useTranslation()
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategoriesQuery()
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const deleteMutation = useDeleteCategoryMutation()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '' })
  const [sortOrder, setSortOrder] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // ── Filter & Sort
  const filteredCategories = (categories || [])
    .filter((category) => {
      const matchSearch = category.name
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchStatus =
        filters.status === '' ||
        filters.status === 'All' ||
        (category.status && category.status === filters.status)

      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortOrder === 'Newest First' || sortOrder === 'newest' || sortOrder === '') return b.id - a.id
      if (sortOrder === 'A → Z' || sortOrder === 'asc') return a.name.localeCompare(b.name)
      return b.name.localeCompare(a.name) // 'Z → A' or 'desc'
    })

  // ── Pagination─────
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // ── Handlers───────
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

  const handleSubmit = async (data) => {
    try {
      const payload = new FormData()
      payload.append('name', data.name)
      payload.append('slug', data.slug)
      if (data.description) {
        payload.append('description', data.description)
      }
      if (data.image instanceof File) {
        payload.append('image', data.image)
      } else if (data.image && typeof data.image === 'string' && data.image.startsWith('http')) {
        // Option to handle keeping existing image if your backend requires it.
      }

      if (editingCategory) {
        payload.append('id', editingCategory.id)
        await updateMutation.mutateAsync({ id: editingCategory.id, data: payload })
        Swal.fire({
          icon: 'success',
          title: t('common.success'),
          text: t('category.updateSuccess'),
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        await createMutation.mutateAsync(payload)
        Swal.fire({
          icon: 'success',
          title: t('common.success'),
          text: t('category.addSuccess'),
          timer: 1500,
          showConfirmButton: false
        })
      }
      closeModal()
    } catch (error) {
      const errorData = error?.response?.data
      const backendMsg = errorData?.message || errorData?.error || JSON.stringify(errorData) || error.message
      console.error('Error saving category:', error)
      Swal.fire({
        icon: 'error',
        title: `${t('common.error')} ${error?.response?.status || ''}`,
        text: backendMsg,
      })
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: t('common.areYouSure'),
      text: t('common.cannotRevert'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.yesDeleteIt'),
      cancelButtonText: t('common.cancel')
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteMutation.mutateAsync(id)
          Swal.fire(t('common.deletedSuccess'), t('common.dataDeleted'), 'success')
        } catch (error) {
          console.error('Error deleting category:', error)
          Swal.fire(t('common.failed'), t('common.deleteError'), 'error')
        }
      }
    })
  }

  const openAddModal = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  return {
    // state
    categories,
    search,
    filters,
    sortOrder,
    currentPage,
    isModalOpen,
    editingCategory,
    isSubmitting,
    isCategoriesLoading,
    // computed
    filteredCategories,
    paginatedCategories,
    totalPages,
    // raw setters (for inline handlers in the page)
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
    setEditingCategory,
    setIsModalOpen
  }
}

