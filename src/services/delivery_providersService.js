import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export const deliveryProvidersService = {
  getDeliveryProviders: async (params = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.DELIVERY_PROVIDERS.GET_ALL, { params });
      return response.data;
    } catch (error) {
      console.error('Delivery Provider API Error [getDeliveryProviders]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  createDeliveryProvider: async (data) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.DELIVERY_PROVIDERS.CREATE, data);
      return response.data;
    } catch (error) {
      console.error('Delivery Provider API Error [createDeliveryProvider]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateDeliveryProvider: async (id, data) => {
    try {
      const response = await axiosClient.put(API_ENDPOINTS.DELIVERY_PROVIDERS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      console.error('Delivery Provider API Error [updateDeliveryProvider]:', {
        status: error.response?.status,
        data:   JSON.stringify(error.response?.data),
        message: error.message,
      });
      throw error;
    }
  },

  deleteDeliveryProvider: async (id) => {
    try {
      const response = await axiosClient.delete(API_ENDPOINTS.DELIVERY_PROVIDERS.DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Delivery Provider API Error [deleteDeliveryProvider]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
