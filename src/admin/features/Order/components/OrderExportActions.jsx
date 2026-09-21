import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { filterOrdersByMonth } from '../utils/orderExport/monthlyOrderFilter';
import { exportOrdersToExcel } from '../utils/orderExport/exportOrdersExcel';
import { exportOrdersToPDF } from '../utils/orderExport/exportOrdersPDF';
import { useOrdersQuery } from '../../../../queries/orders/useOrderQueries';

export default function OrderExportActions() {
  const { data: rawOrders = [] } = useOrdersQuery();
  const [selectedMonth, setSelectedMonth] = useState('');

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
    exportOrdersToExcel(filtered, selectedMonth);
  };

  const handlePDFExport = () => {
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
    exportOrdersToPDF(filtered, selectedMonth);
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
        onClick={handleExcelExport}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors"
      >
        <Download size={14} />
        Excel
      </button>
      <button
        onClick={handlePDFExport}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-colors"
      >
        <Download size={14} />
        PDF
      </button>
    </div>
  );
}
