import { useDebugValue, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { orderService } from "../services/orderService";
import { orderKeys } from "../queries/orders/orderKeys";
import { BEST_SELLER_MODE, BEST_SELLER_RULES, bestSellerOrderAdapter, bestSellerOrderSource } from "../config/bestSellers.ts";
import { applyBestSellers, calculateBestSellers, calculatePaidOrderBadges, calculatePaidUnitBadges, DEFAULT_BEST_SELLER_RULES, unavailableBestSellers } from "../utils/bestSellers.ts";
import type { BestSellerMode, BestSellerOrderAdapter, BestSellerRules, Identifier, OrderCoverage } from "../utils/bestSellers.ts";

const EMPTY_PRODUCTS: never[] = [];

interface BestSellerSource {
  getOrders: (response: unknown) => readonly unknown[] | undefined;
  getCoverage: (response: unknown, asOf: number) => OrderCoverage | undefined;
}

export function useBestSellers<Product extends { id: Identifier }>({
  shopCode,
  catalog,
  rules = BEST_SELLER_RULES,
  mode = BEST_SELLER_MODE,
  adapter = bestSellerOrderAdapter,
  source = bestSellerOrderSource,
}: {
  shopCode?: string;
  catalog: { data?: Product[]; isPending: boolean; isError: boolean };
  rules?: Readonly<BestSellerRules>;
  mode?: BestSellerMode;
  adapter?: BestSellerOrderAdapter<unknown, unknown>;
  source?: BestSellerSource;
}) {
  const products = catalog.data ?? EMPTY_PRODUCTS;
  const ordersQuery = useQuery({
    queryKey: [...orderKeys.list({ shop_code: shopCode }), "best-sellers-source"],
    queryFn: ({ signal }) => orderService.getOrders({ shop_code: shopCode }, { signal }),
    enabled: Boolean(shopCode),
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: "always",
  });

  const { minimumOrders, days, minimumUnits = DEFAULT_BEST_SELLER_RULES.minimumUnits ?? 20 } = rules;
  const { data, dataUpdatedAt } = ordersQuery;
  const calculation = useMemo(() => {
    if (!shopCode) return unavailableBestSellers(["shopScope"]);
    try {
      if (mode === "paid-units-all-time") {
        return calculatePaidUnitBadges({ orders: source.getOrders(data), adapter, minimumUnits });
      }
      if (mode === "paid-orders-all-time") {
        return calculatePaidOrderBadges({
          orders: source.getOrders(data),
          adapter,
          minimumOrders,
        });
      }
      return calculateBestSellers({
        orders: source.getOrders(data),
        coverage: source.getCoverage(data, dataUpdatedAt),
        adapter,
        rules: { minimumOrders, days },
        // Evaluate a consistent fetched snapshot and refresh every minute.
        now: dataUpdatedAt,
      });
    } catch {
      return unavailableBestSellers(["orderData"]);
    }
  }, [shopCode, data, dataUpdatedAt, source, adapter, minimumOrders, minimumUnits, days, mode]);

  const hasError = ordersQuery.isError || catalog.isError;
  const isLoading = Boolean(shopCode) && (ordersQuery.isPending || catalog.isPending);
  const result = useMemo(() => applyBestSellers(
    products,
    hasError || isLoading ? unavailableBestSellers([]) : calculation,
    { requireCompleteCatalog: mode === "completed-orders-window" },
  ), [products, hasError, isLoading, calculation, mode]);

  const status = hasError ? "error" : isLoading ? "loading" :
    result.status === "unavailable" ? "unavailable" :
      result.bestSellingProducts.length ? "ready" : "empty";

  const diagnostics = {
    status,
    mode,
    minimumOrders,
    minimumUnits,
    issues: calculation.issues,
    orderCounts: calculation.orderCounts ?? calculation.rankings,
    unitCounts: calculation.unitCounts ?? [],
    httpStatus: isAxiosError(ordersQuery.error) ? ordersQuery.error.response?.status ?? null : null,
    requestError: ordersQuery.error?.message ?? null,
  };
  useDebugValue(diagnostics);

  return { ...result, status, mode, diagnostics, rules: { minimumOrders, minimumUnits, days }, refetch: ordersQuery.refetch };
}
