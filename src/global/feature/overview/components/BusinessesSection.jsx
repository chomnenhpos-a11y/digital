import React from 'react';

const BusinessesSection = ({ t }) => {
  const badges = [
    { icon: 'bi bi-tag-fill', label: t.biz_clothing },
    { icon: 'bi bi-cup-hot-fill', label: t.biz_food },
    { icon: 'bi bi-stars', label: t.biz_cosmetics },
    { icon: 'bi bi-phone-fill', label: t.biz_electronics },
    { icon: 'bi bi-cart-fill', label: t.biz_general },
    { icon: 'bi bi-gift-fill', label: t.biz_handmade },
  ];

  return (
    <section id="businesses" className="py-14 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t.biz_title}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            {t.biz_subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className="business-badge shadow-sm"
            >
              <i className={`${b.icon} text-primary me-2`}></i>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessesSection;
