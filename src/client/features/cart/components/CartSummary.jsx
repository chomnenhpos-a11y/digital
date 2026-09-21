import { useTranslation } from "react-i18next";

export default function CartSummary({
  cartTotal,
  deliveryFee = 0,
  grandTotal,
  hasItems,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-slate-600">
        <span>{t('cart.subtotal')}</span>

        <span>
          ${cartTotal.toFixed(2)}
        </span>
      </div>

      {hasItems && deliveryFee > 0 && (
        <div className="flex justify-between text-slate-600">
          <span>{t('cart.deliveryFee')}</span>

          <span>
            ${deliveryFee.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex justify-between pt-3 border-t border-slate-100 text-base font-bold text-red-700">
        <span>
          {deliveryFee > 0
            ? t('cart.grandTotal')
            : t('cart.total')}
        </span>

        <span>
          ${grandTotal.toFixed(2)}
        </span>
      </div>
    </div>
  )
}