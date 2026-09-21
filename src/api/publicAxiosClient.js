import axios from 'axios';
import { env } from '../config/env';

/**
 * A public (unauthenticated) axios instance for endpoints that do NOT
 * require a Bearer token (e.g. public shop settings, categories, slides).
 *
 * Do NOT use this client for admin/protected routes.
 */
const axiosInstance = axios.create ? axios : (axios.default || axios);

const publicAxiosClient = axiosInstance.create({
  baseURL: env.APP_API_URL,
  timeout: env.TIMEOUT,
  headers: {
    Accept: 'application/json',
  },
});

export default publicAxiosClient;
