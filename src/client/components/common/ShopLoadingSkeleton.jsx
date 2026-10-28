import React from "react";
import Container from "../layout/Container";
import PromoBannerSkeleton from "./PromoBannerSkeleton";
import ProductSkeletonGrid from "./ProductSkeletonGrid";

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white md:shadow-md shadow-lg md:border-b md:border-slate-100 border-b-2 border-red-800">
      <Container className="w-full py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 md:w-14 md:h-14 bg-slate-200 rounded-xl shrink-0 animate-pulse" />
            <div className="h-6 w-28 md:w-32 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="hidden md:block flex-1 h-10 bg-slate-100 rounded-full animate-pulse" />
          <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-200 rounded-lg md:rounded-full shrink-0 animate-pulse ml-auto" />
        </div>
      </Container>
    </header>
  );
}

/**
 * Page-shaped loading skeleton shown while the ShopRouteGuard validates the
 * shop code against the backend. Mirrors the real customer shop layout
 * (header, promo banner, product grid) so nothing jarring flashes on screen.
 */
export default function ShopLoadingSkeleton() {
  return (
    <div className="relative">
      <HeaderSkeleton />
      <Container className="pt-4 md:space-y-6">
        <PromoBannerSkeleton />
        <ProductSkeletonGrid count={8} />
      </Container>
    </div>
  );
}
