
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  Home,
} from "lucide-react";
import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { useAuth } from "@/hooks/useAuth";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validations/auth.schema";
import { ParticleBackground } from "./components/ParticleBackground";
import { Swirling } from "@/components/swirling";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";

const GlobalLogin = () => {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, token, isInitializing } = useAuth();

  useEffect(() => {
    if (!isInitializing && token) {
      navigate("/admin");
    }
  }, [token, isInitializing, navigate]);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      trigger();
    }
  }, [i18n.language]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axiosClient.post(API_ENDPOINTS.USERS.LOGIN, {
        email: data.email,
        password: data.password,
      });

      const token = response.data?.token || response.data?.access_token;

      if (token) {
        login(
          token,
          response.data?.data ||
          response.data?.user || {
            email: data.email,
          },
        );

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          text: t("auth.loginSuccess"),
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          navigate("/admin");
        });
      }
    } catch (error) {
      console.error("Login API Error:", error);

      let errorMessage = t("auth.loginFailed");

      if (!error.response) {
        errorMessage = t("auth.networkError");
      } else {
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          errorMessage;
      }

      Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: errorMessage,
        confirmButtonColor: "#831843",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5f013b] relative overflow-hidden py-6 px-4">
      <ParticleBackground />
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white  rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-white p-6 pb-2 text-center relative overflow-visible sm:overflow-hidden">
            {/* Top Navigation Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50">
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

            <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center border border-gray-100 shadow-sm mb-3 overflow-hidden transition-transform hover:scale-105 duration-300">
              <img
                src="/images/chomnenh.png"
                alt="Chomnenh Logo"
                className="w-full h-full rounded-xl object-contain drop-shadow-sm"
              />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-pink-950 mb-1">
              CHOMNENH <span className="text-[#eab308]">DIGITAL</span>
            </h2>

            <p className="text-gray-500 text-xs font-medium tracking-wide">
              {t("auth.loginDashboard")}
            </p>
          </div>

          {/* Form Section */}
          <div className="p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  {t("auth.usernameOrEmail")}
                </label>

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-900 transition-colors">
                    <Mail size={16} />
                  </span>

                  <input
                    {...register("email")}
                    placeholder="admin@chomnenh.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-900/20 focus:border-pink-900 outline-none transition-all text-sm text-pink-950 placeholder:text-gray-400"
                  />
                </div>

                {errors.email && (
                  <span className="text-xs text-red-500 mt-1 block font-medium">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {t("auth.password")}
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-pink-900 hover:text-pink-950 transition-colors"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-900 transition-colors">
                    <Lock size={16} />
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-900/20 focus:border-pink-900 outline-none transition-all text-sm text-pink-950 placeholder:text-gray-400 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-900 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <span className="text-xs text-red-500 mt-1 block font-medium">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-[#88004d] hover:bg-[#66013f] text-white font-medium py-3 rounded-xl shadow-md shadow-[#c026d3]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-sm active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Swirling className="size-5 text-white animate-spin" />
                  </span>
                ) : (
                  <>
                    <span>{t("auth.signIn")}</span>

                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Alternative */}
            <div className="mt-5 text-center text-xs text-gray-500">
              {t("auth.noAccount")}{" "}
              <Link
                to="/register"
                className="font-semibold text-pink-900 hover:text-pink-950 hover:underline"
              >
                {t("auth.signUp")}
              </Link>
            </div>

            {/* Footer Elements */}
            <div className="border-t mt-4 border-gray-300 space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] mt-4 font-medium text-slate-600">
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

export default GlobalLogin;
