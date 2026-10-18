import { useTranslation } from "react-i18next";

export default function PaymentMethod() {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-slate-700">
        {t('cart.paymentMethod', 'វិធីសាស្ត្រទូទាត់')}
      </h3>
      
      <div className="border border-slate-200 rounded-xl p-2 flex items-center gap-4 bg-white hover:border-red-900 cursor-pointer transition-colors shadow-sm hover:shadow-md">

        <div className="shrink-0 w-[52px] h-[52px] rounded-md overflow-hidden flex flex-col font-sans shadow-sm">
         <img src="/images/payment-abakhqr.webp" alt="ABA Logo" />
        </div>
        
        {/* Texts */}
        <div className="flex flex-col">
          <h4 className="text-[14px] sm:text-[17px] font-bold text-[#102a43] leading-tight">
            ABA KHQR
          </h4>
          <p className="text-[12px] sm:text-[13px] text-slate-400 ">
            {t('cart.scanToPay', 'ស្កេនទូទាត់តាមធនាគារជាសមាជិក')}
          </p>
        </div>

      </div>
    </div>
  );
}
