import React from 'react';
import appMockupImg from '../../../assets/app.png';

const MobileAppSection = ({ t }) => {
  return (
    <section id="mobile-app" className="py-14 sm:py-16 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <i className="bi bi-phone text-primary"></i>
            <span>{t.app_title}</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            {t.app_subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Mockup Image */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative group">
              <img
                src={appMockupImg}
                onError={(e) => {
                  e.target.src = 'https://digital.muchtrading.com/app.png';
                }}
                alt="Chomnenh Digital Menu App Mockup"
                className="w-full max-w-[280px] sm:max-w-[320px] rounded-3xl shadow-xl transition-all duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column: Features & Download */}
          <div className="lg:col-span-6">
            <div className="lg:pl-4 space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <i className="bi bi-star-fill text-yellow-500"></i>
                <span>{t.app_why_title}</span>
              </h3>

              {/* Fast & Easy */}
              <div className="flex items-start gap-4">
                <div className="icon-box-sm !rounded-full shrink-0">
                  <i className="bi bi-speedometer2 text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    {t.app_fast_title}
                  </h4>
                  <p className="text-gray-500 text-sm mb-0">
                    {t.app_fast_desc}
                  </p>
                </div>
              </div>

              {/* Instant Alerts */}
              <div className="flex items-start gap-4">
                <div className="icon-box-sm !rounded-full shrink-0">
                  <i className="bi bi-bell text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    {t.app_alert_title}
                  </h4>
                  <p className="text-gray-500 text-sm mb-0">
                    {t.app_alert_desc}
                  </p>
                </div>
              </div>

              {/* Download Box */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-200 mt-6">
                <p className="font-bold text-gray-900 mb-3 text-sm sm:text-base">
                  {t.app_download_title}
                </p>
                <div className="flex flex-wrap gap-3">
                  {/* App Store Button */}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="btn-download bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-sm transition-all"
                  >
                    <i className="bi bi-apple text-2xl"></i>
                    <div className="text-left leading-tight">
                      <span className="block text-[10px] text-gray-300">
                        Download on the
                      </span>
                      <span className="font-bold text-sm">App Store</span>
                    </div>
                  </a>

                  {/* Google Play Button */}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="btn-download bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-sm transition-all"
                  >
                    <i className="bi bi-google-play text-2xl"></i>
                    <div className="text-left leading-tight">
                      <span className="block text-[10px] text-gray-300">
                        Get it on
                      </span>
                      <span className="font-bold text-sm">Google Play</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;
