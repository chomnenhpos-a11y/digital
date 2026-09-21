import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import { profileSchema } from "../schemas/profileSchema";
import { useAdminAuth } from "../../../../context/AdminAuthContext";
import {
  useUpdateUserMutation,
  useUsersListQuery,
} from "../../../../queries/users/useUserQueries";

// =========================================================
// useProfileSetting
// =========================================================
export function useProfileSetting() {
  const { t } = useTranslation();
  const { user: authUser } = useAdminAuth();

  const { data: allUsers, isLoading } = useUsersListQuery();

  // Find the detailed user record that matches the authenticated user
  const fullUserDetail = allUsers?.find((u) => u.id === authUser?.id || u.email === authUser?.email);
  const userId = fullUserDetail?.id || authUser?.id;

  const updateMutation = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: authUser?.email || "",
    },
  });

  // Sync form with the resolved user data
  useEffect(() => {
    if (fullUserDetail || authUser) {
      reset({
        name: fullUserDetail?.name || authUser?.name || "",
        email: fullUserDetail?.email || authUser?.email || "",
      });
    }
  }, [fullUserDetail, authUser, reset]);

  // Form submit
  const onSubmit = (data) => {
    if (!userId) return;

    const payload = {
      name: data.name,
      email: data.email,
    };

    updateMutation.mutate(
      { id: userId, data: payload },
      {
        onSuccess: () => {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const userObj = JSON.parse(storedUser);
              userObj.name = payload.name;
              userObj.email = payload.email;
              localStorage.setItem("user", JSON.stringify(userObj));
            } catch (e) {
              console.error(e);
            }
          }
          
          Swal.fire({
            icon: "success",
            title: t("common.success", "Success"),
            text: t("settings.profileUpdateSuccess", "Profile updated successfully."),
            timer: 1500,
            showConfirmButton: false,
          });
        },
        onError: (error) => {
          console.error(error);
          const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || t("settings.profileUpdateFailed", "Failed to update profile.");
          Swal.fire({
            icon: "error",
            title: t("common.error", "Error"),
            text: errorMsg,
          });
        },
      }
    );
  };

  // Derived display values
  const displayName =
    fullUserDetail?.name || authUser?.name || authUser?.email || "A";
  const displayRole = fullUserDetail?.role || authUser?.role || "Admin";

  return {
    isLoading,
    isSaving: updateMutation.isPending,
    register,
    handleSubmit,
    reset,
    errors,
    onSubmit,
    displayName,
    displayRole,
  };
}
