import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/admin/components/ui/chart";

import { useOrdersQuery } from "../../../../queries/orders/useOrderQueries";
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useCategoriesQuery } from "../../../../queries/categories/useCategoryQueries";
import { getCategoryDisplayName } from "../../Categories/utils/categoryUtils";

const EMPTY_DATA = [];
const COLORS = [
  "#870d4c",
  "#b31b6b",
  "#5d0a35",
  "#c92a7e",
  "#44092e",
  "#db4d98",
];

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function DashboardCharts() {
  const { t, i18n } = useTranslation();
  const { data: orders = EMPTY_DATA } = useOrdersQuery();
  const { data: products = EMPTY_DATA } = useProductsQuery();
  const { data: categories = EMPTY_DATA } = useCategoriesQuery();

  const barChartData = useMemo(() => {
    const now = new Date();

    // Current month and the previous five months, oldest first.
    const monthlySales = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1,
      );

      return {
        month: date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        total: 0,
        salesCount: 0,
      };
    });

    for (const order of orders) {
      if (order.paymentStatus !== "Paid") continue;

      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) continue;

      const monthsAgo =
        (now.getFullYear() - date.getFullYear()) * 12 +
        now.getMonth() -
        date.getMonth();

      if (monthsAgo < 0 || monthsAgo > 5) continue;

      const amount = Number(order.totalAmount ?? 0);
      if (!Number.isFinite(amount)) continue;

      const monthData = monthlySales[5 - monthsAgo];
      monthData.total += amount;
      monthData.salesCount += 1;
    }

    return monthlySales;
  }, [orders]);

  const barChartConfig = {
    total: {
      label: t("dashboard.totalMoney", {
        defaultValue: "Total money",
      }),
      color: "#870d4c",
    },
  };

  const pieChartData = useMemo(() => {
    const stockByCategory = new Map();

    // Build a category lookup map for fast resolution
    const categoryMap = new Map();
    for (const cat of categories) {
      if (cat?.id != null) {
        categoryMap.set(String(cat.id), cat);
      }
    }

    for (const product of products) {
      const catId = product.categoryId ?? product.category_id;
      const matchedCat = catId != null ? categoryMap.get(String(catId)) : null;

      // Resolve the Category display name (strictly the category, never the product name)
      const category =
        getCategoryDisplayName(matchedCat, i18n.language) ||
        getCategoryDisplayName(product, i18n.language) ||
        t("common.other", { defaultValue: "Other" });

      const quantity = Number(product.stockQuantity ?? product.stock ?? 0);
      if (!Number.isFinite(quantity) || quantity <= 0) continue;

      if (!stockByCategory.has(category)) {
        stockByCategory.set(category, {
          name: category,
          value: 0,
        });
      }

      stockByCategory.get(category).value += quantity;
    }

    return Array.from(stockByCategory.values()).map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
    }));
  }, [products, categories, i18n.language, t]);

  const pieChartConfig = {
    value: {
      label: t("dashboard.stock"),
    },
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.monthlySalesTitle")}</CardTitle>
          <CardDescription>
            {t("dashboard.monthlySalesSubtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer
            config={barChartConfig}
            className="h-[300px] w-full"
          >
            <BarChart data={barChartData}>
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => String(value).split(" ")[0]}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="min-w-[220px]"
                    formatter={(_value, _name, item) => {
                      const monthData = item.payload;

                      return (
                        <div className="grid w-full gap-2">
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-muted-foreground">
                              {t("dashboard.totalPaidOrders", {
                                defaultValue: "Total sales (orders)",
                              })}
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {monthData.salesCount.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-6">
                            <span className="text-muted-foreground">
                              {t("dashboard.totalMoney", {
                                defaultValue: "Total money",
                              })}
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {moneyFormatter.format(monthData.total)}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />

              <Bar
                dataKey="total"
                fill="var(--color-total)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.stockByCategoryTitle")}</CardTitle>
          <CardDescription>
            {t("dashboard.stockByCategorySubtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-center">
          <ChartContainer
            config={pieChartConfig}
            className="h-[300px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />

              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {pieChartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>

              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
