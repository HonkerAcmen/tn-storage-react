import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminHttp from '@/network/adminHttp';
import {
  GetAdminActivityApiResponse,
  GetAdminBackupJobsApiResponse,
  GetAdminBackupScheduleApiResponse,
  GetAdminFilesApiResponse,
  GetAdminSharesApiResponse,
  GetAdminTrashApiResponse,
  GetAdminUserLoginLogsApiResponse,
  GetAdminUserApiResponse,
  UpdateAdminUserQuotaApiResponse,
  GetAdminMetricsApiResponse,
  GetAdminStorageOverviewApiResponse,
  GetAdminStoragePolicyApiResponse,
  UpdateAdminStoragePolicyApiResponse,
  RebalanceStorageQuotasApiResponse,
  GetAdminStorageAlertsApiResponse,
  GetAdminStorageBackendsApiResponse,
  CreateAdminStorageBackendApiResponse,
  UpdateAdminStorageBackendApiResponse,
  TestAdminStorageBackendApiResponse,
  ActivateAdminStorageBackendApiResponse,
  GetAdminStorageMigrationsApiResponse,
  CreateAdminStorageMigrationApiResponse,
  GetAdminStorageRetentionsApiResponse,
  PurgeAdminStorageRetentionApiResponse,
  GetStorageMigrationReportApiResponse,
  GetAdminStorageDashboardApiResponse,
  GetAdminStorageTrendsApiResponse,
  SetAdminStorageMaintenanceApiResponse,
  RollbackAdminStorageBackendApiResponse,
  GetStorageDiskProbeApiResponse,
  SyncStorageDiskProbeApiResponse,
  GetStorageDualWriteApiResponse,
  ReconcileMigrationChecksumApiResponse,
  GetOssStorageOverviewApiResponse,
  GetOssStorageBucketsApiResponse,
  GetAdminStorageUsersApiResponse,
  GetAdminUsersApiResponse,
  TriggerAdminBackupApiResponse,
  RestoreAdminBackupApiResponse,
  GetAdminForbiddenWordsApiResponse,
  UpdateAdminForbiddenWordsApiResponse,
  GetAdminUploadTasksApiResponse,
  AdminBatchCancelUploadResponse,
  AdminBatchFileDeleteResponse,
} from '@/network/types/Response/admin';
import { AdminCloudUserResponse } from '@/network/types/Response/user';
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

export function useAdminStoragePolicy(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'policy'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStoragePolicyApiResponse>(
        '/admin/storage/policy',
      ),
    enabled: authed && enabled,
  });
}

export function useAdminStorageAlerts(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'alerts'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStorageAlertsApiResponse>(
        '/admin/storage/alerts',
      ),
    enabled: authed && enabled,
    refetchInterval: 60_000,
  });
}

async function invalidateStorageQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [...adminKey, 'storage'] }),
    queryClient.invalidateQueries({ queryKey: [...adminKey, 'metrics'] }),
    queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] }),
  ]);
}

export function useUpdateAdminStoragePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      disk_total_bytes?: number;
      user_pool_ratio?: number;
      warn_min_quota_bytes?: number;
      warn_pool_usage_ratio?: number;
    }) =>
      await adminHttp.put<UpdateAdminStoragePolicyApiResponse>(
        '/admin/storage/policy',
        body,
      ),
    onSuccess: async () => {
      await invalidateStorageQueries(queryClient);
    },
  });
}

export function useRebalanceStorageQuotas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await adminHttp.post<RebalanceStorageQuotasApiResponse>(
        '/admin/storage/rebalance',
      ),
    onSuccess: async () => {
      await invalidateStorageQueries(queryClient);
    },
  });
}

async function invalidateBackendQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.invalidateQueries({
    queryKey: [...adminKey, 'storage', 'backends'],
  });
}

export function useAdminStorageBackends(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'backends'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStorageBackendsApiResponse>(
        '/admin/storage/backends',
      ),
    enabled: authed && enabled,
  });
}

