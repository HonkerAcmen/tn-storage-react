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

function subscribeNoop() {
  return () => {};
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getServerHydratedSnapshot(): boolean {
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

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );
}

/**
 * 清除本地登录态（token 与用户信息）
 */
export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('userId');
  notifyAuthChanged();
  queryClient.clear();
}

let redirectingToLogin = false;

/**
 * 清空本地用户信息并跳转登录页（用于 profile 等鉴权接口异常）
 */
export function forceRedirectToLogin() {
  if (typeof window === 'undefined') return;
  clearAuthSession();
  if (window.location.pathname === '/login') return;
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  window.location.href = '/login';
}

/**
 * 退出登录
 * 清除所有本地数据并回到访客页
 */
export function logout() {
  clearAuthSession();
  window.location.href = '/visitor';
}
