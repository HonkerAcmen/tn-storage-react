import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminHttp from '@/network/adminHttp';
import {
  GetAdminActivityApiResponse,
  GetAdminBackupJobApiResponse,
  GetAdminBackupJobsApiResponse,
  GetAdminMetricsApiResponse,
  GetAdminStorageOverviewApiResponse,
  GetAdminStorageUsersApiResponse,
  GetAdminUsersApiResponse,
  TriggerAdminBackupApiResponse,
} from '@/network/types/Response/admin';
import { AdminUserRoleResponse } from '@/network/types/Response/user';
import { isAdminAuthed } from '@/utils/auth/adminSession';

const adminKey = ['admin'] as const;

export function useAdminMetrics(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'metrics'],
    queryFn: async () =>
      await adminHttp.get<GetAdminMetricsApiResponse>('/admin/metrics'),
    enabled: authed && enabled,
    refetchInterval: 30_000,
  });
}

export function useAdminActivity(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'activity'],
    queryFn: async () =>
      await adminHttp.get<GetAdminActivityApiResponse>('/admin/metrics/activity'),
    enabled: authed && enabled,
    refetchInterval: 60_000,
  });
}

export function useAdminStorageOverview(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'overview'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStorageOverviewApiResponse>(
        '/admin/storage/overview'
      ),
    enabled: authed && enabled,
  });
}

export function useAdminStorageUsers(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'users'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStorageUsersApiResponse>('/admin/storage/users'),
    enabled: authed && enabled,
  });
}

export function useAdminUsers(params: {
  page: number;
  limit: number;
  keyword?: string;
  role?: AdminUserRoleResponse['role'];
  status?: AdminUserRoleResponse['account_status'];
}) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'users', params],
    queryFn: async () =>
      await adminHttp.get<GetAdminUsersApiResponse>('/admin/users', {
        params,
      }),
    enabled: authed,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useAdminCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      username: string;
      email: string;
      phone: string;
      password: string;
      role?: AdminUserRoleResponse['role'];
    }) => await adminHttp.post('/admin/users', body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'metrics'],
      });
    },
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: number;
      username?: string;
      email?: string;
      phone?: string;
      desc?: string;
      role?: AdminUserRoleResponse['role'];
    }) => await adminHttp.put(`/admin/users/${id}`, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await adminHttp.delete(`/admin/users/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'metrics'],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'users'],
      });
    },
  });
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) =>
      await adminHttp.post(`/admin/users/${id}/reset-password`, { password }),
  });
}

export function useAdminUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      role,
    }: {
      id: number;
      role: AdminUserRoleResponse['role'];
    }) => await adminHttp.put(`/admin/users/${id}/role`, { role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] });
    },
  });
}

export function useAdminUpdateUserPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...permissions
    }: {
      id: number;
      allow_file_upload?: boolean;
      allow_file_download?: boolean;
      allow_file_delete?: boolean;
      allow_favorite?: boolean;
      allow_share?: boolean;
    }) => await adminHttp.put(`/admin/users/${id}/permissions`, permissions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] });
    },
  });
}

export function useAdminUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: AdminUserRoleResponse['account_status'];
    }) => await adminHttp.put(`/admin/users/${id}/status`, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] });
    },
  });
}

export function useAdminBackupJobs(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'backup', 'jobs'],
    queryFn: async () =>
      await adminHttp.get<GetAdminBackupJobsApiResponse>('/admin/backup/jobs'),
    enabled: authed && enabled,
    refetchInterval: (query) => {
      const jobs = query.state.data?.data?.data ?? [];
      const hasRunning = jobs.some(
        (job) => job.status === 'running' || job.status === 'pending'
      );
      return hasRunning ? 3000 : false;
    },
  });
}

export function useAdminBackupJob(id: string | null, enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'backup', 'job', id],
    queryFn: async () =>
      await adminHttp.get<GetAdminBackupJobApiResponse>(`/admin/backup/jobs/${id}`),
    enabled: authed && enabled && !!id,
    refetchInterval: 3000,
  });
}

export function useAdminTriggerBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await adminHttp.post<TriggerAdminBackupApiResponse>('/admin/backup/trigger'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'backup', 'jobs'],
      });
    },
  });
}

export function useAdminDeleteBackupJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      await adminHttp.delete(`/admin/backup/jobs/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'backup', 'jobs'],
      });
    },
  });
}

export async function downloadAdminBackupJob(id: string): Promise<void> {
  const response = await adminHttp.get<Blob>(
    `/admin/backup/jobs/${id}/download`,
    { responseType: 'blob' },
  );
  const blob = new Blob([response.data], { type: 'application/zip' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${id}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
