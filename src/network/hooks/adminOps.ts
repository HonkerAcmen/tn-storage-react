import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminHttp from '@/network/adminHttp';
import {
  ClearAdminCacheApiResponse,
  GetAdminAuditLogsApiResponse,
  GetAdminOpsConfigApiResponse,
  GetAdminOpsMinioApiResponse,
  GetAdminOpsOverviewApiResponse,
} from '@/network/types/Response/admin';
import { isAdminAuthed } from '@/utils/auth/adminSession';

const adminKey = ['admin'] as const;

export function useAdminOpsOverview(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'ops', 'overview'],
    queryFn: async () =>
      await adminHttp.get<GetAdminOpsOverviewApiResponse>(
        '/admin/ops/overview',
      ),
    enabled: authed && enabled,
    refetchInterval: 30_000,
  });
}

export function useAdminOpsMinio(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'ops', 'minio'],
    queryFn: async () =>
      await adminHttp.get<GetAdminOpsMinioApiResponse>('/admin/ops/minio'),
    enabled: authed && enabled,
    refetchInterval: 60_000,
  });
}

export function useAdminOpsConfig(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'ops', 'config'],
    queryFn: async () =>
      await adminHttp.get<GetAdminOpsConfigApiResponse>('/admin/ops/config'),
    enabled: authed && enabled,
  });
}

export function useAdminClearCache() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await adminHttp.post<ClearAdminCacheApiResponse>(
        '/admin/ops/cache/clear',
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'ops', 'overview'],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'audit', 'logs'],
      });
    },
  });
}

export function useAdminAuditLogs(params: {
  page: number;
  limit: number;
  action?: string;
  adminId?: number;
}) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'audit', 'logs', params],
    queryFn: async () =>
      await adminHttp.get<GetAdminAuditLogsApiResponse>('/admin/audit/logs', {
        params,
      }),
    enabled: authed,
  });
}
