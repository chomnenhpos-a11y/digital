import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export const orderService = {
  getOrders: async (params = {}, config = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.ORDERS.GET_ALL, { params, ...config });
      return response.data;
    } catch (error) {
      if (error.message !== 'canceled' && error.name !== 'CanceledError') {
        console.error('Order API Error [getOrders]:', {
          status: error.response?.status,
          data:   error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  },

  getOrder: async (id, config = {}) => {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.ORDERS.GET_ONE(id), config);
      return response.data;
    } catch (error) {
      console.error('Order API Error [getOrder]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
  createOrder: async (orderData) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
      return response.data;
    } catch (error) {
      console.error('Order API Error [createOrder]:', {
        status: error.response?.status,
        data:   error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      const response = await axiosClient.put(
        API_ENDPOINTS.ORDERS.UPDATE(id),
        orderData
      );
      return response.data;
    } catch (error) {
      console.error('Order API Error [updateOrder]:', {
        status: error.response?.status,
        data:   error.response?.data ? JSON.stringify(error.response?.data) : null,
        message: error.message,
      });
      throw error;
    }
  },

  sendTelegramNotification: async (message) => {
    try {
      const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
      const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || process.env.REACT_APP_TELEGRAM_CHAT_ID;
      
      if (!botToken || !chatId) {
        console.warn('Telegram Bot Token or Chat ID is not configured');
        return;
      }

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Order API Error [sendTelegramNotification]:', error);
      throw error;
    }
  },
};
