import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/validations/auth.schema";
import Swal from "sweetalert2";
import { API_ENDPOINTS } from "@/api/endpoints";
import axiosClient from "@/api/axiosClient";
import { useNavigate } from "react-router-dom";
const IS_DEV = import.meta.env.DEV;

export default function useResetPassword(token) {
  const [loading, setLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPassword = useCallback(
    async (data) => {
      if (!token) {
        const message =
          "Token is missing. Please check the reset password link.";

        setError(message);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          confirmButtonColor: "#831843",
        });

        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Build the request payload matching the backend API contract:
        // POST /api/settings/reset-password expects: { token, newPassword, confirmPassword }
        const payload = {
          token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        };

        // Safe debug log: redact all sensitive values in production
        if (IS_DEV) {
          console.debug("[useResetPassword] Request payload (sanitized):", {
            token: token ? `${token.slice(0, 6)}…[REDACTED]` : null,
            newPassword: "[REDACTED]",
            confirmPassword: "[REDACTED]",
            endpoint: API_ENDPOINTS.SETTINGS.RESET_PASSWORD,
          });
        }

        await axiosClient.post(API_ENDPOINTS.SETTINGS.RESET_PASSWORD, payload);

        setIsPasswordReset(true);

        reset();

        const result = await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your password has been reset successfully.",
          confirmButtonColor: "#831843",
        });
        if (result.isConfirmed) {
            navigate("/login");
        }
      } catch (err) {
        console.error(
          "Error occurred while resetting password:",
          err?.response?.status,
          err?.response?.data,
        );

        // Backend returns { success: false, error: "..." } on 400 errors.
        // Fall back to a generic message if the backend provides none.
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "An error occurred while resetting your password. Please try again.";

        setError(message);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          confirmButtonColor: "#831843",
        });
      } finally {
        setLoading(false);
      }
    },
    [token, reset, navigate],
  );

  return {
    register,
    handleSubmit,
    errors,
    loading,
    isPasswordReset,
    error,
    resetPassword,
  };
}
