import React, { useState } from "react";
import { Edit, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2"; // 1. Don't forget to import SweetAlert2!
import { useSlides } from "../hooks/useSlides";
import SlideForm from "../components/SlideForm";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import DataTableSkeleton from "../../../components/common/DataTableSkeleton";
import Modal from "../../../components/common/Modal";
import Pagination from "../../../components/common/Pagination";

export default function AdminSlides() {
  const { t } = useTranslation();

  const {
    currentPage,
    isModalOpen,
    editingSlide,
    paginatedSlides,
    totalPages,
    isLoading,
    setCurrentPage,
    handleSubmit,
    handleEdit,
    openAddModal,
    closeModal,
    slides,
  } = useSlides();

  const MAX_PROMOTIONS = 5;
  const totalCount = slides ? slides.length : paginatedSlides.length;
  const isLimitReached = totalCount >= MAX_PROMOTIONS;

  const handleAddClick = () => {
    if (isLimitReached) {
      Swal.fire({
        icon: "warning",
        title: t("promotions.limitAlertTitle") || "Limit Reached",
        text: t("promotions.limitAlertText") || "You can only create a maximum of 5 promotions.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    openAddModal();
  };

  const columns = [
    {
      header: t("promotions.bgColor"),
      render: (row) => {
        const background = row.backgroundColor?.trim();

        return (
          <div
            className="h-10 w-20 min-w-[2.5rem] rounded-lg border border-slate-200 shadow-sm"
            style={
              background?.includes("gradient")
                ? {
                    backgroundImage: background,
                  }
                : {
                    backgroundColor: background || "#f1f5f9",
                  }
            }
            title={background || ""}
          />
        );
      },
    },
    {
      header: t("promotions.badge"),
      render: (row) => (
        <span className="inline-block whitespace-nowrap font-bold bg-[#fcfafb] text-black/70 py-1 px-2 rounded border-2 border-slate-400">
          {row.tag}
        </span>
      ),
    },
    {
      header: t("promotions.titleLabel"),
      accessor: "title",
    },
    {
      header: t("promotions.descriptionLabel"),
      accessor: "description",
    },
    {
      header: t("promotions.discount"),
      render: (row) => (
        <span className="inline-block whitespace-nowrap font-bold bg-pink-600 text-white py-1 px-2 rounded border-2 border-slate-400">
          {row.discountPercentage || 0}%
        </span>
      ),
    },
    {
      header: t("promotions.ctaText"),
      accessor: "ctaText",
    },
    {
      header: t("promotions.status"),
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            row.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status === "Active"
            ? t("promotions.active")
            : t("promotions.inactive")}
        </span>
      ),
    },
    {
      header: t("promotions.createdAt"),
      render: (row) => (
        <span className="text-sm text-slate-600">
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
      header: t("common.actions"),
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 bg-[#fcfafb] border border-slate-200 rounded-xl text-amber-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all"
            title={t("promotions.editPromotion")}
          >
            <Edit size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingSlide
            ? t("promotions.editPromotion")
            : t("promotions.addPromotionTitle")
        }
      >
        <SlideForm initialData={editingSlide} onSubmit={handleSubmit} />
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={t("promotions.pageTitle")}
          description={t("promotions.pageDescription")}
        />

        {/* 2. Removed `disabled={isLimitReached}` so onClick can fire and show SweetAlert */}
        <button
          onClick={handleAddClick}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
            isLimitReached
              ? "bg-slate-200 text-slate-500 hover:bg-slate-300 cursor-pointer"
              : "bg-[#9d1159] text-white hover:bg-[#9d1159]"
          }`}
        >
          <Plus size={16} />
          {t("promotions.addPromotionTitle")}
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl">
        {isLoading ? (
          <DataTableSkeleton columns={columns.length} rows={5} />
        ) : (
          <>
            <DataTable columns={columns} data={paginatedSlides} />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}