export function useCreateAdminStorageBackend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      provider_type: 's3';
      endpoint: string;
      port?: number | null;
      region?: string | null;
      use_ssl: boolean;
      force_path_style: boolean;
      access_key: string;
      secret_key: string;
    }) =>
      await adminHttp.post<CreateAdminStorageBackendApiResponse>(
        '/admin/storage/backends',
        body,
      ),
    onSuccess: async () => {
      await invalidateBackendQueries(queryClient);
    },
  });
}

export function useUpdateAdminStorageBackend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: {
        name?: string;
        provider_type?: 'minio' | 's3';
        endpoint?: string;
        port?: number | null;
        region?: string | null;
        use_ssl?: boolean;
        force_path_style?: boolean;
        access_key?: string;
        secret_key?: string;
      };
    }) =>
      await adminHttp.put<UpdateAdminStorageBackendApiResponse>(
        `/admin/storage/backends/${id}`,
        body,
      ),
    onSuccess: async () => {
      await invalidateBackendQueries(queryClient);
    },
  });
}

export function useTestAdminStorageBackend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.post<TestAdminStorageBackendApiResponse>(
        `/admin/storage/backends/${id}/test`,
      ),
    onSuccess: async () => {
      await invalidateBackendQueries(queryClient);
    },
  });
}

export function useActivateAdminStorageBackend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.put<ActivateAdminStorageBackendApiResponse>(
        `/admin/storage/backends/${id}/activate`,
      ),
    onSuccess: async () => {
      await invalidateBackendQueries(queryClient);
      await invalidateStorageQueries(queryClient);
      await invalidateMigrationQueries(queryClient);
    },
  });
}

async function invalidateMigrationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.invalidateQueries({
    queryKey: [...adminKey, 'storage', 'migrations'],
  });
  await queryClient.invalidateQueries({
    queryKey: [...adminKey, 'storage', 'retention'],
  });
}

export function useAdminStorageMigrations(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'migrations'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStorageMigrationsApiResponse>(
        '/admin/storage/migrations',
      ),
    enabled: authed && enabled,
    refetchInterval: (query) => {
      const jobs = query.state.data?.data?.data ?? [];
      const hasRunning = jobs.some(
        (job) => job.status === 'running' || job.status === 'pending',
      );
      return hasRunning ? 3000 : false;
    },
  });
}

export function useCreateAdminStorageMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      source_backend_id: number;
      target_backend_id: number;
      mode: 'migrate' | 'backup' | 'sync';
      auto_activate?: boolean;
    }) =>
      await adminHttp.post<CreateAdminStorageMigrationApiResponse>(
        '/admin/storage/migrations',
        body,
      ),
    onSuccess: async () => {
      await invalidateMigrationQueries(queryClient);
      await invalidateBackendQueries(queryClient);
    },
  });
}

export function useMigrateAndActivateAdminStorage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      source_backend_id: number;
      target_backend_id: number;
    }) =>
      await adminHttp.post<CreateAdminStorageMigrationApiResponse>(
        '/admin/storage/migrations/migrate-and-activate',
        body,
      ),
    onSuccess: async () => {
      await invalidateMigrationQueries(queryClient);
      await invalidateBackendQueries(queryClient);
      await invalidateStorageQueries(queryClient);
    },
  });
}

export function useCancelAdminStorageMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.post<CreateAdminStorageMigrationApiResponse>(
        `/admin/storage/migrations/${id}/cancel`,
      ),
    onSuccess: async () => {
      await invalidateMigrationQueries(queryClient);
    },
  });
}

export function useRetryAdminStorageMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.post<CreateAdminStorageMigrationApiResponse>(
        `/admin/storage/migrations/${id}/retry`,
      ),
    onSuccess: async () => {
      await invalidateMigrationQueries(queryClient);
    },
  });
}

export function useResumeAdminStorageMigration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.post<CreateAdminStorageMigrationApiResponse>(
        `/admin/storage/migrations/${id}/resume`,
      ),
    onSuccess: async () => {
      await invalidateMigrationQueries(queryClient);
    },
  });
}

