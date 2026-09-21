import React from 'react';
import { Link } from 'react-router-dom';
import adminImg from '../../../assets/admin.png';

const HeroSection = ({ t }) => {
  return (
    <>
      {/* HERO HEADER */}
      <header id="home" className="hero-section text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight">
                {t.hero_title}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-200 opacity-90 max-w-2xl mx-auto leading-relaxed">
                {t.hero_subtitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* READ BOX CONTAINER */}
      <div className="read-box-container mb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="read-box p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column Text & CTA */}
              <div className="lg:col-span-6 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {t.read_box_title}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t.read_box_desc}
                </p>
                <div className="pt-2">
                  <Link
                    to="/register"
                    className="btn-primary px-6 py-2.5 rounded-full font-medium text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 inline-block text-center"
                  >
                    {t.read_box_btn}
                  </Link>
                </div>
              </div>

              {/* Right Column System Preview Card */}
              <div className="lg:col-span-6 text-center">
                <div className="system-preview-card p-2 bg-white transition-all duration-300 hover:shadow-2xl">
                  <img
                    src={adminImg}
                    onError={(e) => {
                      e.target.src = 'https://digital.muchtrading.com/admin.png';
                    }}
                    alt="System UI"
                    className="w-full h-auto rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
