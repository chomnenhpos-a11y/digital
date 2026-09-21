import React from "react";
import { ArrowRight, Percent } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import Button from "../../../components/common/Button";

export default function PromotionSwiper({ slides = [], onShopClick }) {
  if (!slides.length) {
    return null;
  }

  return (
    <Swiper
      spaceBetween={20}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="w-full"
    >
      {slides.map((slide) => {
        const backgroundColor =
          slide.backgroundColor ||
          "linear-gradient(to bottom right, #7f1d1d, #991b1b)";

        return (
          <SwiperSlide key={slide.id}>
            <div
              style={{ background: backgroundColor }}
              className="relative overflow-hidden text-white rounded-2xl p-2 md:p-8"
            >
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full" />

              {slide.discountPercentage > 0 && (
                <div className="absolute top-4 right-4 md:top-10 md:right-8">
                  <div className="relative flex flex-col items-center justify-center w-12 h-12 md:w-24 md:h-24 rounded-full bg-white text-red-600 shadow-xl rotate-6">
                    <span className="flex text-sm md:text-3xl font-extrabold leading-none">
                      {slide.discountPercentage}
                      <Percent
                        className="w-[0.7em] h-[0.7em]"
                        strokeWidth={3}
                      />
                    </span>

                    <span className="text-[10px] md:text-xs font-bold uppercase">
                      OFF
                    </span>
                  </div>
                </div>
              )}

              <span className="inline-block bg-white/15 text-xs font-medium px-3 py-1 rounded-full mb-4">
                {slide.tag}
              </span>

              <h2 className="text-lg md:text-3xl font-bold max-w-xl">
                {slide.title}
              </h2>

              <p className="mt-2 text-sm text-white/80 max-w-md leading-khmer">
                {slide.description}
              </p>

              <Button
                onClick={() => onShopClick?.(slide)}
                variant="white"
                className="
                  mt-6
                  flex items-center gap-2
                  rounded-[100px]
                  md:rounded-[80px]
                  text-[14px]
                  md:text-[16px]
                  font-semibold
                  transition-transform
                  duration-300
                  hover:scale-105
                "
              >
                {slide.ctaText}

                <ArrowRight size={16} />
              </Button>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
