import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService.js';
import { orderKeys } from './orderKeys.js';
import { productKeys } from '../products/productKeys.js';
import Swal from '../../lib/alert.js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useOrderQuery(orderId, initialData) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => orderService.getOrder(orderId, { signal }),
    enabled: !!orderId,
    initialData: initialData ?? undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useOrdersQuery(params = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async ({ signal }) => {
      const response = await orderService.getOrders(params, { signal });
      const apiOrders = response?.data || response || [];
      return Array.isArray(apiOrders) ? apiOrders : [];
    },
  });
}

// Custom hook to encapsulate the derived business logic exactly as it was in OrderContext
export function useOrderStats() {
  const { data: orders = [], isPending } = useOrdersQuery();

  const topSellingProducts = useMemo(() => {
    return orders
      .filter((order) => order.paymentStatus === "Paid")
      .flatMap((order) => order.orderDetails || order.items || [])
      .reduce((acc, item) => {
        const productId = item.productId || item.product_id || item.id;

        const existingProduct = acc.find(
          (product) => product.productId === productId
        );

        if (existingProduct) {
          existingProduct.quantity += Number(item.quantity || 0);
        } else {
          acc.push({
            productId,
            name: item.name || '',
            quantity: Number(item.quantity || 0),
          });
        }

        return acc;
      }, [])
      .sort((a, b) => b.quantity - a.quantity);
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter((order) => order.paymentStatus === "Paid")
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }, [orders]);

  return { topSellingProducts, totalRevenue, isPending };
}

export function useCreateOrderMutation() {
  return useOrderCreationMutation(orderService.createOrder);
}

export function useCreatePOSOrderMutation() {
  return useOrderCreationMutation(orderService.createPOSOrder);
}

