import React from "react";
import StatsCard from "../../../components/common/StatsCard";
import PageHeader from "../../../components/common/PageHeader";
import useDashboard from "../hooks/useDashboard";
import DashboardCharts from "../components/DashboardCharts";
import DataTable from "@/admin/components/common/DataTable";
import DataTableSkeleton from "@/admin/components/common/DataTableSkeleton";
import StatsCardSkeletonGrid from "@/admin/components/common/StatsCardSkeleton";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
export default function AdminDashboard() {
  const { t } = useTranslation();
  const { statsData, recentOrders, isLoading } = useDashboard();

  const statusConfig = {
    Pending: {
      styles: "bg-amber-100 text-amber-700",
      label: t('dashboard.statusPending'),
    },
    Pickup: {
      styles: "bg-[#870d4c]/10 text-[#9d1159]",
      label: t('dashboard.statusPickedUp'),
    },
    Delivering: {
      styles: "bg-purple-100 text-purple-700",
      label: t('dashboard.statusDelivering'),
    },
    Completed: {
      styles: "bg-green-100 text-green-700",
      label: t('dashboard.statusCompleted'),
    },
    Cancelled: {
      styles: "bg-red-100 text-red-700",
      label: t('dashboard.statusCancelled'),
    },
  };
  const columns = [
    { header: t('common.orderNo'), accessor: "orderNo" },
    { header: t('common.total'), render: (row) => `$${row.totalAmount || 0}` },
    {
      header: t('common.paymentStatus'),
      render: (row) => {
        const Status =
          row.paymentStatus === "Paid"
            ? t('common.paid')
            : row.paymentStatus === "Pending"
              ? t('common.pending')
              : row.paymentStatus;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${row.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : row.paymentStatus === "Pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}
          >
            {Status}
          </span>
        );
      },
    },
    {
      header: t('common.status'),
      render: (row) => {
        // Apply the statusConfig dictionary here instead of nested ternaries
        const config = statusConfig[row.status] || {
          styles: "bg-[#fcfafb] text-gray-700",
          label: row.status,
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${config.styles}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      header: t('common.createdAt'),
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
      header: t('common.actions'),
      align: "right",
      render: (row) => (
        <div className="flex justify-end space-x-2">
          <Link
            to={`/admin/print-receipt/${row.orderNo || row.orderNumber || row.id}`}
            className="px-5 py-1 bg-[#870d4c] text-white rounded hover:bg-[#9d1159]"
            title={t('common.viewReceipt') || 'View Receipt'}
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.overviewTitle')}
        description={t('dashboard.overviewSubtitle')}
      />

      {isLoading ? (
        <StatsCardSkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatsCard
              key={stat.title || index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
              warning={stat.warning}
              note={stat.note}
              link={stat.link}
            />
          ))}
        </div>
      )}

      <DashboardCharts />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {t('dashboard.latestOrders')}
        </h2>
        {isLoading ? (
          <DataTableSkeleton columns={columns.length} rows={5} />
        ) : (
          <DataTable columns={columns} data={recentOrders} />
        )}
      </div>
    </div>
  );
}
