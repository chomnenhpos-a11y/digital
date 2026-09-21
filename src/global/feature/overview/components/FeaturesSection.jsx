import React from 'react';

const FeaturesSection = ({ t }) => {
  const features = [
    {
      icon: 'bi bi-kanban',
      title: t.f_mgmt_title,
      desc: t.f_mgmt_desc,
    },
    {
      icon: 'bi bi-lightning-charge',
      title: t.f_realtime_title,
      desc: t.f_realtime_desc,
    },
    {
      icon: 'bi bi-tags',
      title: t.f_promo_title,
      desc: t.f_promo_desc,
    },
    {
      icon: 'bi bi-box-seam',
      title: t.f_status_title,
      desc: t.f_status_desc,
    },
    {
      icon: 'bi bi-share',
      title: t.f_share_title,
      desc: t.f_share_desc,
    },
    {
      icon: 'bi bi-phone',
      title: t.f_mobile_title,
      desc: t.f_mobile_desc,
    },
  ];

  return (
    <section id="features" className="py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t.features_title}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            {t.features_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="read-box p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                <i className={`${f.icon} text-primary text-2xl mb-3 block`}></i>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-0">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