export function useAdminStorageMigrationReport(id?: number) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'migrations', 'report', id],
    queryFn: async () =>
      await adminHttp.get<GetStorageMigrationReportApiResponse>(
        `/admin/storage/migrations/${id}/report`,
      ),
    enabled: authed && Boolean(id),
  });
}

export function useRollbackAdminStorageBackend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.put<RollbackAdminStorageBackendApiResponse>(
        `/admin/storage/backends/${id}/rollback`,
      ),
    onSuccess: async () => {
      await invalidateBackendQueries(queryClient);
      await invalidateStorageQueries(queryClient);
      await invalidateMigrationQueries(queryClient);
    },
  });
}

export function useAdminStorageDashboard(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'dashboard'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStorageDashboardApiResponse>(
        '/admin/storage/dashboard',
      ),
    enabled: authed && enabled,
    refetchInterval: 60_000,
  });
}

export function useAdminStorageTrends(days = 30, enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'trends', days],
    queryFn: async () =>
      await adminHttp.get<GetAdminStorageTrendsApiResponse>(
        '/admin/storage/trends',
        { params: { days } },
      ),
    enabled: authed && enabled,
  });
}

export function useStorageDiskProbe(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'disk-probe'],
    queryFn: async () =>
      await adminHttp.get<GetStorageDiskProbeApiResponse>(
        '/admin/storage/disk-probe',
      ),
    enabled: authed && enabled,
  });
}

export function useProbeStorageDisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await adminHttp.post<GetStorageDiskProbeApiResponse>(
        '/admin/storage/disk-probe',
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'disk-probe'],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dashboard'],
      });
      await invalidateStorageQueries(queryClient);
    },
  });
}

export function useSyncStorageDiskFromProbe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await adminHttp.post<SyncStorageDiskProbeApiResponse>(
        '/admin/storage/disk-probe/sync',
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'disk-probe'],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dashboard'],
      });
      await invalidateStorageQueries(queryClient);
    },
  });
}

export function useStorageDualWriteConfig(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'dual-write'],
    queryFn: async () =>
      await adminHttp.get<GetStorageDualWriteApiResponse>(
        '/admin/storage/dual-write',
      ),
    enabled: authed && enabled,
  });
}

export function useEnableStorageDualWrite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (backendId: number) =>
      await adminHttp.put<GetStorageDualWriteApiResponse>(
        '/admin/storage/dual-write',
        { backend_id: backendId },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dual-write'],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dashboard'],
      });
    },
  });
}

export function useDisableStorageDualWrite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await adminHttp.delete<GetStorageDualWriteApiResponse>(
        '/admin/storage/dual-write',
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dual-write'],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dashboard'],
      });
    },
  });
}

export function useCutoverStorageDualWrite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      await adminHttp.post<GetStorageDualWriteApiResponse>(
        '/admin/storage/dual-write/cutover',
      ),
    onSuccess: async () => {
      await invalidateBackendQueries(queryClient);
      await invalidateStorageQueries(queryClient);
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dual-write'],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dashboard'],
      });
    },
  });
}

export function useReconcileMigrationChecksum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.post<ReconcileMigrationChecksumApiResponse>(
        `/admin/storage/migrations/${id}/reconcile-checksum`,
      ),
    onSuccess: async () => {
      await invalidateMigrationQueries(queryClient);
    },
  });
}

export function useSetAdminStorageMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) =>
      await adminHttp.put<SetAdminStorageMaintenanceApiResponse>(
        '/admin/storage/maintenance',
        { enabled },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'dashboard'],
      });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'storage', 'policy'],
      });
    },
  });
}

export function useAdminStorageRetentions(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'retention'],
    queryFn: async () =>
      await adminHttp.get<GetAdminStorageRetentionsApiResponse>(
        '/admin/storage/retention',
      ),
    enabled: authed && enabled,
    refetchInterval: 60_000,
  });
}

export function usePurgeAdminStorageRetention() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      challengeToken,
    }: {
      id: number;
      challengeToken: string;
    }) =>
      await adminHttp.post<PurgeAdminStorageRetentionApiResponse>(
        `/admin/storage/retention/${id}/purge`,
        { challengeToken },
      ),
    onSuccess: async () => {
      await invalidateMigrationQueries(queryClient);
      await invalidateBackendQueries(queryClient);
    },
  });
}

