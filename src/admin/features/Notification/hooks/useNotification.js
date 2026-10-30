import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  useOrdersQuery,
  useUpdateOrderViewedMutation,
} from "../../../../queries/orders/useOrderQueries";
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useAdminAuth } from "../../../../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";

// ── Per-shop isolated storage keys ─────────────────────────────────────────
// Stock alerts must never leak between shops on the same browser, so every
// shop gets its own key. (The old global keys are migrated/removed below.)
const stockNotificationsStorageKey = (shopCode) =>
  `admin_stock_notifications:${shopCode || "default"}`;

const stockStatesStorageKey = (shopCode) =>
  `admin_stock_states:${shopCode || "default"}`;

// ── Notification retention windows ─────────────────────────────────────────
// Orders stay visible for 1 day, stock alerts for 3 days (calendar days,
// including today).
const DAY_MS = 24 * 60 * 60 * 1000;
const ORDER_RETENTION_DAYS = 1;
const STOCK_RETENTION_DAYS = 3;

const startOfTodayMs = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.getTime();
};

const orderRetentionStartMs = () =>
  startOfTodayMs() - (ORDER_RETENTION_DAYS - 1) * DAY_MS;

const stockRetentionStartMs = () =>
  startOfTodayMs() - (STOCK_RETENTION_DAYS - 1) * DAY_MS;

const isVisibleByAge = (notification) => {
  const createdAt = new Date(notification.createdAt).getTime();
  if (Number.isNaN(createdAt)) return false;

  return notification.type === "order"
    ? createdAt >= orderRetentionStartMs()
    : createdAt >= stockRetentionStartMs();
};

