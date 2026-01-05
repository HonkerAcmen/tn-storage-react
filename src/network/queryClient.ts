import { QueryClient } from '@tanstack/react-query';

/**
 * React Query 默认配置
 */
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // 缓存时间：5分钟（数据在缓存中保留的时间）
      staleTime: 5 * 60 * 1000,
      // 垃圾回收时间：10分钟（未使用的数据在缓存中保留的时间）
      gcTime: 10 * 60 * 1000,
      // 失败重试次数
      retry: 1,
      // 失败重试延迟（毫秒）
      retryDelay: 1000,
      // 窗口聚焦时重新获取数据
      refetchOnWindowFocus: false,
      // 网络重连时重新获取数据
      refetchOnReconnect: true,
      // 挂载时重新获取数据（但某些查询可以覆盖此设置）
      refetchOnMount: true,
    },
    mutations: {
      // 失败重试次数
      retry: 0,
      // 失败重试延迟（毫秒）
      retryDelay: 1000,
    },
  },
};

/**
 * 创建 QueryClient 实例
 */
export const queryClient = new QueryClient(queryClientConfig);

/**
 * Query Keys 统一管理
 * 确保在项目中使用的 query key 保持一致
 */
export const queryKeys = {
  // 用户相关
  user: {
    all: ['user'] as const,
    username: () => ['user', 'username'] as const,
    detail: (username: string) => ['user', 'username', username] as const,
  },
  // 文件相关
  files: {
    all: ['files'] as const,
    tree: () => ['files', 'tree'] as const,
  },
};
