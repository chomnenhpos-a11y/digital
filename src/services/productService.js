import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export const productService = {

  getProducts: async (params = {}, config = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.PRODUCTS.GET_ALL, { params, ...config });
      return response.data;
    } catch (error) {
      if (error.message !== 'canceled' && error.name !== 'CanceledError') {
        console.error('Product API Error [getProducts]:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
      return response.data;
    } catch (error) {
      console.error('Product API Error [createProduct]:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // updateProduct
  updateProduct: async (id, productData) => {
    try {
      const response = await axiosClient.put(
        API_ENDPOINTS.PRODUCTS.UPDATE(id),
        productData
      );
      return response.data;
    } catch (error) {
      console.error('Product API Error [updateProduct]:', {
        status: error.response?.status,
        data: JSON.stringify(error.response?.data),
        message: error.message,
      });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await axiosClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Product API Error [deleteProduct]:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
