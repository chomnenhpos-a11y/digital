import React, { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from '../../../../lib/alert';
import { exportOrdersToExcel } from '../utils/orderExport/exportOrdersExcel';
import { exportOrdersToPDF } from '../utils/orderExport/exportOrdersPDF';
import { useAuth } from '../../../../hooks/useAuth';
import { useSettingsQuery } from '../../../../queries/settings/useSettingQueries';

export default function OrderExportActions({ orders = [], fromDate = '', toDate = '' }) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const { i18n } = useTranslation();

  const { user } = useAuth();
  const shopCode = user?.shop?.code || user?.shop_code || '';
  const { data: settings } = useSettingsQuery(shopCode);

  const currentLang = i18n.language?.split('-')[0] || 'en';
  const isKhmer = currentLang === 'km';

  const reportPeriod = fromDate && toDate
    ? `${fromDate} - ${toDate}`
    : fromDate
      ? (isKhmer ? `ចាប់ពី ${fromDate}` : `From ${fromDate}`)
      : toDate
        ? (isKhmer ? `រហូតដល់ ${toDate}` : `Through ${toDate}`)
        : (isKhmer ? 'គ្រប់កាលបរិច្ឆេទ' : 'All dates');

  const handleExcelExport = () => {
    if (orders.length === 0) {
      Swal.fire({
        icon: 'info',
        title: isKhmer ? 'គ្មានទិន្នន័យ' : 'No Data',
        text: isKhmer ? 'មិនមានទិន្នន័យបញ្ជាទិញសម្រាប់តម្រងនេះទេ។' : 'No orders found for the current filters.',
      });
      return;
    }
    exportOrdersToExcel(orders, reportPeriod, settings, { language: currentLang });
  };

  const handlePDFExport = async () => {
    if (orders.length === 0) {
      Swal.fire({
        icon: 'info',
        title: isKhmer ? 'គ្មានទិន្នន័យ' : 'No Data',
        text: isKhmer ? 'មិនមានទិន្នន័យបញ្ជាទិញសម្រាប់តម្រងនេះទេ។' : 'No orders found for the current filters.',
      });
      return;
    }
    setIsExportingPDF(true);
    try {
      await exportOrdersToPDF(orders, reportPeriod, settings, { language: currentLang });
    } catch (err) {
      console.error('PDF Export error:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex flex-nowrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
      <span className="text-sm font-medium text-slate-600 ml-1 hidden sm:inline">
        {isKhmer ? 'នាំចេញ:' : 'Export filtered:'}
      </span>
      <button
        type="button"
        onClick={handleExcelExport}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        <FileSpreadsheet size={14} />
        {isKhmer ? 'Excel (ខ្មែរ)' : 'Excel'}
      </button>
      <button
        type="button"
        disabled={isExportingPDF}
        onClick={handlePDFExport}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 border border-red-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        <FileText size={14} className={isExportingPDF ? 'animate-pulse' : ''} />
        {isExportingPDF ? '...' : (isKhmer ? 'PDF (ខ្មែរ)' : 'PDF')}
      </button>
    </div>
  );
}
