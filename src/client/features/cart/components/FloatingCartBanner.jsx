import { useCart } from "../../../../context/CartContext";
import { useTranslation } from "react-i18next";

export default function FloatingCartBanner() {
  const { t } = useTranslation();
  const { cartCount, cartTotal, setIsCartOpen, isCartOpen } = useCart();

  if (cartCount === 0 || isCartOpen) return null;
return (
    <div className="fixed bottom-3 md:bottom-1 left-0 right-0 z-40 px-4 md:px-8 max-w-5xl md:max-w-3xl mx-auto pointer-events-none">
      <div
        onClick={() => setIsCartOpen(true)}
        className="pointer-events-auto cursor-pointer flex items-center justify-between bg-red-900 hover:bg-red-800 text-white rounded-2xl p-2 px-3 md:px-4 shadow-2xl transition-all duration-300 mx-auto w-full md:w-[80%]"
      >
        <div className="flex-1 flex items-center justify-start gap-2 md:gap-3">
          <span className="bg-white/20 px-2 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold whitespace-nowrap">
            {cartCount} {t('cart.items')}
          </span>
        </div>

        <div className="shrink-0 text-center font-bold text-sm md:text-base tracking-wide px-2">
          {t('sales.reviewOrder')}
        </div>

        <div className="flex-1 flex items-center justify-end gap-2 md:gap-3">
          <span className="bg-white/20 px-2 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold whitespace-nowrap">
            ${cartTotal.toFixed(2)}
          </span>
        </div>

      </div>
    </div>
  );  
}
