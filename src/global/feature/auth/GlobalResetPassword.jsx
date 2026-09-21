import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck, Home } from "lucide-react";
import useResetPassword from "./hooks/useResetPassword";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import { ParticleBackground } from "./components/ParticleBackground";

export default function GlobalResetPassword() {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    errors,
    loading,
    isPasswordReset,
    error,
    resetPassword,
  } = useResetPassword(token);

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

              <div className="[&_div.bg-white\\/10]:!bg-gray-50 [&_div.bg-white\\/10]:!border-gray-200 [&_div.text-white]:!text-gray-500 [&_div.bg-white]:!bg-white [&_div.bg-white]:!text-pink-950 [&_div.bg-white]:!shadow-sm">
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
              {t("auth.securePasswordUpdate", "Secure Password Update")}
            </p>
          </div>

          <div className="p-7">
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-800 mb-1">
                {t("auth.createNewPassword", "Create New Password")}
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed">
                {t(
                  "auth.newPasswordDescription",
                  "Your new password must be different from any of your previous passwords."
                )}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(resetPassword)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  {t("auth.newPassword", "New Password")}
                </label>

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-900 transition-colors">
                    <Lock size={16} />
                  </span>

                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("newPassword")}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-900/20 focus:border-pink-900 outline-none transition-all text-sm text-pink-950 placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-900 transition-colors p-1"
                    aria-label={
                      showNewPassword
                        ? t("auth.hidePassword", "Hide password")
                        : t("auth.showPassword", "Show password")
                    }
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  {t("auth.confirmPassword", "Confirm Password")}
                </label>

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-900 transition-colors">
                    <Lock size={16} />
                  </span>

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-900/20 focus:border-pink-900 outline-none transition-all text-sm text-pink-950 placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-900 transition-colors p-1"
                    aria-label={
                      showConfirmPassword
                        ? t("auth.hidePassword", "Hide password")
                        : t("auth.showPassword", "Show password")
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-[#88004d] hover:bg-[#66013f] text-white font-medium py-3 rounded-xl shadow-md shadow-[#c026d3]/20 transition-all flex items-center justify-center gap-2 group text-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("auth.resetting", "Resetting...")
                  : t("auth.resetPassword", "Reset Password")}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-gray-500">
              {t("auth.rememberPassword", "Remember Password?")}{" "}
              <Link
                to="/login"
                className="font-semibold text-pink-900 hover:text-pink-950 hover:underline"
              >
                {t("auth.login", "Login")}
              </Link>
            </div>

            <div className="border-t mt-4 pt-3 border-gray-100 space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-600">
                <ShieldCheck size={14} />
                <span>
                  {t(
                    "auth.secureConnection256",
                    "256-bit Secure Connection"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
