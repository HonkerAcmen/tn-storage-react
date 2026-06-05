import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { message } from 'antd';
import {
  clearAdminSession,
  forceRedirectToAdminLogin,
  getAdminToken,
} from '@/utils/auth/adminSession';
import { normalizeApiError } from '@/utils/apiError';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

const adminHttp: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminHttp.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

adminHttp.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const token = getAdminToken();
      if (token && !window.location.pathname.startsWith('/admin/login')) {
        clearAdminSession();
        forceRedirectToAdminLogin();
      }
    } else if (!error.response) {
      message.error('网络异常，请稍后重试');
    }
    return Promise.reject(
      normalizeApiError(error.response?.data ?? error, error.response?.status),
    );
  },
);

export default adminHttp;
