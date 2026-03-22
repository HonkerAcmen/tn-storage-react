import { queryClient } from '@/network/queryClient';

/**
 * 检查用户是否已认证
 */
export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

/**
 * 退出登录
 * 清除所有本地数据并跳转到登录页
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('userId');
  // 清除 React Query 缓存
  queryClient.clear();
  // 立即跳转到登录页面（强制刷新）
  window.location.href = '/login';
}
