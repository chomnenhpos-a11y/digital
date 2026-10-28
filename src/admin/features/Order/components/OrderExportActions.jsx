import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import Swal from '../../../../lib/alert';
import { filterOrdersByMonth } from '../utils/orderExport/monthlyOrderFilter';
import { exportOrdersToExcel } from '../utils/orderExport/exportOrdersExcel';
import { exportOrdersToPDF } from '../utils/orderExport/exportOrdersPDF';
import { useOrdersQuery } from '../../../../queries/orders/useOrderQueries';
import { useAuth } from '../../../../hooks/useAuth';
import { useSettingsQuery } from '../../../../queries/settings/useSettingQueries';

export default function OrderExportActions() {
  const { data: rawOrders = [] } = useOrdersQuery();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const { user } = useAuth();
  const shopCode = user?.shop?.code || user?.shop_code || '';
  const { data: settings } = useSettingsQuery(shopCode);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, []);

  const handleExcelExport = () => {
    if (!selectedMonth || !rawOrders) return;
    const filtered = filterOrdersByMonth(rawOrders, selectedMonth);
    if (filtered.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No orders found for the selected month.',
      });
      return;
    }
    exportOrdersToExcel(filtered, selectedMonth, settings);
  };

  const handlePDFExport = async () => {
    if (!selectedMonth || !rawOrders) return;
    const filtered = filterOrdersByMonth(rawOrders, selectedMonth);
    if (filtered.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'No orders found for the selected month.',
      });
      return;
    }
    setIsExportingPDF(true);
    try {
      await exportOrdersToPDF(filtered, selectedMonth, settings);
    } catch (err) {
      console.error('PDF Export error:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const maxMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  return (
    <div className="flex flex-nowrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
      <span className="text-sm font-medium text-slate-600 ml-1 hidden sm:inline">Monthly Export:</span>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        max={maxMonth()}
        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:border-[#870d4c] bg-[#fcfafb] cursor-pointer hover:bg-slate-100 transition-colors"
      />
      <button
        type="button"
        onClick={handleExcelExport}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        <FileSpreadsheet size={14} />
        Excel
      </button>
      <button
        type="button"
        disabled={isExportingPDF}
        onClick={handlePDFExport}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 border border-red-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        <FileText size={14} className={isExportingPDF ? 'animate-pulse' : ''} />
        {isExportingPDF ? '...' : 'PDF'}
      </button>
    </div>
  );
}
