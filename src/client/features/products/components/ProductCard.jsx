import { useState, useEffect } from "react";
import {
  Gift,
  Image as ImageIcon,
  Eye,
  ShieldCheck,
  ShoppingCart,
  Share2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import Badge from "../../../components/common/Badge";
import ProductPrice from "./ProductPrice";
import { useProductShareContext } from "../../../../context/ProductShareContext";
import { useCart } from "../../../../context/CartContext";
import { useTranslation } from "react-i18next";

export default function ProductCard({ product = {}, index = 0 }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shop_code } = useParams();

  const {
    id,
    name = "",
    price = 0,
    salePrice = 0,
    discountPrice,
    stock = 0,
    stockQuantity,
    image,
    images = [],
    categoryName,
    cashback,
  } = product;

  const [hoverIndex, setHoverIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const { isSelected: checkIsSelected, toggleProduct } = useProductShareContext();
  const isSelected = checkIsSelected ? checkIsSelected(id) : false;
  const { addToCart } = useCart();

  const availableStock = stockQuantity ?? stock ?? 0;

  const numSalePrice = Number(salePrice || 0);
  const numPrice = Number(price || 0);

  const displayPrice = numSalePrice > 0 ? numSalePrice : numPrice;

  const originalPrice =
    numSalePrice > 0 && numPrice > numSalePrice ? numPrice : null;

  const discountPricePercent = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : null;

  const savingsAmount = originalPrice
    ? originalPrice - displayPrice
    : cashback || 0;

  const validImages =
    Array.isArray(images) && images.length > 0
      ? images.filter(Boolean)
      : [];

  const gallery =
    validImages.length > 0
      ? validImages
      : image
      ? [image]
      : [];

  useEffect(() => {
    if (!isHovering || gallery.length <= 1) return;

    const interval = setInterval(() => {
      setHoverIndex((prev) => (prev + 1) % gallery.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isHovering, gallery.length]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (availableStock <= 0) {
      Swal.fire({
        icon: "warning",
        title: t('product.outOfStock'),
        text: t('product.outOfStockMsg') || t('product.outOfStock'),
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const result = addToCart(product, 1);

    if (!result?.success) {
      Swal.fire({
        icon: "warning",
        title: t('product.cannotAdd'),
        text: result?.message || t('product.itemOutOfStock'),
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: t('product.addedToCart', { quantity: result.addedQuantity }),
      showConfirmButton: false,
      timer: 1200,
      timerProgressBar: true,
    });
  };

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={Math.min(index % 4, 3) * 100}
      onClick={() => navigate(`/${shop_code}/products/${id}`)}
      className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div
        className="group/image relative overflow-hidden bg-gray-50 aspect-[4/4] w-full flex items-center justify-center"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setHoverIndex(0);
        }}
      >
        {/* Product Gallery */}
        {gallery.length > 0 ? (
          <>
            {gallery.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={name}
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/image:scale-110 ${
                  idx === hoverIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              />
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <ImageIcon size={40} strokeWidth={1.5} />
            <span className="text-[11px] mt-2 font-medium text-gray-400">
              {t('product.noImage')}
            </span>
          </div>
        )}

        {/* Share/Selection Button */}
        <div 
          className="absolute top-3 right-3 z-30"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (toggleProduct) {
              toggleProduct(product);
            }
          }}
          title={isSelected ? t('product.unshare') || "Unselect" : t('product.share') || "Share Product"}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all border shadow-sm backdrop-blur-md ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30' : 'bg-white/90 border-gray-200 text-gray-600 hover:bg-white hover:text-blue-600 hover:border-blue-200'}`}>
            <Share2 size={16} strokeWidth={isSelected ? 2.5 : 2} />
          </div>
        </div>

        {discountPricePercent > 0 && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
              -{discountPricePercent}%
            </span>
          </div>
        )}

        {availableStock <= 0 && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center">
            <span className="bg-red-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              {t('product.outOfStock')}
            </span>
          </div>
        )}

        {/* Hover details overlay button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none group-hover/image:pointer-events-auto">
          <div className="flex flex-col items-center">
            <Link
              to={`/${shop_code}/products/${id}`}
              className="translate-y-4 group-hover/image:translate-y-0 transition-all duration-300 flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm text-gray-900 font-semibold text-sm rounded-full shadow-xl hover:bg-red-600 hover:text-white pointer-events-auto"
            >
              <Eye size={18} />
              {t('product.viewDetails')}
            </Link>
          </div>
        </div>
      </div>

      {/* កែប្រែ Padding p-3 សម្រាប់ Mobile នឹង p-4 សម្រាប់ Desktop */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
        {/* Category + Stock */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium uppercase tracking-wider truncate flex-1">
            {categoryName || t('product.general')}
          </span>

          <Badge
            variant="stock"
            className="scale-75 sm:scale-90 origin-right bg-gray-100 text-gray-600 shrink-0"
          >
            {t('product.stock', { count: availableStock })}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-red-600 transition-colors mt-1">
          {name}
        </h3>

        {/* កែប្រែ Bottom Section បន្ថែម flex-1 នឹង min-w-0 */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-end justify-between gap-2 w-full">
          <div className="flex flex-col justify-end flex-1 min-w-0 pb-0.5">
            <div className="w-full flex flex-wrap items-baseline gap-x-1">
              <ProductPrice
                price={displayPrice}
                oldPrice={originalPrice}
              />
            </div>

            {savingsAmount > 0 ? (
              <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-emerald-50/80 w-fit max-w-full px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-emerald-100 mt-1">
                <Gift size={12} className="text-emerald-600 shrink-0" />
                <span className="text-[9px] sm:text-[11px] text-emerald-700 font-medium truncate">
                  {t('product.save', { amount: Number(savingsAmount).toFixed(2) })}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-gray-50 w-fit max-w-full px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-gray-200 mt-1">
                <ShieldCheck size={12} className="text-blue-500 shrink-0" />
                <span className="text-[9px] sm:text-[11px] text-gray-600 font-medium tracking-wide truncate">
                  {t('product.authenticGuarantee')}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={availableStock <= 0}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-red-50 disabled:hover:text-red-600 shrink-0 mb-1"
            aria-label={t('product.addToCart')}
            title={t('product.addToCart')}
          >
            <ShoppingCart size={16} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}