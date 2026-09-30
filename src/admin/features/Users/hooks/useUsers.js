import { useState } from "react";
import Swal from "../../../../lib/alert";
import { useTranslation } from "react-i18next";
import { useUsersListQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from "../../../../queries/users/useUserQueries";
import { useAuth } from "../../../../hooks/useAuth";

const ITEMS_PER_PAGE = 5;

export function useUsers() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const deleteMutation = useDeleteUserMutation();
  const { data: users = [], isLoading, isError, error, refetch } = useUsersListQuery();
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", role: "" });
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = authUser?.id;
  const currentUserEmail = authUser?.email?.trim().toLowerCase();
  const filteredUsers = (users || [])
    .filter((user) => {
      const isCurrentUser = currentUserId != null && user.id != null
        ? String(user.id) === String(currentUserId)
        : Boolean(currentUserEmail) && user.email?.trim().toLowerCase() === currentUserEmail;

      if (isCurrentUser) return false;

      const matchSearch =
        (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(search.toLowerCase());

      const matchRole =
        !filters.role ||
        filters.role === t('common.all') ||
        user.role === filters.role;

      return matchSearch && matchRole && (!filters.status || String(user.status) === filters.status);
    })
    .sort((a, b) => {
      const dateA = a.createAt || a.createdAt || "";
      const dateB = b.createAt || b.createdAt || "";
      if (sortOrder === "newest")
        return dateB.localeCompare(dateA);
      if (sortOrder === "oldest") return dateA.localeCompare(dateB);
      if (sortOrder === "az")
        return (a.name || "").localeCompare(b.name || "");
      return (b.name || "").localeCompare(a.name || ""); // 'Z → A'
    });

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedUsers = filteredUsers.slice(
    (visiblePage - 1) * ITEMS_PER_PAGE,
    visiblePage * ITEMS_PER_PAGE,
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    Swal.fire({
      title: t('common.processing'),
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const payload = {
        name: data.name,
        email: data.email || "",
        role: data.role || "User",
        status: data.status || "0",
        token: "",
      };

      if (editingUser) {
        payload.id = editingUser.id;

        const res = await updateMutation.mutateAsync({ id: editingUser.id, data: payload });

        closeModal();

        Swal.fire({
          icon: "success",
          title: t('common.success'),
          text: res?.message || t('users.updatedSuccess'),
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        payload.password = data.password;
        payload.confirmPassword = data.confirmPassword;

        const res = await createMutation.mutateAsync(payload);

        closeModal();

        Swal.fire({
          icon: "success",
          title: t('common.success'),
          text: res?.message || t('users.createdSuccess'),
          timer: 1500,
          showConfirmButton: false,
        });
      }

      setCurrentPage(1);
    } catch (error) {
      Swal.close();

      const errorData = error?.response?.data;

      const backendMsg =
        errorData?.message ||
        errorData?.error ||
        error?.message ||
        t('users.processingError');

      Swal.fire({
        icon: "error",
        title: `Error ${error?.response?.status || "500"}`,
        text: backendMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (deleteMutation.isPending) return;

    const user = users.find((item) => String(item.id) === String(id));
    if (!user || user.role !== "User" || String(user.status) !== "1") {
      Swal.fire({
        title: t('common.failed'),
        text: t('users.deleteNotAllowed'),
        icon: "error",
        confirmButtonText: t('common.ok'),
      });
      return;
    }

    const result = await Swal.fire({
      title: t('common.areYouSure'),
      text: t('common.cannotRevert'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t('common.yesDelete'),
      cancelButtonText: t('common.cancel'),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      const lastPage = Math.max(1, Math.ceil((filteredUsers.length - 1) / ITEMS_PER_PAGE));
      setCurrentPage((page) => Math.min(page, lastPage));
      Swal.fire({
        title: t('common.deletedSuccess'),
        text: t('users.deleteSuccess'),
        icon: "success",
      });
    } catch {
      Swal.fire({
        title: t('common.failed'),
        text: t('users.deleteError'),
        icon: "error",
        confirmButtonText: t('common.ok'),
      });
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return {
    // state
    users,
    isLoading,
    isError,
    error,
    refetch,
    isDeleting: deleteMutation.isPending,
    search,
    filters,
    sortOrder,
    currentPage: visiblePage,
    isModalOpen,
    editingUser,
    isSubmitting,
    // computed
    filteredUsers,
    paginatedUsers,
    totalPages,
    // raw setters
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
  };
}
