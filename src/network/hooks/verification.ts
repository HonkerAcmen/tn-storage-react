import { useMutation, useQuery } from '@tanstack/react-query';
import http from '@/network/http';
import adminHttp from '@/network/adminHttp';

export type VerificationPurpose =
  | 'auth.login'
  | 'auth.register'
  | 'auth.forgot_password'
  | 'auth.change_password'
  | 'admin.login'
  | 'admin.change_password'
  | 'admin.reset_user_password'
  | 'admin.disable_user'
  | 'admin.delete_user'
  | 'admin.backup_restore';

export interface CaptchaResponse {
  captchaId: string;
  imageBase64: string;
  expiresIn: number;
}

export function useCaptcha() {
  return useQuery({
    queryKey: ['verification', 'captcha'],
    queryFn: async () => {
      const res = await http.get<{ data: CaptchaResponse }>('/verification/captcha');
      return res.data.data;
    },
    staleTime: 0,
    gcTime: 0,
  });
}

export function useAdminCaptcha() {
  return useQuery({
    queryKey: ['verification', 'admin-captcha'],
    queryFn: async () => {
      const res = await adminHttp.get<{ data: CaptchaResponse }>('/verification/captcha');
      return res.data.data;
    },
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSendEmailOtp(isAdmin = false) {
  const client = isAdmin ? adminHttp : http;
  return useMutation({
    mutationFn: async (body: {
      purpose: VerificationPurpose;
      scope: 'cloud' | 'admin';
      email?: string;
      captchaId?: string;
      captchaCode?: string;
    }) => {
      const res = await client.post<{
        data: { challengeId: string; expiresIn: number; cooldownSeconds: number };
      }>('/verification/email/send', body);
      return res.data.data;
    },
  });
}

export function useVerifyEmailOtp(isAdmin = false) {
  const client = isAdmin ? adminHttp : http;
  return useMutation({
    mutationFn: async (body: { challengeId: string; code: string }) => {
      const res = await client.post<{
        data: { challengeToken: string; expiresIn: number };
      }>('/verification/email/verify', body);
      return res.data.data;
    },
  });
}
