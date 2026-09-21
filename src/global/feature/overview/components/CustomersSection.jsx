import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import kv9Img from "../../../assets/kv9.jpg";
import starcaeImg from "../../../assets/starcae.jpg";
import onecareImg from "../../../assets/onecare.png";
import bossImg from "../../../assets/boss.jpg";
import studentImg from "../../../assets/student.jpg";

const CustomersSection = ({ t }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = [
    [
      {
        name: "KV9",
        business: t.customer_kv9_biz,
        img: kv9Img,
        fallback: "https://digital.muchtrading.com/kv9.jpg",
      },
      {
        name: "Star Care",
        business: t.customer_starcare_biz,
        img: starcaeImg,
        fallback: "https://digital.muchtrading.com/starcae.jpg",
      },
      {
        name: "One Care",
        business: t.customer_onecare_biz,
        img: onecareImg,
        fallback: "https://digital.muchtrading.com/onecare.png",
      },
      {
        name: t.customer_setthi,
        business: t.customer_setthi_biz,
        img: bossImg,
        fallback: "https://digital.muchtrading.com/boss.jpg",
      },
    ],
    [
      {
        name: "One Care",
        business: t.customer_onecare_biz,
        img: onecareImg,
        fallback: "https://digital.muchtrading.com/onecare.png",
      },
      {
        name: "Star Care",
        business: t.customer_starcare_biz,
        img: starcaeImg,
        fallback: "https://digital.muchtrading.com/starcae.jpg",
      },
      {
        name: "KV9",
        business: t.customer_kv9_biz,
        img: kv9Img,
        fallback: "https://digital.muchtrading.com/kv9.jpg",
      },
      {
        name: t.customer_sophal,
        business: t.customer_sophal_biz,
        img: studentImg,
        fallback: "https://i.pinimg.com/736x/67/90/9d/67909d18f75757085feb2757eaece904.jpg",
      },
    ],
  ];

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section id="customers" className="py-14 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t.customers_title}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            {t.customers_subtitle}
          </p>
        </div>

        <div
          className="customer-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slides */}
          <div className="relative overflow-hidden min-h-[260px]">
            {slides.map((slideGroup, sIndex) => (
              <div
                key={sIndex}
                className={`transition-all duration-500 ease-in-out ${
                  sIndex === currentSlide
                    ? "opacity-100 relative translate-x-0"
                    : "opacity-0 absolute inset-0 pointer-events-none"
                }`}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {slideGroup.map((item, idx) => (
                    <div key={idx} className="customer-card">
                      <img
                        src={item.img}
                        onError={(e) => {
                          e.target.src = item.fallback;
                        }}
                        alt={item.name}
                        className="customer-logo"
                      />
                      <div className="customer-name">{item.name}</div>
                      <div className="customer-business">{item.business}</div>
                      <div>
                        <span className="customer-badge">
                          <CheckCircle2 className="w-3 h-3 me-1 inline-block text-green-600" />
                          <span>{t.customer_badge}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Prev/Next Controls */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 md:w-10 md:h-10 w-8 h-8 flex items-center justify-center bg-[#8B4773] hover:bg-[#6A3557] text-white rounded-full shadow-lg z-10 transition-all duration-200 focus:outline-none"
            aria-label="Previous customer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-2 sm:translate-x-6 md:w-10 md:h-10 w-8 h-8 flex items-center justify-center bg-[#8B4773] hover:bg-[#6A3557] text-white rounded-full shadow-lg z-10 transition-all duration-200 focus:outline-none"
            aria-label="Next customer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="carousel-indicators">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentSlide(dotIdx)}
                className={dotIdx === currentSlide ? "active" : ""}
                aria-label={`Slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* And many more badge */}
        <div className="text-center mt-6">
          <span className="inline-block bg-gray-100 text-gray-600 rounded-full px-4 py-1.5 text-xs sm:text-sm font-normal">
            {t.customers_more}
          </span>
        </div>
      </div>
    </section>
  );
};

export default CustomersSection;
