import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

import { useCreateOrderMutation } from "../../../../queries/orders/useOrderQueries";
import { useProductsQuery } from "../../../../queries/products/useProductQueries";
import { useCategoriesQuery } from "../../../../queries/categories/useCategoryQueries";

import { sendOrderToTelegram } from "../../../../services/telegramService";
import { useAuth } from "../../../../hooks/useAuth";

const INITIAL_CUSTOMER = {
  name: "",
  phone: "",
  address: "",
  deliveryFee: "",
};

export default function useSalesForm() {
  const { t } = useTranslation();
  const { user } = useAuth();

  /**
   * Support different Auth response structures:
   *
   * user.shop.code
   * user.shop.shop_code
   * user.shop_code
   * user.shopCode
   */
  const shopCode =
    user?.shop?.code ||
    user?.shop?.shop_code ||
    user?.shop_code ||
    user?.shopCode ||
    null;

  const {
    data: products = [],
    isPending: isProductsLoading,
  } = useProductsQuery();

  const {
    data: categories = [],
    isPending: isCategoriesLoading,
  } = useCategoriesQuery();

  const createOrderMutation = useCreateOrderMutation();

  const isLoading =
    isProductsLoading ||
    isCategoriesLoading ||
    createOrderMutation.isPending;

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    category: "",
  });

  const filterOptions = useMemo(() => {
    const uniqueCategoryNames = [
      ...new Set(
        categories
          .map((category) => category?.name)
          .filter(Boolean)
      ),
    ];

    return [
      {
        key: "category",
        options: [
          t("common.all"),
          ...uniqueCategoryNames,
        ],
        searchable: true,
      },
    ];
  }, [categories, t]);

  const handleFilterChange = (key, value) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [key]: value,
    }));
  };

  const getStock = (product) => {
    const stock = Number(
      product?.stockQuantity ??
      product?.stock ??
      0
    );

    return Math.max(
      0,
      Number.isFinite(stock) ? stock : 0
    );
  };

  const handleAddToCart = (product) => {
    const stock = getStock(product);

    if (stock <= 0) {
      Swal.fire({
        icon: "warning",
        title: t("sales.outOfStock"),
        text: t("sales.productOutOfStock"),
        confirmButtonColor: "#3b82f6",
        confirmButtonText: t("common.gotIt"),
      });

      return;
    }

    const existingItem = cart.find(
      (item) => Number(item.id) === Number(product.id)
    );

    if (existingItem) {
      const currentQuantity =
        Number(existingItem.quantity) || 0;

      if (currentQuantity >= stock) {
        Swal.fire({
          icon: "warning",
          title: t("sales.outOfStock"),
          text: `ទំនិញនេះមានត្រឹម ${stock} ប៉ុណ្ណោះ`,
          timer: 1500,
          showConfirmButton: false,
        });

        return;
      }

      setCart((previousCart) =>
        previousCart.map((item) =>
          Number(item.id) === Number(product.id)
            ? {
                ...item,
                quantity: currentQuantity + 1,
              }
            : item
        )
      );

      return;
    }

    setCart((previousCart) => [
      ...previousCart,
      {
        ...product,
        quantity: 1,
      },
    ]);
  };

  const handleUpdateQuantity = (id, quantity) => {
    const newQuantity = Number(quantity);

    if (
      !Number.isFinite(newQuantity) ||
      newQuantity <= 0
    ) {
      setCart((previousCart) =>
        previousCart.filter(
          (item) => Number(item.id) !== Number(id)
        )
      );

      return;
    }

    setCart((previousCart) =>
      previousCart
        .map((item) => {
          if (Number(item.id) !== Number(id)) {
            return item;
          }

          const stock = getStock(item);

          if (stock <= 0) {
            return null;
          }

          return {
            ...item,
            quantity: Math.min(newQuantity, stock),
          };
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => Number(item.id) !== Number(id)
      )
    );
  };

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(
        item?.salePrice ??
        item?.price ??
        0
      );

      const quantity =
        Number(item?.quantity) || 0;

      return total + price * quantity;
    }, 0);
  }, [cart]);

  const filterProducts = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const productName = String(
        product?.name || ""
      ).toLowerCase();

      const productCategory =
        product?.categoryName ||
        product?.category?.name ||
        "";

      const matchesSearch =
        productName.includes(searchValue);

      const matchesCategory =
        !filters.category ||
        filters.category === t("common.all") ||
        productCategory === filters.category;

      return matchesSearch && matchesCategory;
    });
  }, [
    products,
    search,
    filters.category,
    t,
  ]);

  const handleCheckout = async ({ customerInfo }) => {
    if (cart.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: t("common.cartEmpty"),
        text: t("common.addProductsFirst"),
        confirmButtonColor: "#3b82f6",
        confirmButtonText: t("common.gotIt"),
      });

      return null;
    }

    const invalidStockItem = cart.find((item) => {
      const stock = getStock(item);
      const quantity =
        Number(item?.quantity) || 0;

      return (
        stock <= 0 ||
        quantity <= 0 ||
        quantity > stock
      );
    });

    if (invalidStockItem) {
      await Swal.fire({
        icon: "warning",
        title: t("sales.outOfStock"),
        text: `${invalidStockItem.name} ${t(
          "sales.stockChanged"
        )}`,
        confirmButtonColor: "#3b82f6",
        confirmButtonText: t("common.gotIt"),
      });

      return null;
    }

    if (!shopCode) {
      console.error(
        "Shop code is missing from authenticated user:",
        user
      );

      await Swal.fire({
        icon: "error",
        title: t("common.failed"),
        text:
          "Shop information is missing. " +
          "Please log in again.",
        confirmButtonColor: "#3b82f6",
        confirmButtonText: t("common.gotIt"),
      });

      return null;
    }

    let newOrder;

    try {
      const mutationResponse =
        await createOrderMutation.mutateAsync({
          shop_code: shopCode,
          items: cart,
          subtotal,
          delivery:
            Number(customerInfo?.deliveryFee) || 0,
          customerInfo,
        });

      const createdOrder =
        mutationResponse?.data?.data ??
        mutationResponse?.data ??
        mutationResponse;

      if (!createdOrder?.id) {
        throw new Error(
          "Create-order API returned an invalid response."
        );
      }

      newOrder = {
        ...createdOrder,
        shop_code:
          createdOrder?.shop_code ||
          createdOrder?.shopCode ||
          shopCode,
      };

      console.log(
        "Created order:",
        createdOrder
      );

      console.log(
        "Order prepared for Telegram:",
        newOrder
      );
    } catch (error) {
      console.error(
        "Failed to create order:",
        error
      );

      await Swal.fire({
        icon: "error",
        title: t("common.failed"),
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          t("sales.createOrderError"),
        confirmButtonColor: "#3b82f6",
        confirmButtonText: t("common.gotIt"),
      });

      return null;
    }

    try {
      await sendOrderToTelegram(newOrder);
    } catch (error) {
      console.error(
        "Failed to send order to Telegram:",
        error
      );
    }

    setCart([]);
    setSearch("");
    setFilters({
      category: "",
    });

    await Swal.fire({
      icon: "success",
      title: t("sales.orderSuccess"),
      confirmButtonColor: "#3b82f6",
      confirmButtonText: t("common.great"),
      showClass: {
        popup:
          "animate__animated animate__fadeInDown",
      },
    });

    return newOrder;
  };

  return {
    search,
    setSearch,

    filters,
    handleFilterChange,
    filterOptions,

    filterProducts,

    cart,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,

    handleCheckout,

    subtotal,
    INITIAL_CUSTOMER,
    isLoading,
    shopCode,
  };
}