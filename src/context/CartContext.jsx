import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const deliveryFee = 2.5;

  const getStock = (product) => {
    const stock = product?.stockQuantity ?? product?.stock ?? 0;
    return Math.max(0, Number(stock) || 0);
  };

  const addToCart = (product, quantityToAdd = 1) => {
    if (!product?.id) {
      return {
        success: false,
        addedQuantity: 0,
        message: "ផលិតផលមិនត្រឹមត្រូវ",
      };
    }

    const count = Math.max(1, Number(quantityToAdd) || 1);
    const stock = getStock(product);

    if (stock <= 0) {
      return {
        success: false,
        addedQuantity: 0,
        message: "ទំនិញអស់ពីស្តុក",
      };
    }

    const existingItem = cartItems.find(
      (item) => Number(item.id) === Number(product.id)
    );

    const currentQuantity = Number(existingItem?.quantity) || 0;
    const remainingStock = Math.max(0, stock - currentQuantity);

    if (remainingStock <= 0) {
      return {
        success: false,
        addedQuantity: 0,
        message: `ទំនិញនេះមានត្រឹម ${stock} ប៉ុណ្ណោះ`,
      };
    }

    const allowedQuantity = Math.min(count, remainingStock);

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => Number(item.id) === Number(product.id)
      );

      if (existing) {
        return prev.map((item) =>
          Number(item.id) === Number(product.id)
            ? {
                ...item,
                quantity: Number(item.quantity) + allowedQuantity,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity: allowedQuantity,
        },
      ];
    });

    return {
      success: true,
      addedQuantity: allowedQuantity,
      message:
        allowedQuantity < count
          ? `អាចបន្ថែមបានត្រឹម ${allowedQuantity} ប៉ុណ្ណោះ`
          : "",
    };
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) =>
      prev.filter((item) => Number(item.id) !== Number(productId))
    );
  };

  const updateQuantity = (productId, quantity) => {
    const newQuantity = Number(quantity);

    if (!Number.isFinite(newQuantity) || newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev
        .map((item) => {
          if (Number(item.id) !== Number(productId)) {
            return item;
          }

          const stock = getStock(item);
          const safeQuantity = Math.min(newQuantity, stock);

          return {
            ...item,
            quantity: safeQuantity,
          };
        })
        .filter((item) => Number(item.quantity) > 0)
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const itemPrice = Number(item.salePrice || item.price || 0);
    const quantity = Number(item.quantity) || 0;

    return sum + itemPrice * quantity;
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0);
  }, 0);

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    deliveryFee,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}