import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import useProductShare from "../hooks/useProductShare";

const ProductShareContext = createContext(null);

export const useProductShareContext = () => {
  const context = useContext(ProductShareContext);

  if (!context) {
    throw new Error(
      "useProductShareContext must be used within a ProductShareProvider"
    );
  }

  return context;
};

export const ProductShareProvider = ({ children }) => {
  // Store selected product objects
  const [selectedProducts, setSelectedProducts] = useState([]);

  const { isSharing, shareProducts } = useProductShare();

  const toggleProduct = useCallback((product) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);

      if (exists) {
        // Unselect
        return prev.filter((p) => p.id !== product.id);
      }

      // Select
      return [...prev, product];
    });
  }, []);

  const removeProduct = useCallback((productId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.id !== productId)
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const isSelected = useCallback(
    (productId) => {
      return selectedProducts.some((p) => p.id === productId);
    },
    [selectedProducts]
  );

  const handleShare = useCallback(async () => {
    if (selectedProducts.length === 0) return;

    const success = await shareProducts(selectedProducts);
    if (success) {
      clearSelection();
    }
  }, [selectedProducts, shareProducts, clearSelection]);

  const selectedCount = selectedProducts.length;

  const value = useMemo(
    () => ({
      selectedProducts,
      toggleProduct,
      removeProduct,
      clearSelection,
      isSelected,
      handleShare,
      isSharing,
      selectedCount,
    }),
    [
      selectedProducts,
      toggleProduct,
      removeProduct,
      clearSelection,
      isSelected,
      handleShare,
      isSharing,
      selectedCount,
    ]
  );

  return (
    <ProductShareContext.Provider value={value}>
      {children}
    </ProductShareContext.Provider>
  );
};