const readStoredStockNotifications = (shopCode) => {
  try {
    const raw = localStorage.getItem(stockNotificationsStorageKey(shopCode));
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function useNotifications() {
  const { user } = useAdminAuth();
  const shopCode = user?.shop?.code || "";

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [stockNotifications, setStockNotifications] = useState(() =>
    readStoredStockNotifications(shopCode)
  );

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Queries are explicitly scoped to the current shop so the stock diff is
  // never computed over another shop's data.
  const { data: orders = [] } = useOrdersQuery(
    shopCode ? { shop_code: shopCode } : {}
  );
  const { data: products = [] } = useProductsQuery(
    shopCode ? { shop_code: shopCode } : {}
  );
  const updateOrderViewedMutation = useUpdateOrderViewedMutation();

  // One-time cleanup of the legacy global keys that caused stock alerts to
  // "migrate" between shops on the same browser.
  useEffect(() => {
    localStorage.removeItem("admin_stock_notifications");
    localStorage.removeItem("admin_stock_states");
  }, []);

  // Reload the persisted list whenever the logged-in shop changes. This keeps
  // read/unread state per shop (and isolates shops on account switches).
  useEffect(() => {
    setStockNotifications(readStoredStockNotifications(shopCode));
  }, [shopCode]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) return;

    const stockStatesStorage = stockStatesStorageKey(shopCode);
    const notificationsStorage = stockNotificationsStorageKey(shopCode);

    let stockStates = {};

    try {
      const raw = localStorage.getItem(stockStatesStorage);
      const parsed = raw ? JSON.parse(raw) : {};

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        stockStates = parsed;
      }
    } catch {
      stockStates = {};
    }

    let stockStatesChanged = false;
    const newStockNotifications = [];

    products.forEach((product) => {
      if (!product?.id) return;

      // Namespace by shop so IDs from other shops can never be matched.
      const storageId = `${shopCode || "default"}:${product.id}`;
      const stock = Number(product.stockQuantity ?? 0);

      const currentState =
        stock === 0
          ? "out_of_stock"
          : stock <= 10
          ? "low_stock"
          : "normal";

      const previousState = stockStates[storageId];

      if (previousState === currentState) return;

      stockStates[storageId] = currentState;
      stockStatesChanged = true;

      if (currentState === "low_stock" || currentState === "out_of_stock") {
        const timestamp = Date.now();

        newStockNotifications.push({
          id: `product-${currentState}-${storageId}-${timestamp}`,
          type: currentState,
          productId: product.id,
          name: product.name || "",
          stockQuantity: stock,
          createdAt: new Date(timestamp).toISOString(),
          read: false,
        });
      }
    });

    if (stockStatesChanged) {
      localStorage.setItem(
        stockStatesStorage,
        JSON.stringify(stockStates)
      );
    }

    if (newStockNotifications.length === 0) return;

    setStockNotifications((prev) => {
      const existingIds = new Set(prev.map((notification) => notification.id));

      const newNotifications = newStockNotifications.filter(
        (notification) => !existingIds.has(notification.id)
      );

      if (newNotifications.length === 0) return prev;

      // Drop expired alerts before persisting so the stored list stays small.
      const updated = [...prev, ...newNotifications].filter(isVisibleByAge);

      localStorage.setItem(
        notificationsStorage,
        JSON.stringify(updated)
      );

      return updated;
    });
  }, [products, shopCode]);

  const orderNotifications = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return orders
      .filter((order) => order?.id && order?.createdAt)
      .map((order) => ({
        id: `order-${order.id}`,
        type: "order",
        orderId: order.id,
        orderNo: order.orderNo || order.id,
        totalAmount: order.totalAmount || 0,
        createdAt: order.createdAt,
        read: Number(order.viewed) === 1,
      }));
  }, [orders]);

  const notifications = useMemo(
    () =>
      [...orderNotifications, ...stockNotifications]
        .filter(isVisibleByAge)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        ),
    [orderNotifications, stockNotifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesType =
        typeFilter === "all" ||
        notification.type === typeFilter;

      const matchesRead =
        activeTab === "all" ||
        (activeTab === "unread" && !notification.read) ||
        (activeTab === "read" && notification.read);

      return matchesType && matchesRead;
    });
  }, [notifications, activeTab, typeFilter]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAsRead = useCallback(
    (id) => {
      const notification = notifications.find(
        (item) => item.id === id
      );

      if (!notification || notification.read) return;

      if (notification.type === "order") {
        updateOrderViewedMutation.mutate({
          orderId: notification.orderId,
        });
        return;
      }

      setStockNotifications((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, read: true } : item
        );

        localStorage.setItem(
          stockNotificationsStorageKey(shopCode),
          JSON.stringify(updated)
        );

        return updated;
      });
    },
    [notifications, updateOrderViewedMutation, shopCode]
  );

  const markAllAsRead = useCallback(() => {
    notifications
      .filter(
        (notification) =>
          notification.type === "order" && !notification.read
      )
      .forEach((notification) => {
        updateOrderViewedMutation.mutate({
          orderId: notification.orderId,
        });
      });

    setStockNotifications((prev) => {
      const updated = prev.map((notification) => ({
        ...notification,
        read: true,
      }));

      localStorage.setItem(
        stockNotificationsStorageKey(shopCode),
        JSON.stringify(updated)
      );

      return updated;
    });
  }, [notifications, updateOrderViewedMutation, shopCode]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleNotificationClick = useCallback(
    (notification) => {
      markAsRead(notification.id);
      setIsOpen(false);

      if (notification.type === "order") {
        window.open(`/print/receipt/${notification.orderNo}`, "_blank", "noopener,noreferrer");
      } else if (notification.type === "low_stock" || notification.type === "out_of_stock") {
        // Open the products page pre-filtered (via URL search param) so the
        // exact product that triggered the stock alert can be found.
        navigate(
          `/admin/products?search=${encodeURIComponent(notification.name || "")}`
        );
      } else {
        navigate("/admin/products");
      }
    },
    [markAsRead, navigate]
  );

  return {
    isOpen,
    dropdownRef,
    activeTab,
    setActiveTab,
    typeFilter,
    setTypeFilter,
    filteredNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    toggleDropdown,
    handleNotificationClick,
  };
}
