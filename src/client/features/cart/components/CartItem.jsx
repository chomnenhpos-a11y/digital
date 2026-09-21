import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "../../../../context/CartContext"
import { useTranslation } from "react-i18next";

export default function CartItem({ item }) {
  const { t } = useTranslation();
  const {
    updateQuantity,
    removeFromCart,
  } = useCart()

  const unitPrice = Number(item.salePrice || item.price || 0)
  const itemTotal = unitPrice * item.quantity

  return (
    <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center">
      <img
        src={item.image || (item.images && item.images[0]) || ""}
        alt={item.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0 bg-slate-200"
      />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="font-semibold text-sm text-slate-900 truncate">
            {item.name}
          </p>

          <button
            onClick={() => removeFromCart(item.id)}
            className="shrink-0 p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
            title={t('cart.removeFromCart')}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <p className="text-red-700 font-bold text-sm mt-0.5">
          ${unitPrice.toFixed(2)}
        </p>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden shadow-2xs">
            <button
              onClick={() =>
                updateQuantity(
                  item.id,
                  item.quantity - 1
                )
              }
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <Minus size={14} />
            </button>

            <span className="w-8 text-center text-xs sm:text-sm font-bold text-slate-800">
              {item.quantity}
            </span>

            <button
              onClick={() =>
                updateQuantity(
                  item.id,
                  item.quantity + 1
                )
              }
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          <p className="font-bold text-sm text-slate-900">
            ${itemTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}