import { FaBoxOpen } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function EmptyState({ message }) {
  const { t } = useTranslation();
  const displayMessage = message || t('common.noProductsFound');
  return (
    <div className="text-center py-16 flex flex-col justify-center items-center text-slate-400">
      <FaBoxOpen className="w-20 h-20 md:w-40 md:h-40 text-slate-400"/>
      <p>{displayMessage}</p>
    </div>
  )
}