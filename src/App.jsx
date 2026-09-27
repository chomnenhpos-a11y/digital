import React from "react";
import { createBrowserRouter, RouterProvider, Outlet, Route, createRoutesFromElements } from "react-router-dom";

import { SearchProvider } from "./context/SearchContext";
import { CartProvider } from "./context/CartContext";
import { ProductShareProvider } from "./context/ProductShareContext";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import { appRoutes } from "./routes/AppRouter";
import ScrollToTop from "./client/components/common/ScrollToTop";
import ProductShareBar from "./client/components/common/ProductShareBar";

const RootLayout = () => {
  return (
    <div className="w-full">
      <ProductShareProvider>
        <SearchProvider>
          <CartProvider>
            <ScrollToTop />
            <AdminAuthProvider>
              <Outlet />
            </AdminAuthProvider>
            <ProductShareBar />
          </CartProvider>
        </SearchProvider>
      </ProductShareProvider>
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {appRoutes}
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}