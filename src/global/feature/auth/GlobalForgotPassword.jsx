
import React, { useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  ShieldCheck,
  Mail,
  RefreshCcw,
  CheckCircle2,
  Home,
} from "lucide-react";

import { ParticleBackground } from "./components/ParticleBackground";
import { Swirling } from "@/components/swirling";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import useForgotPassword from "./hooks/useForgotPassword";

const GlobalForgotPassword = () => {
  const { t } = useTranslation();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    errors,
    loading,
    onSubmit,
  } = useForgotPassword(t);

  const handleFormSubmit = async (data) => {
    const result = await onSubmit(data);

    if (result !== false) {
      setEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5f013b] relative overflow-hidden py-6 px-4">
      <ParticleBackground />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="bg-white p-6 pb-2 text-center relative overflow-visible sm:overflow-hidden">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50">
              <Link
                to="/"
                className="flex items-center justify-center w-8 h-8 bg-gray-50 border border-gray-200 rounded-full text-gray-500 hover:text-pink-950 hover:bg-gray-100 hover:scale-105 transition-all shadow-sm"
                title={t("auth.backToHome", "Home")}
              >
                <Home size={16} />
              </Link>

              <div className="[&_div.bg-white\/10]:!bg-gray-50 [&_div.bg-white\/10]:!border-gray-200 [&_div.text-white]:!text-gray-500 [&_div.bg-white]:!bg-white [&_div.bg-white]:!text-pink-950 [&_div.bg-white]:!shadow-sm">
                <LanguageToggle className="scale-90 origin-top-right" />
              </div>
            </div>

            <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center border border-gray-100 shadow-sm mb-3 overflow-hidden transition-transform hover:scale-105 duration-300">
              <img
                src="/images/chomnenh.png"
                alt="Chomnenh Logo"
                className="rounded-xl object-contain w-full h-full drop-shadow-sm"
              />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-pink-950 mb-1">
              CHOMNENH <span className="text-[#eab308]">DIGITAL</span>
            </h2>

            <p className="text-gray-500 text-xs font-medium tracking-wide">
              {t("auth.passwordRecovery", "Password Recovery")}
            </p>
          </div>

          <div className="p-7">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  {t("auth.emailAddress", "Email Address")}
                </label>

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-900 transition-colors">
                    <Mail size={16} />
                  </span>

                  <input
                    {...register("email")}
                    placeholder="admin@chomnenh.com"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-900/20 focus:border-pink-900 outline-none transition-all text-sm text-pink-950 placeholder:text-gray-400"
                  />

                  {emailSent && (
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-green-500">
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                </div>

                {errors.email && (
                  <span className="text-xs text-red-500 mt-1 block font-medium">
                    {errors.email.message}
                  </span>
                )}

                {emailSent && !errors.email && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 font-medium">
                    <CheckCircle2 size={13} />
                    <span>
                      {t("auth.emailSentSuccessfully", "Reset link sent successfully")}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-3 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed ${emailSent
                    ? "bg-pink-50 border border-pink-200 text-pink-900 hover:bg-pink-900 hover:text-white"
                    : "bg-[#88004d] hover:bg-[#66013f] text-white shadow-md shadow-[#c026d3]/20"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Swirling className="size-5 text-current animate-spin" />
                    <span>
                      {t("auth.sending", "Sending...")}
                    </span>
                  </span>
                ) : emailSent ? (
                  <>
                    <RefreshCcw size={16} />
                    <span>
                      {t("auth.resendEmail", "Resend Email")}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {t("auth.sendEmail", "Send Email")}
                    </span>

                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-gray-500">
              {t("auth.rememberPassword", "Remember Password?")}{" "}
              <Link
                to="/login"
                className="font-semibold text-pink-900 hover:text-pink-950 hover:underline"
              >
                {t("auth.signIn", "Login")}
              </Link>
            </div>

            <div className="border-t mt-4 pt-3 border-gray-100">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-600">
                <ShieldCheck size={14} />
                <span>{t("auth.secureConnection256")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalForgotPassword;
