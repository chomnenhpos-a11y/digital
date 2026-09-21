import React from "react";
import { useTranslation } from "react-i18next";

export default function EmptyCart() {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-2xl">
        🛒
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800">{t('cart.emptyCartTitle')}</h3>
        <p className="text-slate-500 text-sm max-w-[200px] mx-auto">
          {t('cart.emptyCartDesc')}
        </p>
      </div>
    </div>
  )
}