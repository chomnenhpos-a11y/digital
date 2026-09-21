import { useCart } from "../../../../context/CartContext"
import CartItem from "./CartItem"
import { useTranslation } from "react-i18next";

export default function CartItemList() {
  const { t } = useTranslation();
  const { cartItems } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          🛒
        </div>

        <p className="text-slate-500 font-medium">
          {t('cart.emptyCartTitle')}
        </p>

        <p className="text-sm text-slate-400 mt-1">
          {t('cart.emptyCartDesc')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">
          {t('cart.items')}
        </h3>

        <span className="text-sm text-slate-400">
          {t('cart.itemsCount', { count: cartItems.length })}
        </span>
      </div>

      {cartItems.map((item) => (
        <CartItem
          key={item.id}
          item={item}
        />
      ))}
    </div>
  )
}