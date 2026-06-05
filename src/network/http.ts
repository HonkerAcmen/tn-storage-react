import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { message } from 'antd';
import { clearAuthSession, forceRedirectToLogin } from '@/utils/auth';
import { normalizeApiError } from '@/utils/apiError';
import { UPLOAD_REQUEST_TIMEOUT_MS } from '@/network/uploadTimeout';

/**
 * Axios 请求配置
 * 统一处理请求和响应拦截器
 */

// API 基础 URL：生产 Docker 部署用 /api/v1（Nginx 同域反代）；本地开发见 .env.local.example
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

const PROFILE_ME_PATH = '/user/profile/me';

function isProfileMeRequest(url?: string): boolean {
  if (!url) return false;
  return url.includes(PROFILE_ME_PATH);
}

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
      const token = localStorage.getItem('token');

      // 请求守卫
      switch (status) {
        case 401:
          if (token && window.location.pathname !== '/login') {
            clearAuthSession();
            window.location.href = '/login';
          }
          break;
        case 500:
          if (isProfileMeRequest(error.config?.url)) {
            forceRedirectToLogin();
          }
          break;
      }
    } else if (error.request) {
      const isTimeout =
        error.code === 'ECONNABORTED' ||
        (typeof error.message === 'string' &&
          error.message.toLowerCase().includes('timeout'));

      if (isTimeout) {
        return Promise.reject(
          normalizeApiError(
            {
              message: `上传超时（${UPLOAD_REQUEST_TIMEOUT_MS / 1000} 秒），请检查网络后重试`,
            },
            undefined,
          ),
        );
      }

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

    return Promise.reject(
      normalizeApiError(error.response?.data ?? error, error.response?.status),
    );
  }
);

export default request;
