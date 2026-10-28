import React, { useState } from "react";
import { Search, ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductsSaleToolbar({
  dateRange = { startDate: "", endDate: "" },
  onDateRangeChange,
  search = "",
  onSearchChange,
  filters = { seller: "", group: "" },
  onFilterChange,
  onReset,
  sellerOptions = [],
  groupOptions = [],
  labels = {},
  maxDate,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t } = useTranslation();

  const hasActiveFilters = Boolean(
    search ||
    filters?.seller ||
    filters?.group ||
    dateRange?.startDate ||
    dateRange?.endDate
  );

  return (
    <div className="flex flex-col xl:flex-row gap-3 w-full p-3 rounded-2xl border border-slate-100 shadow-sm items-start xl:items-center">
      {/* Search Input + Mobile Filter Toggle Button */}
      <div className="flex items-center gap-2 w-full xl:w-auto xl:flex-1">
        <div className="relative flex-1 ">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={onSearchChange}
            className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 focus:bg-white text-xs sm:text-sm transition-all"
            placeholder={
              labels?.searchPlaceholder ||
              t("productsSale.searchPlaceholder") ||
              t("order.searchByProductName") ||
              "Search by Product Name"
            }
          />
        </div>

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`xl:hidden p-2.5 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
            showAdvanced || hasActiveFilters
              ? "bg-[#870d4c]/5 border-[#870d4c]/20 text-[#870d4c]"
              : "bg-[#fcfafb] border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
          title={t("order.filter") || "Filter"}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Expandable Filter Group */}
      <div
        className={`grid transition-all  duration-300 ease-in-out xl:!grid-rows-[1fr] xl:!opacity-100 ${
          showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        } w-full xl:w-auto`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 pt-3 border-t border-slate-100 xl:border-t-0 xl:pt-0 mt-3 xl:mt-0 h-full w-full">
            {/* Dropdowns Row: Seller & Group */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              {/* Seller Dropdown */}
              <div className="w-full sm:flex-1 xl:w-40 flex-shrink-0 relative">
                <select
                  value={filters?.seller || ""}
                  onChange={(e) => onFilterChange("seller", e.target.value)}
                  className="appearance-none block w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm cursor-pointer transition-all"
                >
                  <option value="">
                    {labels?.seller ||
                      t("productsSale.selectSeller") ||
                      t("order.selectSeller") ||
                      "Select Seller"}
                  </option>
                  {sellerOptions.map((seller) => (
                    <option key={seller} value={seller}>
                      {seller}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Group / Category Dropdown */}
              <div className="w-full sm:flex-1 xl:w-40 flex-shrink-0 relative">
                <select
                  value={filters?.group || ""}
                  onChange={(e) => onFilterChange("group", e.target.value)}
                  className="appearance-none block w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm cursor-pointer transition-all"
                >
                  <option value="">
                    {labels?.group ||
                      t("productsSale.selectGroup") ||
                      t("order.selectGroup") ||
                      "Select Group"}
                  </option>
                  {groupOptions.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Date Range & Reset Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              {/* From Date */}
              <div className="w-full sm:flex-1 xl:w-36 relative">
                <label className="block xl:hidden text-[11px] font-medium text-slate-500 mb-1 pl-1">
                  {labels?.from || t("productsSale.from") || t("order.fromDate") || "From"}
                </label>
                <input
                  type="date"
                  value={dateRange?.startDate || ""}
                  max={dateRange?.endDate || maxDate}
                  onChange={(e) =>
                    onDateRangeChange({ startDate: e.target.value })
                  }
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm transition-all cursor-pointer"
                  title={labels?.from || t("productsSale.from") || t("order.fromDate") || "From"}
                />
              </div>

              {/* To Date */}
              <div className="w-full sm:flex-1 xl:w-36 relative">
                <label className="block xl:hidden text-[11px] font-medium text-slate-500 mb-1 pl-1">
                  {labels?.to || t("productsSale.to") || t("order.toDate") || "To"}
                </label>
                <input
                  type="date"
                  value={dateRange?.endDate || ""}
                  min={dateRange?.startDate}
                  max={maxDate}
                  onChange={(e) =>
                    onDateRangeChange({ endDate: e.target.value })
                  }
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm transition-all cursor-pointer"
                  title={labels?.to || t("productsSale.to") || t("order.toDate") || "To"}
                />
              </div>

              {/* Reset Button */}
              <div className="w-full sm:w-auto mt-2 sm:mt-0 xl:mt-0">
                <button
                  type="button"
                  onClick={onReset}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] hover:bg-slate-100 text-slate-600 flex items-center justify-center gap-2 text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="sm:hidden xl:inline">
                    {labels?.reset || t("productsSale.reset") || t("order.reset") || "Reset"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
