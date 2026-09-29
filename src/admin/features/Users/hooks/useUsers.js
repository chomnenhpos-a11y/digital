import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { userService } from "../../../../services/userService";
import { useDeleteUserMutation } from "../../../../queries/users/useUserQueries";
import { useAuth } from "../../../../hooks/useAuth";

const ITEMS_PER_PAGE = 5;

export function useUsers() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const deleteMutation = useDeleteUserMutation();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", role: "" });
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers();
      setUsers(response.data || response || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Filter & Sort ──────────────────────────────────────────────────────────
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

      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      const dateA = a.createAt || a.createdAt || "";
      const dateB = b.createAt || b.createdAt || "";
      if (sortOrder === "Newest First" || sortOrder === "")
        return dateB.localeCompare(dateA);
      if (sortOrder === "Oldest First") return dateA.localeCompare(dateB);
      if (sortOrder === "A → Z")
        return (a.name || "").localeCompare(b.name || "");
      return (b.name || "").localeCompare(a.name || ""); // 'Z → A'
    });

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
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
        token: "",
      };

      if (editingUser) {
        payload.id = editingUser.id;

        const res = await userService.updateUser(editingUser.id, payload);

        closeModal();

        Swal.fire({
          icon: "success",
          title: t('common.success'),
          text: res.message || t('users.updatedSuccess'),
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        payload.password = data.password;
        payload.confirmPassword = data.confirmPassword;

        const res = await userService.registerUser(payload);

        closeModal();

        Swal.fire({
          icon: "success",
          title: t('common.success'),
          text: res.message || t('users.createdSuccess'),
          timer: 1500,
          showConfirmButton: false,
        });
      }

      await fetchUsers();
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
      setUsers((prev) => prev.filter((user) => user.id !== id));
      const lastPage = Math.max(1, Math.ceil((filteredUsers.length - 1) / ITEMS_PER_PAGE));
      setCurrentPage((page) => Math.min(page, lastPage));
      Swal.fire({
        title: t('common.deletedSuccess'),
        text: t('users.deleteSuccess'),
        icon: "success",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        title: t('common.failed'),
        text: t('users.deleteError'),
        icon: "error",
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
    isDeleting: deleteMutation.isPending,
    search,
    filters,
    sortOrder,
    currentPage,
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