function useOrderCreationMutation(createOrder) {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: async ({
      shop_code,
      setting_id,
      delivery_provider_id,
      paymentStatus,
      items,
      subtotal,
      delivery,
      customerInfo,
      saleBy,
    }) => {
      const requestedPaymentStatus = paymentStatus ?? customerInfo?.paymentStatus;
      const requestedStatuses = {
        ...(customerInfo?.status != null && { status: customerInfo.status }),
        ...(requestedPaymentStatus != null && { paymentStatus: requestedPaymentStatus }),
      };
      const resolvedSaleBy =
        saleBy != null
          ? Number(saleBy) || null
          : customerInfo?.saleBy != null
          ? Number(customerInfo.saleBy) || null
          : null;

      const payload = {
        shop_code: shop_code || "",

        settingId:
          Number(setting_id) || null,

        customerPhone:
          customerInfo?.phone || "",

        customerAddress:
          customerInfo?.address || "",

        ...(customerInfo?.status != null && { status: customerInfo.status }),

        paymentStatus:
          requestedPaymentStatus ?? "Unpaid",

        deliveryFee:
          Number(delivery) || 0,

        deliveryProviderId:
          Number(delivery_provider_id) ||
          Number(
            customerInfo?.deliveryProviderId
          ) ||
          Number(
            customerInfo?.deliveryMethod
          ) ||
          null,

        ...(resolvedSaleBy != null && { saleBy: resolvedSaleBy }),

        items: (items || []).map(
          (item) => {
            const basePrice =
              Number(item?.salePrice ?? item?.price ?? 0) || 0;

            return {
              productId: Number(
                item.productId || item.id
              ),
              quantity: Number(
                item.quantity
              ),
              ...(basePrice > 0 && {
                price:
                  item.specialPrice != null
                    ? Number(item.specialPrice) || 0
                    : basePrice,
              }),
            };
          }
        ),
      };

      const response =
        await createOrder(
          payload
        );

      const createdOrder = response?.data?.data ?? response?.data ?? response;

      if (
        createdOrder?.id &&
        Object.entries(requestedStatuses).some(
          ([field, value]) => createdOrder[field] !== value,
        )
      ) {
        try {
          const savedOrder = await orderService.updateStatuses(
            createdOrder.id,
            requestedStatuses,
          );

          return { ...createdOrder, ...savedOrder };
        } catch (error) {
          // The order already exists: callers must not retry checkout as a new sale.
          error.createdOrder = { ...createdOrder, ...error.savedOrder };
          throw error;
        }
      }

      return createdOrder;
    },

    onSettled: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: orderKeys.all }),
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
    ]),
  });
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, formData }) => {
      const response = await orderService.updateOrder(orderId, formData);
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    }
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const previousOrders = queryClient.getQueryData(orderKeys.list({}));
      const orderToUpdate = previousOrders?.find(o => o.id === orderId) || {};

      const response = await orderService.updateOrder(orderId, { ...orderToUpdate, status: newStatus });
      return response;
    },
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() });
      const previousOrders = queryClient.getQueryData(orderKeys.list({}));

      if (previousOrders) {
        queryClient.setQueryData(
          orderKeys.list({}),
          previousOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }

      return { previousOrders };
    },
    onError: (err, newOrder, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.list({}), context.previousOrders);
      }
      Swal.fire({
        icon: "error",
        title: t('common.failed'),
        text: t('orders.updateStatusError'),
      });
    },
    onSuccess: (data, { newStatus }) => {
      Swal.fire({
        icon: "success",
        title: t('orders.updated'),
        text: `${t('orders.statusChangedTo')} ${newStatus}`,
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useUpdateOrderPaymentStatusMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ orderId, newPaymentStatus }) => {
      const previousOrders = queryClient.getQueryData(orderKeys.list({}));
      const orderToUpdate = previousOrders?.find(o => o.id === orderId) || {};

      const response = await orderService.updateOrder(orderId, { ...orderToUpdate, paymentStatus: newPaymentStatus });
      return { response, newPaymentStatus };
    },
    onMutate: async ({ orderId, newPaymentStatus }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() });
      const previousOrders = queryClient.getQueryData(orderKeys.list({}));

      if (previousOrders) {
        queryClient.setQueryData(
          orderKeys.list({}),
          previousOrders.map(order =>
            order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
          )
        );
      }

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.list({}), context.previousOrders);
      }
      Swal.fire({ icon: "error", title: t('common.failed'), text: t('orders.updatePaymentStatusError') });
    },
    onSuccess: (data, { newPaymentStatus }) => {
      if (newPaymentStatus === "Paid") {
        Swal.fire({
          icon: "success",
          text: "Payment status is now Paid.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "success",
          title: t('orders.updated'),
          text: t('orders.paymentChangedToUnpaid'),
          timer: 1500,
          showConfirmButton: false,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useUpdateOrderViewedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    // Only send viewed: 1 — do NOT spread the whole order to avoid overwriting fields
    mutationFn: async ({ orderId }) => {
      const response = await orderService.updateOrder(orderId, { viewed: 1 });
      return response;
    },
    onMutate: async ({ orderId }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() });
      const previousOrders = queryClient.getQueryData(orderKeys.list({}));

      // Optimistic update: mark viewed = 1 in cache immediately
      if (previousOrders) {
        queryClient.setQueryData(
          orderKeys.list({}),
          previousOrders.map((order) =>
            order.id === orderId ? { ...order, viewed: 1 } : order
          )
        );
      }
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update on failure
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.list({}), context.previousOrders);
      }
    },
    onSettled: () => {
      // Always refetch to sync real backend state
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async ({ orderId }) => {
      const response = await orderService.deleteOrder(orderId);
      return response;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() });
    },
    onSuccess: (_data, { orderId }) => {
      queryClient.setQueriesData(
        { queryKey: orderKeys.lists() },
        (orders) => Array.isArray(orders)
          ? orders.filter((order) => String(order.id) !== String(orderId))
          : orders,
      );
      queryClient.removeQueries({ queryKey: orderKeys.detail(orderId), exact: true });
      return queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