export function useOssStorageOverview(backendId?: number, enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'oss', 'overview', backendId],
    queryFn: async () =>
      await adminHttp.get<GetOssStorageOverviewApiResponse>(
        '/admin/storage/oss/overview',
        { params: { backendId } },
      ),
    enabled: authed && enabled && Boolean(backendId),
  });
}

export function useOssStorageBuckets(backendId?: number, enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'storage', 'oss', 'buckets', backendId],
    queryFn: async () =>
      await adminHttp.get<GetOssStorageBucketsApiResponse>(
        '/admin/storage/oss/buckets',
        { params: { backendId } },
      ),
    enabled: authed && enabled && Boolean(backendId),
  });
}

export function useAdminUsers(params: {
  page: number;
  limit: number;
  keyword?: string;
  status?: AdminCloudUserResponse['account_status'];
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
    }) => await adminHttp.put(`/admin/users/${id}`, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      challengeToken,
    }: {
      id: number;
      challengeToken?: string;
    }) =>
      await adminHttp.delete(`/admin/users/${id}`, {
        data: { challengeToken },
      }),
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
    mutationFn: async ({
      id,
      password,
      challengeToken,
    }: {
      id: number;
      password: string;
      challengeToken?: string;
    }) =>
      await adminHttp.post(`/admin/users/${id}/reset-password`, {
        password,
        challengeToken,
      }),
  });
}

export function useAdminUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      challengeToken,
    }: {
      id: number;
      status: AdminCloudUserResponse['account_status'];
      challengeToken?: string;
    }) =>
      await adminHttp.put(`/admin/users/${id}/status`, {
        status,
        challengeToken,
      }),
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

export function useAdminBackupSchedule(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'backup', 'schedule'],
    queryFn: async () =>
      await adminHttp.get<GetAdminBackupScheduleApiResponse>(
        '/admin/backup/schedule'
      ),
    enabled: authed && enabled,
  });
}

export function useAdminUpdateBackupSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      enabled?: boolean;
      cron?: string;
      minioMirror?: boolean;
    }) => await adminHttp.put('/admin/backup/schedule', body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'backup', 'schedule'],
      });
    },
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

export function useAdminCancelBackupJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      await adminHttp.post(`/admin/backup/jobs/${id}/cancel`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'backup', 'jobs'],
      });
    },
  });
}

export function useAdminRestoreBackupJob() {
  return useMutation({
    mutationFn: async ({
      id,
      includeMinio = true,
      challengeToken,
    }: {
      id: string;
      includeMinio?: boolean;
      challengeToken?: string;
    }) =>
      await adminHttp.post<RestoreAdminBackupApiResponse>(
        `/admin/backup/jobs/${id}/restore`,
        { includeMinio, challengeToken },
      ),
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

export function useAdminFiles(params: {
  page: number;
  limit: number;
  keyword?: string;
  userId?: number;
  type?: 'file' | 'folder';
}) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'files', params],
    queryFn: async () =>
      await adminHttp.get<GetAdminFilesApiResponse>('/admin/files', { params }),
    enabled: authed,
  });
}

export async function downloadAdminFile(
  id: number,
  filename: string,
): Promise<void> {
  const response = await adminHttp.get<Blob>(`/admin/files/${id}/download`, {
    responseType: 'blob',
  });
  const contentType =
    response.headers['content-type']?.split(';')[0] || 'application/octet-stream';
  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function previewAdminFile(id: number): Promise<void> {
  const response = await adminHttp.get<Blob>(`/admin/files/${id}/preview`, {
    responseType: 'blob',
  });
  const contentType =
    response.headers['content-type']?.split(';')[0] || 'application/octet-stream';
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: contentType }),
  );
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}

export function useAdminUploadTasks(params?: { userId?: number }, enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'upload', 'tasks', params],
    queryFn: async () =>
      await adminHttp.get<GetAdminUploadTasksApiResponse>('/admin/upload/tasks', {
        params,
      }),
    enabled: authed && enabled,
    refetchInterval: 5_000,
  });
}

