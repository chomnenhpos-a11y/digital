import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export const categoryService = {
  getCategories: async (params = {}, config = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.CATEGORIES.GET_ALL, { params, ...config });
      return response.data;
    } catch (error) {
      if (error.message !== 'canceled' && error.name !== 'CanceledError') {
        console.error('Category API Error [getCategories]:', {
          status: error.response?.status,
          data:   error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData);
      return response.data;
    } catch (error) {
      console.error('Category API Error [createCategory]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await axiosClient.put(
        API_ENDPOINTS.CATEGORIES.UPDATE(id),
        categoryData
      );
      return response.data;
    } catch (error) {
      console.error('Category API Error [updateCategory]:', {
        status: error.response?.status,
        data:   JSON.stringify(error.response?.data),
        message: error.message,
      });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await axiosClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Category API Error [deleteCategory]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
