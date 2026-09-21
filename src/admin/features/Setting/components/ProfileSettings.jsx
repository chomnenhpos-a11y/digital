import React from "react";
import { User, ShieldAlert, ShieldCheck, Mail } from "lucide-react";
import Button from "../../../components/common/Button";
import { useProfileSetting } from "../hooks/useProfileSetting";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function ProfileSettings() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const {
    isLoading,
    isSaving,
    register,
    handleSubmit,
    reset,
    errors,
    onSubmit,
    displayName,
    displayRole,
  } = useProfileSetting();

  if (isLoading) {
    return (
      <div className="w-full animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 rounded-lg w-48"></div>
        <div className="h-[400px] bg-white border border-slate-100 shadow-sm rounded-2xl"></div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-6 animate-in fade-in duration-500"
    >
      {/* Header Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('settings.profile')}</h3>
        <p className="text-sm text-slate-500 mt-1">
          {t('settings.profileDescription')}
        </p>
      </div>

      {/* Full Width Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          
          {/* Top Profile Summary */}
          <div className="flex items-center gap-5 border-b border-slate-100 pb-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#870d4c] to-indigo-500 shadow-sm flex items-center justify-center overflow-hidden shrink-0 text-white text-2xl font-bold uppercase">
              {displayName.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">{displayName || "User"}</h4>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="font-medium">{displayRole}</span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid - Smart usage of full width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('settings.name')} <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center w-full bg-slate-50/50 border rounded-xl overflow-hidden focus-within:border-[#870d4c] focus-within:ring-1 focus-within:ring-[#870d4c]/30 transition-all ${errors.name ? "border-red-500" : "border-slate-200"}`}>
                <div className="pl-3.5 pr-2 py-2.5 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t('settings.namePlaceholder')}
                  className="w-full pr-4 py-2.5 bg-transparent text-sm focus:outline-none text-slate-800"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('settings.email')} <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center w-full bg-slate-50/50 border rounded-xl overflow-hidden focus-within:border-[#870d4c] focus-within:ring-1 focus-within:ring-[#870d4c]/30 transition-all ${errors.email ? "border-red-500" : "border-slate-200"}`}>
                <div className="pl-3.5 pr-2 py-2.5 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder={t('settings.emailPlaceholder')}
                  className="w-full pr-4 py-2.5 bg-transparent text-sm focus:outline-none text-slate-800"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Role Info Box - Spans both columns */}
            <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
              <ShieldAlert size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Account Role: {displayRole}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('settings.roleCannotChange')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50/50 border-t border-slate-100 gap-3">
          <Button 
            variant="outline" 
            type="button" 
            className="px-5 py-2 text-sm rounded-xl font-medium" 
            onClick={() => reset()}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            className="px-6 py-2 text-sm rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-70" 
            disabled={isSaving}
          >
            {isSaving ? t('common.saving') : t('settings.saveProfile')}
          </Button>
        </div>
      </div>
    </form>
  );
}