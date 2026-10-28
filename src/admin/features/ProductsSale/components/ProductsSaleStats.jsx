import React from "react";
import { TrendingUp, Package, User, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatsCard from "../../../components/common/StatsCard";
import StatsCardSkeletonGrid from "../../../components/common/StatsCardSkeleton";
import { formatSaleAmount } from "../schemas/productsaleSchemas";

export default function ProductsSaleStats({ summary, isLoading, labels }) {
  const { t } = useTranslation();

  if (isLoading) {
    return <StatsCardSkeletonGrid count={4} />;
  }

  const cards = [
    {
      title: labels?.totalSales || t("productsSale.totalSales") || "Total Sales",
      value: formatSaleAmount(summary?.totalSales || 0),
      icon: TrendingUp,
      color: "emerald",
      note: `${summary?.totalQuantity || 0} ${
        labels?.unitsSold || t("productsSale.unitsSold") || "units sold"
      }`,
    },
    {
      title:
        labels?.productsSold ||
        t("productsSale.productsSold") ||
        "Products Sold",
      value: String(summary?.totalQuantity || 0),
      icon: Package,
      color: "blue",
      note:
        labels?.itemsInWindow ||
        t("productsSale.itemsInWindow") ||
        "items in this window",
    },
    {
      title: labels?.topSeller || t("productsSale.topSeller") || "Top Seller",
      value: summary?.topSeller?.name || "—",
      icon: User,
      color: "purple",
      note: summary?.topSeller
        ? `${formatSaleAmount(summary.topSeller.total)} ${
            labels?.ofSales || t("productsSale.ofSales") || "of sales"
          }`
        : labels?.noSellerData ||
          t("productsSale.noSellerData") ||
          "No seller data in this window",
    },
    {
      title: labels?.topProduct || t("productsSale.topProduct") || "Top Product",
      value: summary?.topProduct?.name || "—",
      icon: Star,
      color: "amber",
      note: summary?.topProduct
        ? `${summary.topProduct.quantity} ${
            labels?.unitsSold || t("productsSale.unitsSold") || "units sold"
          } · ${formatSaleAmount(summary.topProduct.total)}`
        : labels?.noProductData ||
          t("productsSale.noProductData") ||
          "No product data in this window",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card) => (
        <StatsCard key={card.title} {...card} />
      ))}
    </div>
  );
}
