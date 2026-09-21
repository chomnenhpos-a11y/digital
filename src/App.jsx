import React from "react";

import { SearchProvider } from "./context/SearchContext";
import { CartProvider } from "./context/CartContext";
import { ProductShareProvider } from "./context/ProductShareContext";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import AppRouter from "./routes/AppRouter";
import ScrollToTop from "./client/components/common/ScrollToTop";
import ProductShareBar from "./client/components/common/ProductShareBar";

export default function App() {
  return (
    <div className="w-full">
      <ProductShareProvider>
        <SearchProvider>
          <CartProvider>
            <ScrollToTop />
            <AdminAuthProvider>
              <AppRouter />
            </AdminAuthProvider>
            <ProductShareBar />
          </CartProvider>
        </SearchProvider>
      </ProductShareProvider>
    </div>
  );
}