import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { message } from 'antd';

/**
 * Axios 请求配置
 * 统一处理请求和响应拦截器
 */

// API 基础 URL（可根据环境变量配置）
const BASE_URL = 'http://localhost:3002/api/v1';

/**
 * 创建 axios 实例
 */
const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加 token 等认证信息
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 如果是 FormData，让 axios 自动设置 Content-Type（包括 boundary）
    // axios 检测到 FormData 时会自动设置正确的 Content-Type
    if (config.data instanceof FormData) {
      // 删除默认的 Content-Type，让 axios 自动处理
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response: AxiosResponse) => {
    if (sessionStorage.getItem('networkConn') === 'false') {
      sessionStorage.setItem('networkConn', 'true');
    }
    return response;
  },
  (error: AxiosError) => {
    // 处理 HTTP 错误状态码
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // 可以在这里处理登出逻辑
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
            localStorage.removeItem('token');
          }
          break;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应

      if (
        sessionStorage.getItem('networkConn') === null ||
        sessionStorage.getItem('networkConn') === 'true' ||
        window.location.pathname !== '/networkError'
      ) {
        sessionStorage.setItem('networkConn', 'false');
        window.location.href = '/networkError';
      }
    } else {
      // 其他错误
      message.error(error.message || '请求失败');
    }

    return Promise.reject(error.response?.data);
  }
);

export default request;
