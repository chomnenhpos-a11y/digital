import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function getFilterLabel(filter, t) {
  if (filter.label) return filter.label
  if (filter.placeholder) return filter.placeholder
  if (filter.title) return filter.title

  switch (filter.key) {
    case 'category':
    case 'category_id':
      return t('products.category') || 'Category'
    case 'status':
    case 'is_active':
      return t('common.status') || 'Status'
    case 'role':
      return t('users.role') || 'Role'
    case 'sort':
    case 'sortBy':
    case 'sortOrder':
      return t('common.sort') || 'Sort'
    case 'payment':
    case 'payment_status':
      return t('common.paymentStatus') || 'Payment'
    default:
      return filter.key
        ? filter.key.charAt(0).toUpperCase() + filter.key.slice(1).replace(/_/g, ' ')
        : t('common.selectFilter')
  }
}

function CustomSelect({ filter, value, onChange }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Support both:
  // 1. String: 'Admin'
  // 2. Object: { label: 'អ្នកគ្រប់គ្រង', value: 'Admin' }
  const normalizedOptions = filter.options.map((option) =>
    typeof option === 'string'
      ? {
          label: option,
          value: option,
        }
      : option
  )

  const filteredOptions = normalizedOptions.filter((option) =>
    (option.label || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 1. Find exact match by value
  let selectedOption = normalizedOptions.find(
    (option) => option.value === value
  )

  // 2. If value matches by label (legacy string format)
  if (!selectedOption && value) {
    selectedOption = normalizedOptions.find(
      (option) => option.label === value
    )
  }

  // 3. Fallback when value is empty or unset: match empty value option or first option (usually "All" or default sort)
  if (!selectedOption && (value === '' || value === undefined || value === null)) {
    selectedOption =
      normalizedOptions.find((option) => option.value === '' || option.value === 'All') ||
      normalizedOptions[0]
  }

  const filterLabel = getFilterLabel(filter, t)
  const displayValue = selectedOption?.label || (value ? String(value) : null)

  return (
    <div
      className="relative flex-1 w-full sm:w-auto min-w-[130px]"
      ref={ref}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="appearance-none flex justify-between items-center w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm cursor-pointer text-left transition-colors"
      >
        <span className="truncate flex items-center gap-1.5 min-w-0 pr-1">
          {filterLabel && (
            <span className="text-slate-400 font-medium text-xs shrink-0">
              {filterLabel}:
            </span>
          )}
          <span className="font-medium text-slate-800 truncate text-xs sm:text-sm">
            {displayValue || t('common.all')}
          </span>
        </span>

        <ChevronDown
          className={`absolute right-2.5 h-4 w-4 text-slate-400 pointer-events-none transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#870d4c]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 w-full min-w-[160px] mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 flex flex-col">
          {filter.searchable && (
            <div className="p-2 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />

                <input
                  type="text"
                  placeholder={t('common.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#870d4c]/30"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <ul className="overflow-y-auto py-1">
            <li className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 bg-slate-50/80 border-b border-slate-100 uppercase tracking-wider select-none cursor-default">
              {filterLabel}
            </li>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected =
                  value === option.value ||
                  (selectedOption && selectedOption.value === option.value)

                return (
                  <li
                    key={String(option.value)}
                    onClick={() => {
                      onChange(filter.key, option.value)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`
                      px-3 py-2 text-xs sm:text-sm cursor-pointer
                      hover:bg-slate-50 transition-colors
                      ${
                        isSelected
                          ? 'bg-[#870d4c]/5 text-[#870d4c] font-medium'
                          : 'text-slate-700'
                      }
                    `}
                  >
                    {option.label}
                  </li>
                )
              })
            ) : (
              <li className="px-3 py-2 text-xs text-slate-500 text-center">
                {t('common.noResults')}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function FilterBar({
  filters = [],
  values = {},
  onChange,
  className = "flex flex-wrap gap-3 w-full sm:w-auto",
}) {
  return (
    <div className={className}>
      {filters.map((filter) => (
        <CustomSelect
          key={filter.key}
          filter={filter}
          value={values[filter.key]}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
