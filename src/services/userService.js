import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export const userService = {
  getUsers: async (params = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.USERS.GET_ALL, { params });
      return response.data;
    } catch (error) {
      console.error('User API Error [getUsers]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },


  // For user detail info 
  getUser: async (id) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.USERS.DETAIL(id));
      return response.data;
      console.log('User API Response [getUser]:', response.data);
    } catch (error) {
      console.error('User API Error [getUser]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axiosClient.put(
        API_ENDPOINTS.USERS.UPDATE(id),
        userData
      );
      return response.data;
    } catch (error) {
      console.error('User API Error [updateUser]:', {
        status: error.response?.status,
        data:   JSON.stringify(error.response?.data),
        message: error.message,
      });
      throw error;
    }
  },

  registerUser: async (userData) => {
    try {
      const response = await axiosClient.post(
        API_ENDPOINTS.USERS.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      console.error('User API Error [registerUser]:', {
        status: error.response?.status,
        data:   JSON.stringify(error.response?.data),
        message: error.message,
      });
      throw error;
    }
  }
};
