import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminHttp from '@/network/adminHttp';
import { isAdminAuthed } from '@/utils/auth/adminSession';
import { VerificationPurpose } from '@/network/hooks/verification';

const key = ['admin', 'verification'] as const;

export interface AdminEmailConfig {
  configured: boolean;
  enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  from_name: string;
  from_email: string;
  has_password: boolean;
  updated_at?: string;
}

export interface VerificationPolicyItem {
  id: number;
  purpose: VerificationPurpose;
  scope: 'cloud' | 'admin';
  steps: Array<'captcha' | 'email'>;
  enabled: boolean;
  description?: string | null;
}

export function useAdminEmailConfig() {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...key, 'email-config'],
    queryFn: async () => {
      const res = await adminHttp.get<{ data: AdminEmailConfig }>(
        '/admin/verification/email-config',
      );
      return res.data.data;
    },
    enabled: authed,
  });
}

export function useSaveAdminEmailConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      smtp_host: string;
      smtp_port: number;
      smtp_secure: boolean;
      smtp_user: string;
      smtp_password?: string;
      from_name?: string;
      from_email: string;
      enabled: boolean;
    }) => {
      const res = await adminHttp.put<{ data: AdminEmailConfig }>(
        '/admin/verification/email-config',
        body,
      );
      return res.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...key, 'email-config'] });
    },
  });
}

export function useTestAdminEmailConfig() {
  return useMutation({
    mutationFn: async (toEmail: string) =>
      await adminHttp.post('/admin/verification/email-config/test', {
        toEmail,
      }),
  });
}

export function useAdminVerificationPolicies() {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...key, 'policies'],
    queryFn: async () => {
      const res = await adminHttp.get<{ data: VerificationPolicyItem[] }>(
        '/admin/verification/policies',
      );
      return res.data.data;
    },
    enabled: authed,
  });
}

export function useUpdateVerificationPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      purpose,
      ...body
    }: {
      purpose: VerificationPurpose;
      steps?: Array<'captcha' | 'email'>;
      enabled?: boolean;
      description?: string;
    }) => {
      const res = await adminHttp.put<{ data: VerificationPolicyItem }>(
        `/admin/verification/policies/${purpose}`,
        body,
      );
      return res.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...key, 'policies'] });
    },
  });
}
