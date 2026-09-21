import React from 'react';

const ContactSection = ({ t }) => {
  return (
    <section id="contact" className="py-14 sm:py-16 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t.contact_title}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
            {t.contact_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone Numbers Card */}
          <div className="read-box p-6 sm:p-8 text-center flex flex-col justify-between items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="icon-box-sm mx-auto mb-4">
              <i className="bi bi-telephone-fill text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t.contact_phone_title}
            </h3>
            <div className="space-y-2 mb-2">
              <p className="mb-1">
                <a
                  href="tel:069400142"
                  className="font-bold text-lg sm:text-xl text-gray-900 hover:text-[#8b2f67] transition-colors"
                >
                  069 400 142
                </a>
              </p>
              <p className="mb-0">
                <a
                  href="tel:017300242"
                  className="font-bold text-lg sm:text-xl text-gray-900 hover:text-[#8b2f67] transition-colors"
                >
                  017 300 242
                </a>
              </p>
            </div>
          </div>

          {/* YouTube Card */}
          <div className="read-box p-6 sm:p-8 text-center flex flex-col justify-between items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div>
              <div className="icon-box-sm mx-auto mb-4">
                <i className="bi bi-youtube text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.contact_yt_title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-6">
                {t.contact_yt_desc}
              </p>
            </div>
            <a
              href="https://youtube.com/@chomnenh"
              target="_blank"
              rel="noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full inline-flex items-center gap-2 text-sm font-medium shadow-sm transition-all hover:scale-105"
            >
              <i className="bi bi-youtube"></i>
              <span>{t.contact_yt_btn}</span>
            </a>
          </div>

          {/* Telegram Card */}
          <div className="read-box p-6 sm:p-8 text-center flex flex-col justify-between items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div>
              <div className="icon-box-sm mx-auto mb-4">
                <i className="bi bi-telegram text-primary text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.contact_tg_title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-6">
                {t.contact_tg_desc}
              </p>
            </div>
            <a
              href="https://t.me/chomnenh"
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-5 py-2.5 rounded-full inline-flex items-center gap-2 text-sm font-medium shadow-sm transition-all hover:scale-105"
            >
              <i className="bi bi-telegram"></i>
              <span>{t.contact_tg_btn}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
