import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import EmptyState from "../../../components/common/EmptyState";
import { useTranslation } from "react-i18next";

export default function HorizontalProductGrid({ products = [] }) {
  const { t } = useTranslation();
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidthPct, setThumbWidthPct] = useState(30);
  const [canScroll, setCanScroll] = useState(false);

  const updateScrollProgress = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll > 1) {
        setCanScroll(true);
        // Calculate thumb width percentage relative to visible area
        const calculatedThumbWidth = Math.max(25, Math.min(60, (clientWidth / scrollWidth) * 100));
        setThumbWidthPct(calculatedThumbWidth);

        // Calculate progress percentage (0% to 100%)
        const progress = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
        setScrollProgress(progress);
      } else {
        setCanScroll(false);
      }
    }
  }, []);

  useEffect(() => {
    updateScrollProgress();
    const handleResize = () => updateScrollProgress();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products, updateScrollProgress]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) {
    return <EmptyState message={t('product.noItemsInSection')} />;
  }

  // Calculate translateX for the progress thumb
  const maxTranslate = 100 - thumbWidthPct;
  const translateX = (scrollProgress / 100) * maxTranslate;

  return (
    <div className="relative group w-full">
      {/* Left Scroll Button (Desktop) */}
      <button
        onClick={() => handleScroll("left")}
        aria-label="Scroll left"
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:bg-white hover:text-red-600 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollProgress}
        className="flex gap-4 sm:gap-6 overflow-x-auto flex-nowrap pb-2 pt-1 px-1 scroll-smooth no-scrollbar"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex-none w-[220px] sm:w-[240px] md:w-[260px]"
          >
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>

      {/* Right Scroll Button (Desktop) */}
      <button
        onClick={() => handleScroll("right")}
        aria-label="Scroll right"
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:bg-white hover:text-red-800 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
      >
        <ChevronRight size={20} />
      </button>

      {/* Custom Progress Bar matching design (Soft Gray Track + Vibrant Emerald Thumb) */}
      {canScroll && (
        <div className="flex justify-center items-center mt-3">
          <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-red-800 rounded-full transition-all duration-150 ease-out"
              style={{
                width: `${thumbWidthPct}%`,
                transform: `translateX(${(translateX / thumbWidthPct) * 100}%)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
