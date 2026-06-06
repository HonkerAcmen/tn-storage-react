import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminHttp from '@/network/adminHttp';
import {
  AdminAuthProfile,
  GetAdminLoginLogsApiResponse,
  GetAdminStaffListApiResponse,
} from '@/network/types/Response/admin';
import { isAdminAuthed } from '@/utils/auth/adminSession';

const staffKey = ['admin', 'staff'] as const;
const loginLogKey = ['admin', 'login-logs'] as const;

export function useAdminStaffList(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...staffKey, 'list'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStaffListApiResponse>('/admin/staff'),
    enabled: authed && enabled,
  });
}

export function useAdminCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      username: string;
      email: string;
      password: string;
      display_name?: string;
      role?: AdminAuthProfile['role'];
    }) => await adminHttp.post('/admin/staff', body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...staffKey] });
    },
  });
}

export function useAdminUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: number;
      username?: string;
      email?: string;
      display_name?: string;
      role?: AdminAuthProfile['role'];
      status?: AdminAuthProfile['status'];
    }) => await adminHttp.put(`/admin/staff/${id}`, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...staffKey] });
    },
  });
}

export function useAdminDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await adminHttp.delete(`/admin/staff/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...staffKey] });
    },
  });
}

export function useAdminResetStaffPassword() {
  return useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) =>
      await adminHttp.post(`/admin/staff/${id}/reset-password`, { password }),
  });
}

export function useAdminLoginLogs(params: {
  page: number;
  limit: number;
  adminId?: number;
}) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...loginLogKey, params],
    queryFn: async () =>
      await adminHttp.get<GetAdminLoginLogsApiResponse>(
        '/admin/login-logs',
        { params },
      ),
    enabled: authed,
  });
}

export function useAdminChangePassword() {
  return useMutation({
    mutationFn: async (body: { oldPassword: string; newPassword: string }) =>
      await adminHttp.put('/admin/auth/password', body),
  });
}
