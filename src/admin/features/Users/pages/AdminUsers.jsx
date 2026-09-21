import React, { useState } from 'react'
import { Plus, Edit, SlidersHorizontal } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import UserForm from '../components/UserForm'
import DataTable from '../../../components/common/DataTable'
import DataTableSkeleton from '../../../components/common/DataTableSkeleton'
import SearchBar from '../../../components/common/SearchBar'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import PageHeader from '../../../components/common/PageHeader'
import FilterBar from '../../../components/common/FilterBar'
import Pagination from '../../../components/common/Pagination'
import { useTranslation } from 'react-i18next'

const ROLE_COLORS = {
  Admin: 'bg-purple-100 text-purple-700',
  User: 'bg-[#870d4c]/10 text-[#9d1159]',
}

export default function AdminUsers() {
  const { t } = useTranslation()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const {
    search,
    filters,
    sortOrder,
    currentPage,
    isModalOpen,
    editingUser,
    paginatedUsers,
    totalPages,
    isLoading,
    setCurrentPage,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    handleSubmit,
    handleEdit,
    openAddModal,
    closeModal,
  } = useUsers()

  const roleFilters = [
    {
      key: 'role',
      options: [
        { label: t('common.all'), value: '' },
        { label: t('users.admin'), value: 'Admin' },
        { label: t('users.user'), value: 'User' },
      ],
    },
  ]
  const userFilters = [
    ...roleFilters,
  ]


  const columns = [
    {
      header: t('users.avatar'),
      accessor: 'avatar',
      render: (row) => (
        <div className=" h-10 w-10 min-w-[2.5rem] bg-[#870d4c]/10 border border-[#870d4c]/20 rounded-full flex items-center justify-center text-[#870d4c] text-sm font-bold">
          {row.name?.charAt(0)?.toUpperCase()}
        </div>
      ),
    },
    {
      header: t('users.id'),
      accessor: 'id',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 bg-[#fcfafb] px-2 py-1 rounded">
          {row.id}
        </span>
      ),
    },
    {
      header: t('users.name'),
      accessor: 'name',
    },
    {
      header: t('users.email'),
      accessor: 'email',
      render: (row) => (
        <span className="text-slate-500">{row.email || '—'}</span>
      ),
    },
    {
      header: t('users.role'),
      render: (row) => {
        const roleKhmer = row.role === 'Admin' ? t('users.admin') : row.role === 'User' ? t('users.user') : row.role;
        return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${ROLE_COLORS[row.role] || 'bg-[#fcfafb] text-gray-600'
            }`}
        >
          {roleKhmer}
        </span>
        )
      },
    },
    {
      header: t('users.joinedDate'),
      accessor: 'created_at',
      render: (row) => (
        <span className="text-slate-500 text-sm">
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
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 bg-[#fcfafb] border border-slate-200 rounded-xl text-amber-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all"
            title={t('users.editUser')}
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
        title={editingUser ? t('users.editUser') : t('users.addUserTitle')}
      >
        <UserForm
          initialData={editingUser}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={t('users.pageTitle')}
          description={t('users.pageDescription')}
        />
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden md:flex flex-wrap items-center gap-4">
            <FilterBar
              filters={userFilters}
              values={filters}
              onChange={handleFilterChange}
            />
            <FilterBar
              filters={[{ key: 'sort', options: [t('common.sortNewest'), t('common.sortOldest'), t('common.sortAZ'), t('common.sortZA')] }]}
              values={{ sort: sortOrder }}
              onChange={(key, value) => handleSortChange({ target: { value } })}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder={t('users.searchPlaceholder')}
              className="w-full max-w-sm"
            />
            <Button
              variant="primary"
              onClick={() => openAddModal()}
              className="shrink-0 whitespace-nowrap h-[42px] px-5"
            >
              <Plus size={16} className="mr-2" />
              <span className="hidden md:inline">{t('users.addUser')}</span>
              <span className="md:hidden">{t('common.addBtn')}</span>
            </Button>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              className={`md:hidden shrink-0 w-10 py-2.5 flex items-center justify-center rounded-xl border transition-colors ${
                showAdvancedFilters
                  ? 'bg-[#fcfafb] border-slate-300 text-slate-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
              title={t('common.showFilters')}
              aria-label={t('common.showFilters')}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        <div
          className={`grid transition-all duration-300 ease-in-out md:hidden ${
            showAdvancedFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 !mt-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-nowrap overflow-x-auto justify-between items-center gap-4 p-4 bg-[#fcfafb] border border-slate-200 rounded-xl">

              <FilterBar
                filters={roleFilters}
                values={filters}
                onChange={handleFilterChange}
              />
              <FilterBar
                filters={[{ key: 'sort', options: [t('common.sortNewest'), t('common.sortOldest'), t('common.sortAZ'), t('common.sortZA')] }]}
                values={{ sort: sortOrder }}
                onChange={(key, value) => handleSortChange({ target: { value } })}
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
            <DataTable columns={columns} data={paginatedUsers} />
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