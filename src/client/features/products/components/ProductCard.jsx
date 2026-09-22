import { useState, useEffect } from "react";
import {
  Gift,
  Image as ImageIcon,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom"; // 1. Import useNavigate

import Badge from "../../../components/common/Badge";
import ProductPrice from "./ProductPrice";
import { useProductShareContext } from "../../../../context/ProductShareContext";
import { useTranslation } from "react-i18next";

export default function ProductCard({ product = {}, index = 0 }) {
  const { t } = useTranslation();
  const navigate = useNavigate(); // 2. Initialize navigate
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

  const availableStock = stockQuantity ?? stock ?? 0;

  const numSalePrice = Number(salePrice || 0);
  const numPrice = Number(price || 0);

  const displayPrice =
    numSalePrice > 0 ? numSalePrice : numPrice;

  const originalPrice =
    numSalePrice > 0 && numPrice > numSalePrice
      ? numPrice
      : null;

  const discountPricePercent =
    discountPrice ||
    (originalPrice
      ? Math.round(
          ((originalPrice - displayPrice) / originalPrice) * 100
        )
      : null);

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

  // Image hover gallery
  useEffect(() => {
    if (!isHovering || gallery.length <= 1) return;

    const interval = setInterval(() => {
      setHoverIndex(
        (prev) => (prev + 1) % gallery.length
      );
    }, 1200);

    return () => clearInterval(interval);
  }, [isHovering, gallery.length]);

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={Math.min(index % 4, 3) * 100}
      onClick={() => navigate(`/${shop_code}/products/${id}`)} // 3. Add onClick handler to the main card container
      className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer" // 4. Added cursor-pointer
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
                  idx === hoverIndex
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0"
                }`}
              />
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <ImageIcon
              size={40}
              strokeWidth={1.5}
            />
            <span className="text-[11px] mt-2 font-medium text-gray-400">
              {t('product.noImage')}
            </span>
          </div>
        )}

        {/* Selection Checkbox (Stop propagation so it doesn't trigger card navigation) */}
        <div 
          className="absolute top-3 right-3 z-30"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (toggleProduct) {
              toggleProduct(product);
            }
          }}
        >
          <div className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors border shadow-sm backdrop-blur-md ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/70 border-gray-300 hover:bg-white text-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
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
            {/* You can keep this as a Link or change to a span since the whole card now routes */}
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

      <div className="p-4 flex flex-col flex-1">
        {/* Category + Stock */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider truncate">
            {categoryName || t('product.general')}
          </span>

          <Badge
            variant="stock"
            className="scale-90 origin-right bg-gray-100 text-gray-600"
          >
            {t('product.stock', { count: availableStock })}
          </Badge>
        </div>

        {/* Product Name (Since card handles click, you can keep or remove Link wrapper here) */}
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-snug line-clamp-2 hover:text-red-600 transition-colors mt-1">
          {name}
        </h3>

        <div className="mt-auto pt-1 border-t border-gray-100 flex flex-col min-h-[64px] justify-end">
          <ProductPrice
            price={displayPrice}
            oldPrice={originalPrice}
          />

          {savingsAmount > 0 ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50/80 w-fit px-2 py-1 rounded-md border border-emerald-100">
              <Gift size={12} className="text-emerald-600" />
              <span className="text-[11px] text-emerald-700 font-medium">
                {t('product.save', { amount: Number(savingsAmount).toFixed(2) })}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-200">
              <ShieldCheck size={12} className="text-blue-500" />
              <span className="text-[11px] text-gray-600 font-medium tracking-wide">
                {t('product.authenticGuarantee')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}