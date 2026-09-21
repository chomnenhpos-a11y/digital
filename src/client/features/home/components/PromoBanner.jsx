import React from "react";
import { useParams } from "react-router-dom";

import { useSlides } from "@/admin/features/Slides/hooks/useSlides";
import PromoBannerSkeleton from "../../../components/common/PromoBannerSkeleton";
import PromotionSwiper from "./PromotionSwiper";

export default function PromoBanner({ onShopClick }) {
  const { shop_code } = useParams();

  const { slides, isLoading } = useSlides(null, shop_code);

  if (isLoading) {
    return <PromoBannerSkeleton />;
  }

  const activeSlides = slides?.filter((slide) => slide.status === "Active") || [];

  return <PromotionSwiper slides={activeSlides} onShopClick={onShopClick} />;
}
