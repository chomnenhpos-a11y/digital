import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSettingMutation } from "../../../../queries/settings/useSettingQueries";
import {
  accountSetupSchema,
  shopIdentitySchema,
} from "../../../../validations/shopRegister.schema";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { shopRegisterSchema } from "../../../../validations/shopRegister.schema";
import { useTranslation } from "react-i18next";

export const useShopRegisterForm = (t) => {
  const { i18n } = useTranslation();
  const steps = [
    { id: 1, name: t("auth.accountSetup") || "Account Setup", schema: accountSetupSchema(t) },
    { id: 2, name: t("auth.shopIdentity") || "Shop Identity", schema: shopIdentitySchema(t) },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const createSettingMutation = useCreateSettingMutation();
  const form = useForm({
    resolver: zodResolver(shopRegisterSchema(t)),
    shouldUnregister: false,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      shop_name: "",
      phone: "",
      address: "",
      logo: undefined,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      form.trigger();
    }
  }, [i18n.language]);

  const nextStep = async () => {
    let fields = [];

    if (currentStep === 1) {
      fields = ["name", "email", "password"];
    }

    if (currentStep === 2) {
      fields = ["shop_name", "phone", "address", "logo"];
    }
    const isStepValid = await form.trigger(fields);
    if (!isStepValid) {
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data) => {
    if (currentStep !== steps.length) {
      return nextStep();
    }

    const formData = new FormData();

    // Append Account Setup
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    // Append Shop Identity
    formData.append("shop_name", data.shop_name);
    formData.append("phone", data.phone);
    formData.append("address", data.address || "");

    if (data.logo && data.logo.length > 0) {
      formData.append("logo", data.logo[0]);
    }

    try {
      await createSettingMutation.mutateAsync(formData);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "ជោគជ័យ",
        text: "គណនីត្រូវបានបង្កើតដោយជោគជ័យ",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("Register API Error:", error);

      let errorMessage = "ការបង្កើតគណនីបរាជ័យ (Registration Failed)";

      if (!error.response) {
        errorMessage = "មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ (Network Error/CORS)";
      } else {
        const resData = error.response.data;
        console.error("Raw Error Data:", resData);
        if (typeof resData?.message === 'string') {
          errorMessage = resData.message;
        } else if (typeof resData?.error === 'string') {
          errorMessage = resData.error;
        } else if (resData?.errors) {
          errorMessage = Object.values(resData.errors).flat().join('\\n');
        } else if (typeof resData === 'string') {
          errorMessage = resData;
        } else if (resData) {
          errorMessage = JSON.stringify(resData);
        }
      }

      Swal.fire({
        icon: "error",
        title: "បរាជ័យ",
        text: errorMessage,
        confirmButtonColor: "#2563eb",
      });
    }
  };

  return {
    form,
    currentStep,
    steps,
    nextStep,
    prevStep,
    onSubmit,
    isLoading: createSettingMutation.isPending,
  };
};
