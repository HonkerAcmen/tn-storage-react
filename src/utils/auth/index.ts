import { useSyncExternalStore } from 'react';
import { queryClient } from '@/network/queryClient';

const AUTH_CHANGE_EVENT = 'auth-change';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleChange = () => callback();
  window.addEventListener('storage', handleChange);
  window.addEventListener(AUTH_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, handleChange);
  };
}

function getAuthSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

function getServerAuthSnapshot(): boolean {
  return false;
}

export function notifyAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/**
 * 检查用户是否已认证
 */
export function isAuthed(): boolean {
  return getAuthSnapshot();
}

export function useAuthed(): boolean {
  return useSyncExternalStore(
    subscribe,
    getAuthSnapshot,
    getServerAuthSnapshot
  );
}

/**
 * 退出登录
 * 清除所有本地数据并回到首页访客模式
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('userId');
  notifyAuthChanged();
  // 清除 React Query 缓存
  queryClient.clear();
  // 回到首页，保持访客模式
  window.location.href = '/';
}
