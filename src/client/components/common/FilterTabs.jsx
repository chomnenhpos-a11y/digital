import React, { useEffect, useRef } from "react";
import { LayoutGrid } from "lucide-react";

/**
 * FilterTabs / Category Navigation Bar
 * Features:
 * - Horizontal category pills with active indicator
 * - Automatic horizontal centering of active tab on mobile/desktop
 * - Hidden scrollbars across all browsers
 * - Accessible ARIA tablist/tab semantics
 * - Supports category images, count badges, and All Products icon
 */
export default function FilterTabs({ tabs = [], activeTab, onChange }) {
  const scrollContainerRef = useRef(null);
  const tabButtonRefs = useRef({});

  // Auto-scroll the active tab into the center of the scroll container
  useEffect(() => {
    if (!activeTab) return;
    const activeBtn = tabButtonRefs.current[activeTab];
    if (activeBtn && scrollContainerRef.current) {
      activeBtn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  const handleClick = (tabId) => {
    onChange?.(tabId);
  };

  return (
    <nav
      aria-label="Product categories"
      className="relative w-full"
    >
      <div
        ref={scrollContainerRef}
        role="tablist"
        aria-orientation="horizontal"
        className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map((tab, idx) => {
          const tabId =
            typeof tab === "object"
              ? tab.id !== undefined
                ? tab.id
                : tab.name
              : tab;
          const tabName = typeof tab === "object" ? tab.name : tab;
          const tabImage = typeof tab === "object" ? tab.image : null;
          const tabCount = typeof tab === "object" ? tab.count : undefined;
          const isAll = typeof tab === "object" ? tab.isAll : false;
          const isActive = String(activeTab) === String(tabId);

          return (
            <button
              key={tabId || idx}
              ref={(el) => {
                if (el) tabButtonRefs.current[tabId] = el;
                else delete tabButtonRefs.current[tabId];
              }}
              role="tab"
              id={`category-tab-${tabId}`}
              aria-selected={isActive}
              aria-controls={isAll ? undefined : `category-section-${tabId}`}
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => handleClick(tabId)}
              className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full transition-all duration-200 select-none ${
                tabImage
                  ? "pl-1.5 pr-3.5 py-1.5"
                  : "px-4 py-2 md:px-5 md:py-2"
              } text-xs md:text-sm leading-khmer cursor-pointer ${
                isActive
                  ? "bg-red-900 text-white font-medium shadow-md shadow-red-900/20 ring-1 ring-red-900"
                  : "bg-red-50/70 text-slate-700 border border-red-100 font-normal hover:bg-red-100 hover:text-red-950 hover:border-red-200 active:scale-[0.98]"
              }`}
            >
              {isAll ? (
                <div
                  className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-red-100 text-red-900"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
              ) : tabImage ? (
                <img
                  src={tabImage}
                  alt={tabName}
                  loading="lazy"
                  className="w-6 h-6 md:w-7 md:h-7 object-cover rounded-full bg-white border border-slate-200 shrink-0"
                  onError={(e) => {
                    // Hide broken image smoothly
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}

              <span className="truncate">{tabName}</span>

              {typeof tabCount === "number" && tabCount >= 0 && (
                <span
                  className={`text-[10px] md:text-[11px] font-semibold px-1.5 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-red-100/80 text-red-800"
                  }`}
                >
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}