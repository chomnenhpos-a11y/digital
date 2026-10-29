import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  Clock,
  Store,
  Truck,
  CheckCircle2,
  PackageX,
} from "lucide-react";
import StatsCard from "../../../components/common/StatsCard";
import StatsCardSkeletonGrid from "../../../components/common/StatsCardSkeleton";
import { computeOrderStats } from "../utils/orderStatsSummary";

export default function OrderStatsCards({
  orders = [],
  isLoading = false,
  statusFilter = "",
  onStatusChange,
  fromDate = "",
  toDate = "",
}) {
  const { t } = useTranslation();

  const dateFilteredOrders = useMemo(() => {
    const start = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const end = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return orders.filter((order) => {
      if (!start && !end) return true;

      const rawDate = order?.createdAt || order?.createAt;
      if (!rawDate) return false;

      const orderDate = new Date(rawDate);
      if (Number.isNaN(orderDate.getTime())) return false;

      return (!start || orderDate >= start) && (!end || orderDate <= end);
    });
  }, [orders, fromDate, toDate]);

  const stats = useMemo(() => computeOrderStats(dateFilteredOrders), [dateFilteredOrders]);

  if (isLoading) {
    return (
      <StatsCardSkeletonGrid
        count={6}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
      />
    );
  }

  const cards = [
    {
      key: "all",
      title: t("dashboard.totalOrders") || "All Orders",
      value: stats.totalOrders.toString(),
      icon: ClipboardList,
      color: "blue",
      note: `${stats.totalOrders} ${t("common.orders") || "orders recorded"}`,
      statusKey: "",
    },
    {
      key: "Pending",
      title: t("dashboard.statusPending") || t("order.statusPendingTitle") || "Pending",
      value: stats.pendingCount.toString(),
      icon: Clock,
      color: "amber",
      warning: stats.pendingCount > 0,
      note:
        stats.pendingCount > 0
          ? t("order.pendingActionRequired") || "Needs processing"
          : t("order.allOrdersProcessed") || "All caught up",
      statusKey: "Pending",
    },
    {
      key: "Pickup",
      title: t("dashboard.statusPickedUp") || t("order.statusPickupTitle") || "Pickup",
      value: stats.pickupCount.toString(),
      icon: Store,
      color: "purple",
      note: `${stats.pickupCount} ${t("order.readyForPickup") || "ready for pickup"}`,
      statusKey: "Pickup",
    },
    {
      key: "Delivering",
      title: t("dashboard.statusDelivering") || t("order.statusDeliveringTitle") || "Delivering",
      value: stats.deliveringCount.toString(),
      icon: Truck,
      color: "indigo",
      note: `${stats.deliveringCount} ${t("order.inTransitNote") || "in transit"}`,
      statusKey: "Delivering",
    },
    {
      key: "Completed",
      title: t("dashboard.statusCompleted") || t("order.statusCompletedTitle") || "Completed",
      value: stats.completedCount.toString(),
      icon: CheckCircle2,
      color: "emerald",
      note: `$${stats.totalRevenue.toFixed(2)} ${t("dashboard.totalRevenue") || "revenue"}`,
      statusKey: "Completed",
    },
    {
      key: "Cancelled",
      title: t("dashboard.statusCancelled") || t("order.statusCancelledTitle") || "Cancelled",
      value: stats.cancelledCount.toString(),
      icon: PackageX,
      color: "rose",
      note: `${stats.cancelledCount} ${t("order.cancelledOrders") || "cancelled"}`,
      statusKey: "Cancelled",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const isSelected =
          (card.statusKey === "" && (statusFilter === "" || statusFilter === "All")) ||
          statusFilter === card.statusKey;

        return (
          <StatsCard
            key={card.key}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            warning={card.warning}
            note={card.note}
            isActive={isSelected && Boolean(onStatusChange)}
            onClick={
              onStatusChange
                ? () => {
                    if (card.statusKey === "") {
                      onStatusChange("");
                    } else if (statusFilter === card.statusKey) {
                      onStatusChange("");
                    } else {
                      onStatusChange(card.statusKey);
                    }
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
