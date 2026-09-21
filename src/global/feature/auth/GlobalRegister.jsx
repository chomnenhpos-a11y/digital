import React from "react";

import { Link } from "react-router-dom";

import { ArrowRight, ArrowLeft, ShieldCheck, Store, Home } from "lucide-react";

import { ParticleBackground } from "./components/ParticleBackground";

import { Swirling } from "@/components/swirling";

import { useShopRegisterForm } from "./hooks/useShopRegisterForm";

import { AccountSetupStep } from "./components/AccountSetupStep";

import { ShopIdentityStep } from "./components/ShopIdentityStep";

import { useTranslation } from "react-i18next";

import LanguageToggle from "@/components/LanguageToggle";

const GlobalRegister = () => {
  const { t } = useTranslation();

  const {
    form,
    currentStep,
    steps,
    nextStep,
    prevStep,
    onSubmit,
    isLoading,
  } = useShopRegisterForm(t);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5f013b] relative overflow-hidden py-8">
      <ParticleBackground />
      <div className="w-full max-w-md px-4 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-white p-5 pb-2 text-center relative overflow-visible sm:overflow-hidden">
            {/* Top Navigation Controls */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-50">
              <Link
                to="/"
                className="flex items-center justify-center w-8 h-8 bg-gray-50 border border-gray-200 rounded-full text-gray-500 hover:text-pink-950 hover:bg-gray-100 hover:scale-105 transition-all shadow-sm"
                title={t("auth.backToHome") || "Home"}
              >
                <Home size={16} />
              </Link>
              <div className="[&_div.bg-white\/10]:!bg-gray-50 [&_div.bg-white\/10]:!border-gray-200 [&_div.text-white]:!text-gray-500 [&_div.bg-white]:!bg-white [&_div.bg-white]:!text-pink-950 [&_div.bg-white]:!shadow-sm">
                <LanguageToggle className="scale-90 origin-top-right" />
              </div>
            </div>

            <div className="w-14 h-14 bg-white rounded-xl mx-auto flex items-center justify-center border border-gray-100 shadow-sm mb-2 overflow-hidden transition-transform hover:scale-105 duration-300">
              <img
                src="/images/chomnenh.png"
                alt="Chomnenh Logo"
                className="rounded-xl object-contain w-full h-full drop-shadow-sm"
              />
            </div>

            <h2 className="text-xl font-bold text-pink-950 mb-0.5">
              CHOMNENH <span className="text-[#eab308]">DIGITAL</span>
            </h2>

            <p className="text-gray-500 text-xs font-medium">
              {t("auth.createNewShop")}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 px-6 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-pink-900">
                {t("auth.step")} {currentStep} {t("auth.of")} {steps.length}
              </span>

              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                {steps[currentStep - 1].name}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-pink-900 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <div className="p-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div>
                {currentStep === 1 && (
                  <AccountSetupStep
                    register={register}
                    errors={errors}
                  />
                )}

                {currentStep === 2 && (
                  <ShopIdentityStep
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <ArrowLeft size={16} />
                    {t("auth.back")}
                  </button>
                )}

                <button
                  type={currentStep === steps.length ? "submit" : "button"}
                  onClick={
                    currentStep === steps.length
                      ? undefined
                      : nextStep
                  }
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 bg-[#88004d] hover:bg-[#66013f] text-white font-semibold rounded-lg shadow-md shadow-[#c026d3]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-sm active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Swirling className="size-5" />
                      {t("auth.processing")}
                    </span>
                  ) : currentStep === steps.length ? (
                    <>
                      {t("auth.createShop")}
                      <ShieldCheck
                        size={16}
                        className="text-white/80"
                      />
                    </>
                  ) : (
                    <>
                      {t("auth.next")}
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Link to login */}
            <div className="text-center m-1">
              <span className="text-xs text-gray-600">
                {t("auth.alreadyHaveShop")}
              </span>{" "}
              <Link
                to="/admin"
                className="text-xs font-semibold text-pink-900 hover:text-pink-950"
              >
                {t("auth.signIn")}
              </Link>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-400">
              <ShieldCheck size={13} />
              <span>{t("auth.secureConnection")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalRegister;