import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export const slideService = {
  getSlides: async (params = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.SLIDES.GET_ALL, { params });
      return response.data;
    } catch (error) {
      console.error('Slide API Error [getSlides]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateSlide: async (id, slideData) => {
    try {
      const response = await axiosClient.put(
        API_ENDPOINTS.SLIDES.UPDATE(id),
        slideData
      );
      return response.data;
    } catch (error) {
      console.error('Slide API Error [updateSlide]:', {
        status: error.response?.status,
        data:   JSON.stringify(error.response?.data),
        message: error.message,
      });
      throw error;
    }
  },

  createSlide: async (slideData) => {
    try {
      const response = await axiosClient.post(
        API_ENDPOINTS.SLIDES.CREATE,
        slideData
      );
      return response.data;
    } catch (error) {
      console.error('Slide API Error [createSlide]:', {
        status: error.response?.status,
        data:   JSON.stringify(error.response?.data),
        message: error.message,
      });
      throw error;
    }
  }
};
