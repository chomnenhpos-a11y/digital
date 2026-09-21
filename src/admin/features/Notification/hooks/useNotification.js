import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  useOrdersQuery,
  useUpdateOrderViewedMutation,
} from "../../../../queries/orders/useOrderQueries";
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useNavigate } from "react-router-dom";

const STOCK_NOTIFICATIONS_KEY = "admin_stock_notifications";
const STOCK_STATES_KEY = "admin_stock_states";

export function useNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [stockNotifications, setStockNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(STOCK_NOTIFICATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { data: orders = [] } = useOrdersQuery();
  const { data: products = [] } = useProductsQuery();
  const updateOrderViewedMutation = useUpdateOrderViewedMutation();

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

    let stockStates = {};

    try {
      const raw = localStorage.getItem(STOCK_STATES_KEY);
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

      const productId = product.id;
      const stock = Number(product.stockQuantity ?? 0);

      const currentState =
        stock === 0
          ? "out_of_stock"
          : stock <= 10
          ? "low_stock"
          : "normal";

      const previousState = stockStates[productId];

      if (previousState === currentState) return;

      stockStates[productId] = currentState;
      stockStatesChanged = true;

      if (currentState === "low_stock" || currentState === "out_of_stock") {
        const timestamp = Date.now();

        newStockNotifications.push({
          id: `product-${currentState}-${productId}-${timestamp}`,
          type: currentState,
          productId,
          name: product.name || "",
          stockQuantity: stock,
          createdAt: new Date(timestamp).toISOString(),
          read: false,
        });
      }
    });

    if (stockStatesChanged) {
      localStorage.setItem(
        STOCK_STATES_KEY,
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

      const updated = [...prev, ...newNotifications];

      localStorage.setItem(
        STOCK_NOTIFICATIONS_KEY,
        JSON.stringify(updated)
      );

      return updated;
    });
  }, [products]);

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
      [...orderNotifications, ...stockNotifications].sort(
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
          STOCK_NOTIFICATIONS_KEY,
          JSON.stringify(updated)
        );

        return updated;
      });
    },
    [notifications, updateOrderViewedMutation]
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
        STOCK_NOTIFICATIONS_KEY,
        JSON.stringify(updated)
      );

      return updated;
    });
  }, [notifications, updateOrderViewedMutation]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleNotificationClick = useCallback(
    (notification) => {
      markAsRead(notification.id);
      setIsOpen(false);

      navigate(
        notification.type === "order"
          ? `/admin/print-receipt/${notification.orderNo}`
          : "/admin/products"
      );
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