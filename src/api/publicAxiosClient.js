import axios from 'axios';
import { env } from '../config/env';
const axiosInstance = axios.create ? axios : (axios.default || axios);

const publicAxiosClient = axiosInstance.create({
  baseURL: env.APP_API_URL,
  timeout: env.TIMEOUT,
  headers: {
    Accept: 'application/json',
  },
});

export default publicAxiosClient;
