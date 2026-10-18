import { ShoppingCart, X } from "lucide-react";
import { useCart } from "../../../../context/CartContext";
import { useTranslation } from "react-i18next";

export default function CartHeader() {
  const { t } = useTranslation();
  const { setIsCartOpen } = useCart();

  return (
    <div className="shrink-0 flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 bg-white">
      
      {/* Left: Title and Subtitle */}
      <div className="flex items-center gap-3">
        <ShoppingCart size={24} className="text-red-900 shrink-0" strokeWidth={2} />
        <div className="flex flex-col">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-red-900 leading-tight">
            {t('cart.yourCart')}
          </h2>
        </div>
      </div>

      {/* Right: ABA PayWay Branding & Close Button */}
      <div className="flex items-center gap-2 sm:gap-3">
{/*         
        <div className="flex items-center gap-1.5 sm:gap-2">
          <img 
            src="/images/aba icon.jpeg" 
            alt="ABA Logo" 
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain rounded-md"
          />

          <div className="w-[1px] h-4 sm:h-5 bg-slate-200"></div>

          <div className="text-[14px] sm:text-[15px] font-extrabold italic tracking-tight">
            <span className="text-cyan-800">Pay</span>
            <span className="text-red-800">Way</span>
          </div>
        </div>

        <div className="w-[1px] h-5 sm:h-6 bg-slate-200 mx-0.5 sm:mx-1"></div> */}
        
        {/* Close Button */}
        <button
          onClick={() => setIsCartOpen(false)}
          className="text-slate-500 hover:text-slate-800 transition p-1 shrink-0"
          aria-label="Close cart"
        >
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>

    </div>
  );
}