import axiosClient from "../api/axiosClient";
import publicAxiosClient from "../api/publicAxiosClient";
import { API_ENDPOINTS } from "../api/endpoints";

export const settingService = {
  getSettings: async (config = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.SETTINGS.GET_ALL, config);
      return response.data;
    } catch (error) {
      console.error("Setting API Error [getSettings]:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  getByShopCode: async (shopCode, config = {}) => {
    const { signal, ...restConfig } = config;
    try {
      // Use public client — no auth token needed for public shop settings
      const response = await publicAxiosClient.get(API_ENDPOINTS.SETTINGS.GET_ALL, {
        params: { shop_code: shopCode },
        signal,
        ...restConfig,
      });
      return response.data;
    } catch (error) {
      // Silently ignore React Query AbortController cancellations
      if (error?.name === 'AbortError' || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        throw error;
      }
      console.error("Setting API Error [getByShopCode]:",
        error.response?.status,
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // ADMIN ONLY — uses authenticated client with ?id= param
  getSettingById: async (id, config = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.SETTINGS.GET_ALL, {
        params: { id: id },
        ...config
      });
      return response.data;
    } catch (error) {
      console.error("Setting API Error [getSettingById]:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // updateSetting: async (id, settingData) => {
  //   try {
  //     let response;
  //     if (settingData instanceof FormData) {
  //       if (!settingData.has('id')) {
  //         settingData.append('id', id);
  //       }
  //       settingData.append('_method', 'PUT');
  //       // Laravel requires POST for multipart/form-data to parse files properly, but user explicitly asked to use PUT
  //       response = await axiosClient.put(
  //         API_ENDPOINTS.SETTINGS.UPDATE,
  //         settingData,
  //         {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //         }
  //       );
  //     } else {
  //       settingData.id = id;
  //       response = await axiosClient.put(
  //         API_ENDPOINTS.SETTINGS.UPDATE,
  //         settingData
  //       );
  //     }
  //     return response.data;
  //   } catch (error) {
  //     console.error('Setting API Error [updateSetting]:', {
  //       status: error.response?.status,
  //       data: JSON.stringify(error.response?.data),
  //       message: error.message,
  //     });
  //     throw error;
  //   }
  // },
  updateSetting: async (id, settingData) => {
    try {
      let response;

      if (settingData instanceof FormData) {
        console.log("=== UPDATE SETTING ===");
        console.log("ID:", id);

        for (const [key, value] of settingData.entries()) {
          console.log(
            key,
            value instanceof File
              ? {
                  name: value.name,
                  type: value.type,
                  size: value.size,
                }
              : value,
          );
        }

        response = await axiosClient.put(
          API_ENDPOINTS.SETTINGS.UPDATE(id),
          settingData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axiosClient.put(
          API_ENDPOINTS.SETTINGS.UPDATE(id),
          settingData,
        );
      }

      return response.data;
    } catch (error) {
      console.error("Setting API Error [updateSetting]:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      throw error;
    }
  },
  createSetting: async (settingData) => {
    try {
      let response;

      if (settingData instanceof FormData) {
        console.log("=== CREATE SETTING ===");
        for (const [key, value] of settingData.entries()) {
          console.log(
            key,
            value instanceof File
              ? {
                  name: value.name,
                  type: value.type,
                  size: value.size,
                }
              : value,
          );
        }

        response = await axiosClient.post(
          API_ENDPOINTS.SETTINGS.CREATE,
          settingData,
        );
      } else {
        response = await axiosClient.post(
          API_ENDPOINTS.SETTINGS.CREATE,
          settingData,
        );
      }

      console.log("Setting API Response [createSetting]:", response.data);
      return response.data;
    } catch (error) {
      console.error("Setting API Error [createSetting]:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
