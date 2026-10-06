import React, { useState } from "react";
import { Search, ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function OrderFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentFilter,
  onPaymentChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col xl:flex-row gap-3 w-full bg-white p-3 rounded-2xl border border-slate-100 shadow-sm items-start xl:items-center">
      
      {/* Top Row: Search + Mobile Filter Toggle */}
      <div className="flex items-center gap-2 w-full xl:w-auto xl:flex-1">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={onSearchChange}
            className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 focus:bg-white text-xs sm:text-sm transition-all"
            placeholder={t('order.searchByCodeOrPhone')}
          />
        </div>
        
        {/* Mobile Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`xl:hidden p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
            showAdvanced || statusFilter || paymentFilter || fromDate || toDate
              ? "bg-[#870d4c]/5 border-[#870d4c]/20 text-[#870d4c]"
              : "bg-[#fcfafb] border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
          title={t('order.filter')}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Expandable Filters */}
      <div
        className={`grid transition-all duration-300 ease-in-out xl:!grid-rows-[1fr] xl:!opacity-100 ${
          showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        } w-full xl:w-auto`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 pt-3 border-t border-slate-100 xl:border-t-0 xl:pt-0 mt-3 xl:mt-0 h-full w-full">
            
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              {/* Payment Dropdown */}
              <div className="w-full sm:flex-1 xl:w-36 flex-shrink-0 relative">
                <select
                value={paymentFilter}
                onChange={onPaymentChange}
                className="appearance-none block w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm cursor-pointer transition-all"
                >
                  <option value="" disabled>{t('order.selectPayment')}</option>
                  <option value="All">{t('order.all')}</option>
                  <option value="Paid">{t('common.paid')}</option>
                  <option value="Unpaid">{t('order.unpaid')}</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="w-full sm:flex-1 xl:w-36 flex-shrink-0 relative">
                <select
                  value={statusFilter}
                  onChange={onStatusChange}
                  className="appearance-none block w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm cursor-pointer transition-all"
                >
                  <option value="" disabled>{t('order.selectStatus')}</option>
                  <option value="All">{t('order.all')}</option>
                  <option value="Pending">{t('dashboard.statusPending')}</option>
                  <option value="Pickup">{t('dashboard.statusPickedUp')}</option>
                  <option value="Delivering">{t('dashboard.statusDelivering')}</option>
                  <option value="Completed">{t('dashboard.statusCompleted')}</option>
                  <option value="Cancelled">{t('dashboard.statusCancelled')}</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="w-full sm:flex-1 xl:w-32 relative">
                <label className="block xl:hidden text-[11px] font-medium text-slate-500 mb-1 pl-1">
                  {t('order.fromDate')}
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={onFromDateChange}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm transition-all"
                  title={t('order.fromDate')}
                />
              </div>

              <div className="w-full sm:flex-1 xl:w-32 relative">
                <label className="block xl:hidden text-[11px] font-medium text-slate-500 mb-1 pl-1">
                  {t('order.toDate')}
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={onToDateChange}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#870d4c]/30 text-xs sm:text-sm transition-all"
                  title={t('order.toDate')}
                />
              </div>

              {/* Reset Button */}
              <div className="w-full sm:w-auto mt-2 sm:mt-0 xl:mt-0">
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange({ target: { value: "" } });
                    onStatusChange({ target: { value: "" } });
                    onPaymentChange({ target: { value: "" } });
                    onFromDateChange({ target: { value: "" } });
                    onToDateChange({ target: { value: "" } });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 rounded-xl bg-[#fcfafb] hover:bg-slate-100 text-slate-600 flex items-center justify-center gap-2 text-xs sm:text-sm transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="sm:hidden xl:inline">{t('order.reset')}</span>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}