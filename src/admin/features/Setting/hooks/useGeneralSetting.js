import { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { settingSchema } from "../schemas/settingSchema";
import {
  useSettingsQuery,
  useUpdateSettingMutation,
} from "@/queries/settings/useSettingQueries";

const MAX_IMAGE_SIZE = 1024 * 1024;
const MAX_SUPPORT_SIZE = 5 * 1024 * 1024;

const getFileUrl = (file) => {
  if (!file || typeof file !== "string") {
    return "";
  }

  if (
    file.startsWith("http://") ||
    file.startsWith("https://")
  ) {
    return file;
  }

  const baseUrl =
    import.meta.env.VITE_API_URL?.replace(
      /\/$/,
      ""
    ) || "";

  return `${baseUrl}${
    file.startsWith("/") ? "" : "/"
  }${file}`;
};

const getFileName = (file) => {
  if (!file || typeof file !== "string") {
    return "";
  }

  return file.split("/").pop() || "";
};

const parseSocialMedia = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const useGeneralSetting = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const shopCode = user?.shop?.code;

  const {
    data: settingData,
    isLoading,
    isFetching,
    refetch,
  } = useSettingsQuery(shopCode);

  const updateSettingMutation =
    useUpdateSettingMutation(shopCode);

  const [logoPreview, setLogoPreview] =
    useState("");

  const [qrPreview, setQrPreview] =
    useState("");

  const [qrFileName, setQrFileName] =
    useState("");

  const [supportFileName, setSupportFileName] =
    useState("");

  const {
    register,
    control,
    reset,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      shop_name: "",
      shop_code: "",
      logo: "",
      phone: "",
      chat_id: "",
      support: "",
      bio_shop: "",
      qr_upload: "",
      social_media: [],
      address: "",
    },
  });

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "social_media",
  });

  useEffect(() => {
    if (!settingData) {
      return;
    }

    reset({
      shop_name:
        settingData?.shop_name || "",

      shop_code:
        settingData?.shop_code || "",

      logo:
        settingData?.logo || "",

      phone:
        settingData?.phone || "",

      chat_id:
        settingData?.chat_id || "",

      support:
        settingData?.support || "",

      bio_shop:
        settingData?.bio_shop || "",

      qr_upload:
        settingData?.qr_upload || "",

      social_media: parseSocialMedia(
        settingData?.social_media
      ),

      address:
        settingData?.address || "",
    });

    setLogoPreview(
      getFileUrl(settingData?.logo)
    );

    setQrPreview(
      getFileUrl(settingData?.qr_upload)
    );

    setQrFileName(
      getFileName(settingData?.qr_upload)
    );

    setSupportFileName(
      getFileName(settingData?.support)
    );
  }, [settingData, reset]);

  const validateImage = (file) => {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: t(
          "common.error",
          "Error"
        ),
        text: t(
          "settings.invalidImageType",
          "Only PNG, JPG and WEBP images are allowed."
        ),
      });

      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      Swal.fire({
        icon: "error",
        title: t(
          "common.error",
          "Error"
        ),
        text: t(
          "settings.imageTooLarge",
          "Image size must be less than 1MB."
        ),
      });

      return false;
    }

    return true;
  };

  const validateSupportFile = (file) => {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: t(
          "common.error",
          "Error"
        ),
        text: t(
          "settings.invalidSupportType",
          "Only PDF, DOC and DOCX files are allowed."
        ),
      });

      return false;
    }

    if (file.size > MAX_SUPPORT_SIZE) {
      Swal.fire({
        icon: "error",
        title: t(
          "common.error",
          "Error"
        ),
        text: t(
          "settings.supportTooLarge",
          "Support document must be less than 5MB."
        ),
      });

      return false;
    }

    return true;
  };

  const handleLogoChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImage(file)) {
      event.target.value = "";
      return;
    }

    setValue("logo", file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const previewUrl =
      URL.createObjectURL(file);

    setLogoPreview((previous) => {
      if (
        previous &&
        previous.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previous);
      }

      return previewUrl;
    });
  };

  const handleQrUploadChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImage(file)) {
      event.target.value = "";
      return;
    }

    setValue("qr_upload", file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const previewUrl =
      URL.createObjectURL(file);

    setQrPreview((previous) => {
      if (
        previous &&
        previous.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previous);
      }

      return previewUrl;
    });

    setQrFileName(file.name);
  };

  const handleSupportChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateSupportFile(file)) {
      event.target.value = "";
      return;
    }

    setValue("support", file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setSupportFileName(file.name);
  };

  const handleClearLogo = () => {
    setValue("logo", "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setLogoPreview("");

    const input =
      document.getElementById(
        "logo-upload"
      );

    if (input) {
      input.value = "";
    }
  };

  const handleClearQr = () => {
    setValue("qr_upload", "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setQrPreview("");

    setQrFileName("");

    const input =
      document.getElementById(
        "qr-upload"
      );

    if (input) {
      input.value = "";
    }
  };

  const handleClearSupport = () => {
    setValue("support", "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setSupportFileName("");

    const input =
      document.getElementById(
        "support-upload"
      );

    if (input) {
      input.value = "";
    }
  };

  const onSubmit = async (data) => {
    if (!shopCode) {
      Swal.fire({
        icon: "error",
        title: t(
          "common.error",
          "Error"
        ),
        text: t(
          "settings.shopNotFound",
          "Shop information was not found."
        ),
      });

      return;
    }

    try {
      const formData = new FormData();

      Object.entries(data).forEach(
        ([key, value]) => {
          if (key === "social_media") {
            formData.append(
              "social_media",
              JSON.stringify(
                Array.isArray(value)
                  ? value
                  : []
              )
            );

            return;
          }

          if (key === "logo") {
            if (value instanceof File || value === "") {
              formData.append(key, value);
            }
            return;
          }

          if (key === "qr_upload" || key === "support") {
            formData.append(key, value);
            return;
          }

          if (
            value !== undefined &&
            value !== null
          ) {
            formData.append(
              key,
              String(value)
            );
          }
        }
      );

      await updateSettingMutation.mutateAsync({
        id: settingData.id,
        data: formData
      });

      await refetch();

      Swal.fire({
        icon: "success",
        title: t(
          "common.success",
          "Success"
        ),
        text: t(
          "settings.updateSuccess",
          "Settings updated successfully."
        ),
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || t("settings.updateFailed", "Failed to update settings. Please try again.");
      Swal.fire({
        icon: "error",
        title: t(
          "common.error",
          "Error"
        ),
        text: errorMsg,
      });
    }
  };

  const handleCancel = () => {
    if (!settingData) {
      return;
    }

    reset({
      shop_name:
        settingData?.shop_name || "",

      shop_code:
        settingData?.shop_code || "",

      logo:
        settingData?.logo || "",

      phone:
        settingData?.phone || "",

      chat_id:
        settingData?.chat_id || "",

      support:
        settingData?.support || "",

      bio_shop:
        settingData?.bio_shop || "",

      qr_upload:
        settingData?.qr_upload || "",

      social_media: parseSocialMedia(
        settingData?.social_media
      ),

      address:
        settingData?.address || "",
    });

    setLogoPreview(
      getFileUrl(settingData?.logo)
    );

    setQrPreview(
      getFileUrl(
        settingData?.qr_upload
      )
    );

    setQrFileName(
      getFileName(
        settingData?.qr_upload
      )
    );

    setSupportFileName(
      getFileName(
        settingData?.support
      )
    );

    const logoInput =
      document.getElementById(
        "logo-upload"
      );

    const qrInput =
      document.getElementById(
        "qr-upload"
      );

    const supportInput =
      document.getElementById(
        "support-upload"
      );

    if (logoInput) {
      logoInput.value = "";
    }

    if (qrInput) {
      qrInput.value = "";
    }

    if (supportInput) {
      supportInput.value = "";
    }
  };

  return {
    register,
    control,
    errors,
    fields,
    append,
    remove,
    watch,
    handleSubmit,
    onSubmit,
    handleCancel,
    handleLogoChange,
    handleQrUploadChange,
    handleSupportChange,
    handleClearLogo,
    handleClearQr,
    handleClearSupport,
    logoPreview,
    qrPreview,
    qrFileName,
    supportFileName,
    settingData,
    isLoading,
    isFetching,
    isSubmitting:
      updateSettingMutation.isPending,
    setValue,
  };
};