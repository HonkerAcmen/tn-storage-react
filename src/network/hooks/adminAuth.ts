import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminHttp from '@/network/adminHttp';
import {
  AdminAuthLoginApiResponse,
  AdminAuthMeApiResponse,
} from '@/network/types/Response/admin';
import { LoginRequest } from '@/network/types/Request/auth';
import { getAdminApiErrorMessage } from '@/utils/admin/apiError';
import {
  clearAdminSession,
  isAdminAuthed,
  setAdminSession,
} from '@/utils/auth/adminSession';

export class AdminLoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminLoginError';
  }
}

const adminAuthKey = ['admin', 'auth'] as const;

export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      try {
        const res = await adminHttp.post<AdminAuthLoginApiResponse>(
          '/admin/auth/login',
          data,
        );
        const payload = res.data.data;
        setAdminSession(payload.token, payload.admin);
        await queryClient.invalidateQueries({ queryKey: [...adminAuthKey] });
        return payload;
      } catch (err: unknown) {
        throw new AdminLoginError(
          getAdminApiErrorMessage(err, '邮箱或密码错误'),
        );
      }
    },
  });
}

export function useAdminProfile(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminAuthKey, 'me'],
    queryFn: async () =>
      await adminHttp.get<AdminAuthMeApiResponse>('/admin/auth/me'),
    enabled: authed && enabled,
    retry: false,
    staleTime: 60_000,
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearAdminSession();
    queryClient.removeQueries({ queryKey: ['admin'] });
    window.location.href = '/admin/login';
  };
}
