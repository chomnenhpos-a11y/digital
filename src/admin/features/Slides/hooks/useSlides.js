import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { slideService } from '../../../../services/slideService'
import { useTranslation } from 'react-i18next'

const ITEMS_PER_PAGE = 5

export function useSlides(settingId = null, shopCode = null) {
  const { t } = useTranslation()
  const [slides, setSlides] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '' })
  const [sortOrder, setSortOrder] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchSlides = async () => {
    setIsLoading(true)
    try {
      const params = settingId ? { setting_id: settingId } : {}
      if (shopCode) {
        params.shop_code = shopCode
      }
      const response = await slideService.getSlides(params)
      setSlides(response.data || response || [])
    } catch (error) {
      console.error('Error fetching slides:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [settingId, shopCode])

  // ── Filter & Sort 
  const filteredSlides = (slides || [])
    .filter((slide) => {
      const keyword = search.toLowerCase()
      const matchSearch =
        (slide.tag || '').toLowerCase().includes(keyword) ||
        (slide.title || '').toLowerCase().includes(keyword) ||
        (slide.description || '').toLowerCase().includes(keyword) ||
        String(slide.discountPercentage || '').toLowerCase().includes(keyword) ||
        (slide.ctaText || '').toLowerCase().includes(keyword)

      const matchStatus =
        !filters.status ||
        filters.status === t('common.all') ||
        slide.status === filters.status

      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortOrder === 'Newest First' || sortOrder === 'newest' || sortOrder === '') return b.id - a.id
      if (sortOrder === 'A → Z' || sortOrder === 'asc') return (a.title || '').localeCompare(b.title || '')
      return (b.title || '').localeCompare(a.title || '') // 'Z → A' or 'desc'
    })

  // ── Pagination 
  const totalPages = Math.ceil(filteredSlides.length / ITEMS_PER_PAGE)
  const paginatedSlides = filteredSlides.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // ── Handlers
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
    setIsSubmitting(true)
    try {
      const payload = {
        tag: data.tag,
        title: data.title,
        description: data.description || '',
        discountPercentage: data.discountPercentage === '' ? 0 : Number(data.discountPercentage),
        ctaText: data.ctaText || '',
        backgroundColor: data.backgroundColor || 'radial-gradient(circle, #FF5733 0%, #FFC300 100%)',
        status: data.status || 'Active',
      }

      if (settingId) {
        payload.setting_id = settingId
      }

      if (editingSlide) {
        payload.id = editingSlide.id
        await slideService.updateSlide(editingSlide.id, payload)
        Swal.fire({
          icon: 'success',
          title: t('common.success'),
          text: t('promotions.updated_successfully'),
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        await slideService.createSlide(payload)
        Swal.fire({
          icon: 'success',
          title: t('common.success'),
          text: t('promotions.added_successfully'),
          timer: 1500,
          showConfirmButton: false
        })
      }

      await fetchSlides()
      closeModal()
    } catch (error) {
      const errorData = error?.response?.data
      const backendMsg = errorData?.message || errorData?.error || JSON.stringify(errorData) || error.message
      Swal.fire({
        icon: 'error',
        title: `Error ${error?.response?.status || ''}`,
        text: backendMsg,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (slide) => {
    setEditingSlide(slide)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setEditingSlide(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSlide(null)
  }

  return {
    // state
    slides,
    isLoading,
    search,
    filters,
    sortOrder,
    currentPage,
    isModalOpen,
    editingSlide,
    isSubmitting,
    // computed
    filteredSlides,
    paginatedSlides,
    totalPages,
    // handlers
    setCurrentPage,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    handleSubmit,
    handleEdit,
    openAddModal,
    closeModal,
  }
}