export function useAdminCancelUploadTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) =>
      await adminHttp.delete(`/admin/upload/${taskId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'upload', 'tasks'],
      });
    },
  });
}

export function useAdminBatchCancelUploadTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskIds: string[]) =>
      await adminHttp.post<{ data: AdminBatchCancelUploadResponse }>(
        '/admin/upload/cancel-batch',
        { taskIds },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'upload', 'tasks'],
      });
    },
  });
}

export function useAdminBatchDeleteFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      mode,
    }: {
      ids: number[];
      mode: 'trash' | 'purge';
    }) =>
      await adminHttp.post<{ data: AdminBatchFileDeleteResponse }>(
        '/admin/files/batch-delete',
        { ids, mode },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'files'] });
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'trash'] });
    },
  });
}

export function useAdminBatchPurgeTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) =>
      await adminHttp.post<{ data: AdminBatchFileDeleteResponse }>(
        '/admin/trash/batch-purge',
        { ids },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'trash'] });
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'files'] });
    },
  });
}

export function useAdminDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      mode,
    }: {
      id: number;
      mode: 'trash' | 'purge';
    }) =>
      await adminHttp.delete(`/admin/files/${id}`, {
        params: { mode },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'files'] });
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'trash'] });
    },
  });
}

export function useAdminTrash(params: {
  page: number;
  limit: number;
  keyword?: string;
  userId?: number;
}) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'trash', params],
    queryFn: async () =>
      await adminHttp.get<GetAdminTrashApiResponse>('/admin/trash', { params }),
    enabled: authed,
  });
}

export function useAdminShares(params: {
  page: number;
  limit: number;
  keyword?: string;
  userId?: number;
  status?: 'active' | 'revoked' | 'expired';
}) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'shares', params],
    queryFn: async () =>
      await adminHttp.get<GetAdminSharesApiResponse>('/admin/shares', {
        params,
      }),
    enabled: authed,
  });
}

export function useAdminPurgeTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.delete(`/admin/trash/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'trash'] });
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'files'] });
    },
  });
}

export function useAdminRestoreTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.post(`/admin/trash/${id}/restore`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'trash'] });
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'files'] });
    },
  });
}

export function useAdminRevokeShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      await adminHttp.post(`/admin/shares/${id}/revoke`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'shares'] });
    },
  });
}

export function useAdminUserLoginLogs(
  userId: number | null,
  params: { page: number; limit: number },
) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'users', userId, 'login-logs', params],
    queryFn: async () =>
      await adminHttp.get<GetAdminUserLoginLogsApiResponse>(
        `/admin/users/${userId}/login-logs`,
        { params },
      ),
    enabled: authed && !!userId,
  });
}

export function useAdminUser(userId: number | null, enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'users', userId, 'detail'],
    queryFn: async () =>
      await adminHttp.get<GetAdminUserApiResponse>(`/admin/users/${userId}`),
    enabled: authed && enabled && !!userId,
  });
}

export function useAdminUpdateUserQuota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      quotaBytes,
    }: {
      id: number;
      quotaBytes: number;
    }) =>
      await adminHttp.put<UpdateAdminUserQuotaApiResponse>(
        `/admin/users/${id}/quota`,
        { quotaBytes },
      ),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'users'] });
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'users', id, 'detail'],
      });
      await queryClient.invalidateQueries({ queryKey: [...adminKey, 'storage'] });
    },
  });
}

export function useAdminForbiddenWords(enabled = true) {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...adminKey, 'config', 'forbidden-words'],
    queryFn: async () =>
      await adminHttp.get<GetAdminForbiddenWordsApiResponse>(
        '/admin/config/forbidden-words',
      ),
    enabled: authed && enabled,
  });
}

export function useAdminUpdateForbiddenWords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (words: string[]) =>
      await adminHttp.put<UpdateAdminForbiddenWordsApiResponse>(
        '/admin/config/forbidden-words',
        { words },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...adminKey, 'config', 'forbidden-words'],
      });
    },
  });
}
