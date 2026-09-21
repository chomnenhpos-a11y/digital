import { ShoppingCart, X } from "lucide-react"
import { useCart } from "../../../../context/CartContext"
import { useTranslation } from "react-i18next";

export default function CartHeader() {
  const { t } = useTranslation();
  const { setIsCartOpen } = useCart()

  return (
    <div className="shrink-0 flex items-center justify-between p-5 border-b border-slate-100">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-red-900">
          <ShoppingCart size={20} />
          {t('cart.yourCart')}
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          {t('cart.reviewItems')}
        </p>
      </div>

      <button
        onClick={() => setIsCartOpen(false)}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition"
      >
        <X size={21} className="text-slate-500" />
      </button>
    </div>
  )
}