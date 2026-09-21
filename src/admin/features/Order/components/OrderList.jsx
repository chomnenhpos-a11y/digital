import React from "react";
import { Phone, MapPin, Receipt, Printer, Clock, AlertCircle, Package } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentStatusMutation,
} from "../../../../queries/orders/useOrderQueries";
import DataTable from "../../../components/common/DataTable";
import { ReceiptText, SquarePen } from "lucide-react";

export default function OrderList({ orders, onEdit }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const updatePaymentStatusMutation = useUpdateOrderPaymentStatusMutation();

  const updateOrderStatus = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, newStatus });
  };

  const updatePaymentStatus = (orderId, newPaymentStatus) => {
    updatePaymentStatusMutation.mutate({ orderId, newPaymentStatus });
  };

  const statusConfig = {
    Pending: {
      styles: "bg-amber-100 text-amber-800",
      label: t('dashboard.statusPending'),
      icon: <AlertCircle className="w-4 h-4 mr-1" />
    },
    Pickup: {
      styles: "bg-[#870d4c]/10 text-[#9d1159]",
      label: t('dashboard.statusPickedUp'),
    },
    Delivering: {
      styles: "bg-purple-100 text-purple-800",
      label: t('dashboard.statusDelivering'),
      icon: <Package className="w-4 h-4 mr-1" />
    },
    Completed: {
      styles: "bg-green-100 text-green-700",
      label: t('dashboard.statusCompleted'),
    },
    Cancelled: {
      styles: "bg-rose-100 text-rose-800",
      label: t('dashboard.statusCancelled'),
      icon: <Package className="w-4 h-4 mr-1" />
    },
  };
  const columns = [
    {
      header: t('order.noLabel'),
      accessor: "id",
      render: (order) => (
        <div>
          <div className="font-bold text-[#870d4c]">#{order.id}</div>
          <div className="text-xs text-slate-400">
            {order.orderNo || `ORD-${order.orderNumber}`}
          </div>
        </div>
      ),
    },
    {
      header: t('order.customer'),
      accessor: "customer",
      render: (order) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Phone size={12} className="text-slate-400" />
            <span>{order.customerPhone || order.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 max-w-[200px] truncate">
            <MapPin size={12} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {order.customerAddress || order.address || "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t('order.totalCol'),
      accessor: "totalAmount",
      render: (order) => {
        const total = Number(order.totalAmount || order.total || 0);
        return (
          <div>
            <div className="font-bold text-emerald-600 px-2.5 py-1 rounded bg-green-100">
              ${total.toFixed(2)}
            </div>
          </div>
        );
      },
    },
    {
      header: t('order.subtotal'),
      accessor: "subtotal",
      render: (order) => {
        const total = Number(order.totalAmount || 0);
        const delivery = Number(order.deliveryFee || 0);
        const subtotal = total - delivery;
        return (
          <div>
            <div className="font-bold text-red-500">${subtotal.toFixed(2)}</div>
          </div>
        );
      },
    },
    {
      header: t('order.deliveryFee'),
      accessor: "deliveryFee",
      render: (order) => (
        <div>
          <span className="font-bold text-slate-400 mr-1">
            {order.deliveryProvider?.name || "Cash"}
          </span>
          <span className="text-xs text-slate-500">
            (${order.deliveryFee || 0})
          </span>
        </div>
      ),
    },
    {
      header: t('order.deliveryStatus'),
      accessor: "status",
      render: (order) => {
        const config = statusConfig[order.status] || {
          styles: "bg-[#fcfafb] text-gray-700",
          label: order.status || t('order.unknownStatus'),
        };

        return (
          <select
            value={order.status || "Pending"}
            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
            className={`text-xs px-2.5 py-1.5 rounded-md font-bold outline-none cursor-pointer border-none ${config.styles}`}
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      header: t('common.paymentStatus'),
      accessor: "paymentStatus",
      render: (order) => (
        <select
          className={`text-xs px-2 py-1 rounded-md font-bold outline-none cursor-pointer
          ${order.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          value={order.paymentStatus}
          onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
        >
          <option value="Unpaid">{t('order.unpaid')}</option>
          <option value="Paid">{t('common.paid')}</option>
        </select>
      ),
    },
    {
      header: t('order.date'),
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
      accessor: "actions",
      align: "right",
      render: (order) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(order)}
            className="p-1.5 text-slate-500 hover:text-[#9d1159] hover:bg-blue-50 rounded transition-colors"
            title={t('order.edit')}
          >
            <SquarePen size={16} className="text-yellow-600" />
          </button>
          <Link
            to={`/admin/print-receipt/${order?.orderNo}`}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title={t('order.receipt')}
          >
            <ReceiptText size={16} className="text-red-500" />
          </Link>
          <Link
            to={`/admin/print-sticker/${order?.orderNo}`}
            className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
            title={t('order.sticker')}
          >
            <Printer size={16} className="text-violet-500" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={[...orders].sort((a, b) => b.id - a.id)}
      keyField="id"
    />
  );
}
