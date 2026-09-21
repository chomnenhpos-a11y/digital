import React from 'react';
import { Clock, Coins, Smartphone, ShieldCheck } from 'lucide-react';

const WhyUsSection = ({ t }) => {
  const items = [
    {
      icon: <Clock className="w-6 h-6" />,
      biIcon: 'bi bi-clock-history',
      title: t.why_save_time_title,
      desc: t.why_save_time_desc,
    },
    {
      icon: <Coins className="w-6 h-6" />,
      biIcon: 'bi bi-cash-coin',
      title: t.why_reduce_cost_title,
      desc: t.why_reduce_cost_desc,
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      biIcon: 'bi bi-phone',
      title: t.why_easy_access_title,
      desc: t.why_easy_access_desc,
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      biIcon: 'bi bi-shield-check',
      title: t.why_boost_trust_title,
      desc: t.why_boost_trust_desc,
    },
  ];

  return (
    <section id="why-us" className="py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t.why_us_title}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            {t.why_us_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="read-box p-6 flex gap-4 items-start transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="icon-box-sm">
                <i className={item.biIcon} style={{ fontSize: '1.4rem' }}></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-0">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
