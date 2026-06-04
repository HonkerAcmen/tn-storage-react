import { useSyncExternalStore } from 'react';

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_PROFILE_KEY = 'admin_profile';
const ADMIN_AUTH_CHANGE_EVENT = 'admin-auth-change';

export interface AdminProfile {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  avatar: string | null;
  status: string;
  role: string;
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handleChange = () => callback();
  window.addEventListener('storage', handleChange);
  window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, handleChange);
  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, handleChange);
  };
}

function getAdminTokenSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(ADMIN_TOKEN_KEY);
}

function getServerAdminTokenSnapshot(): boolean {
  return false;
}

export function notifyAdminAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function isAdminAuthed(): boolean {
  return getAdminTokenSnapshot();
}

export function useAdminAuthed(): boolean {
  return useSyncExternalStore(
    subscribe,
    getAdminTokenSnapshot,
    getServerAdminTokenSnapshot,
  );
}

export function setAdminSession(token: string, profile: AdminProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
  notifyAdminAuthChanged();
}

export function getStoredAdminProfile(): AdminProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
  notifyAdminAuthChanged();
}

export function forceRedirectToAdminLogin() {
  if (typeof window === 'undefined') return;
  clearAdminSession();
  if (window.location.pathname !== '/admin/login') {
    window.location.href = '/admin/login';
  }
}
