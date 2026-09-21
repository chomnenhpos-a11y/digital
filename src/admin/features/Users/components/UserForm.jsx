import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../schemas/userSchema";

export default function UserForm({ onSubmit, initialData }) {
  const { t } = useTranslation();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "User",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    reset({
      name: initialData?.name || "",
      email: initialData?.email,
      role: initialData?.role || "User",
      password: "",
      confirmPassword: "",
    });
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5"
    >
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {t('users.name')} <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          {...register("name")}
          placeholder={t('users.namePlaceholder')}
          className={`w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 ${
            errors.name
              ? "ring-2 ring-red-400 focus:ring-red-500"
              : "focus:ring-gray-200"
          }`}
        />

        {errors.name && (
          <p className="mt-1 text-xs text-red-500">
            {errors.name?.message ? t(errors.name.message) : ""}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t('users.email')} <span className="text-red-500">*</span>
          </label>

          <input
            type="email"
            {...register("email")}
            placeholder={t('users.emailPlaceholder')}
            className={`w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 ${
              errors.email
                ? "ring-2 ring-red-400 focus:ring-red-500"
                : "focus:ring-gray-200"
            }`}
          />

          {errors.email && (
            <p className="mt-1 text-xs text-red-500">
              {errors.email?.message ? t(errors.email.message) : ""}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {t('users.role')} <span className="text-red-500">*</span>
          </label>

          <select
            {...register("role")}
            className={`w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 ${
              errors.role
                ? "ring-2 ring-red-400 focus:ring-red-500"
                : "focus:ring-gray-200"
            }`}
          >
            <option value="Admin">{t('users.adminRoleLabel')}</option>
            <option value="User">{t('users.userRoleLabel')}</option>
          </select>

          {errors.role && (
            <p className="mt-1 text-xs text-red-500">
              {errors.role?.message ? t(errors.role.message) : ""}
            </p>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {t('users.password')} <span className="text-red-500">*</span>
            </label>

            <input
              type="password"
              {...register("password")}
              placeholder={t('users.passwordPlaceholder')}
              className={`w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 ${
                errors.password
                  ? "ring-2 ring-red-400 focus:ring-red-500"
                  : "focus:ring-gray-200"
              }`}
            />

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password?.message ? t(errors.password.message) : ""}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {t('users.confirmPassword')}{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="password"
              {...register("confirmPassword")}
              placeholder={t('users.confirmPasswordPlaceholder')}
              className={`w-full px-3 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "ring-2 ring-red-400 focus:ring-red-500"
                  : "focus:ring-gray-200"
              }`}
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword?.message ? t(errors.confirmPassword.message) : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-[#9d1159] text-white hover:bg-[#9d1159] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />

          {isSubmitting
            ? t('common.saving')
            : isEditing
              ? t('users.updateUserBtn')
              : t('users.saveUserBtn')}
        </button>
      </div>
    </form>
  );
}