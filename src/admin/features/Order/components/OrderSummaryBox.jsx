import React from "react";
import { useTranslation } from 'react-i18next';

export default function OrderSummaryBox({
  subtotal = 0,
  discount = 0,
  delivery = 0,
  onCheckout,
  disabled,
}) {
  const { t } = useTranslation();
  const safeSubtotal = Number(subtotal) || 0;
  const safeDiscount = Number(discount) || 0;
  const safeDelivery = Number(delivery) || 0;
  const total = safeSubtotal - safeDiscount + safeDelivery;
  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">
        {t('order.summary')}
      </h3>

      <div className="space-y-3 flex-1">
        <div className="flex justify-between text-sm text-slate-600">
          <span>{t('order.itemPrice')}</span>
          <span className="font-semibold text-slate-800">
            ${safeSubtotal.toFixed(2)}
          </span>
        </div>

        {/* Conditional rendering for discount */}
        {safeDiscount > 0 && (
          <div className="flex justify-between text-sm text-slate-600 bg-red-50 p-1.5 -mx-1.5 rounded-lg px-2">
            <span className="text-red-600 font-medium">{t('order.discount')}</span>
            <span className="font-bold text-red-600">
              -${safeDiscount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Delivery Row */}
        <div className="flex justify-between text-sm text-slate-600 pb-4 border-b border-slate-100">
          <span>{t('order.deliveryFeeLabel')}</span>
          <span className="font-semibold text-slate-800">
            ${safeDelivery.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Emphasized Total Box */}
      <div className="bg-[#fcfafb] border border-slate-200 rounded-xl px-4 py-3 my-4 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-700 uppercase">
          {t('order.grandTotal')}
        </span>
        <span className="text-xl font-black text-green-600">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#9d1159] hover:bg-[#9d1159] text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {t('order.checkout')}
      </button>
    </div>
  );
}
