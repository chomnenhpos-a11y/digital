import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { userService } from "../../../../services/userService";

const ITEMS_PER_PAGE = 5;

export function useUsers() {
  const { t } = useTranslation();
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
  const filteredUsers = (users || [])
    .filter((user) => {
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

  const handleDelete = (id) => {
    Swal.fire({
      title: t('common.areYouSure'),
      text: t('common.cannotRevert'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t('common.yesDelete'),
      cancelButtonText: t('common.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        // Fallback for delete since backend only supports get, update, register
        setUsers((prev) => prev.filter((s) => s.id !== id));
        Swal.fire(t('common.deletedSuccess'), t('users.deletedLocally'), "success");
      }
    });
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
