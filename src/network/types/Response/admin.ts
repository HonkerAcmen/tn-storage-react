import { BaseResponse } from '.';
import { AdminCloudUserResponse } from './user';

export interface AdminMetricsResponse {
  uptime: number;
  environment: string;
  version: string;
  memory: {
    processUsedMb: number;
    processTotalMb: number;
    systemUsedMb: number;
    systemTotalMb: number;
    usagePercent: number;
  };
  cpu: {
    loadAvg: number[];
    cores: number;
  };
  cache: {
    size: number;
    keys: number;
  };
  database: {
    status: 'ok' | 'error';
    latencyMs: number;
    host?: string;
    name?: string;
  };
  users: {
    total: number;
  };
  storage: {
    totalFiles: number;
    totalFolders: number;
    usedBytes: number;
    trashCount?: number;
    categories: {
      image: number;
      video: number;
      audio: number;
      document: number;
      other: number;
    };
  };
}

export interface AdminActivityResponse {
  uploadsByDay: Array<{ date: string; uploads: number; bytes: number }>;
  categoryBreakdown: Array<{ name: string; value: number }>;
}

export interface SiteStoragePolicy {
  mode: 'local' | 'oss';
  disk_total_bytes: number;
  user_pool_ratio: number;
  allocation_mode: string;
  warn_min_quota_bytes: number;
  warn_pool_usage_ratio: number;
  updated_at?: string;
}

export interface StoragePoolSnapshot {
  diskTotalBytes: number;
  reservedBytes: number;
  userPoolBytes: number;
  userPoolRatio: number;
  siteUsedBytes: number;
  userPoolFreeBytes: number;
  userPoolUsageRatio: number;
  activeUserCount: number;
  dynamicPerUserQuotaBytes: number;
}

export interface StorageAlert {
  code: 'POOL_USAGE_HIGH' | 'PER_USER_QUOTA_LOW' | 'POOL_NEARLY_FULL';
  level: 'warning' | 'critical';
  message: string;
}

export interface AdminStoragePolicyView {
  policy: SiteStoragePolicy;
  pool: StoragePoolSnapshot;
  alerts: StorageAlert[];
}

export interface AdminStorageOverviewResponse {
  totals: AdminMetricsResponse['storage'];
  pool?: StoragePoolSnapshot;
  policy?: SiteStoragePolicy;
  alerts?: StorageAlert[];
}

export type GetAdminStoragePolicyApiResponse =
  BaseResponse<AdminStoragePolicyView>;
export type UpdateAdminStoragePolicyApiResponse =
  BaseResponse<AdminStoragePolicyView>;
export type RebalanceStorageQuotasApiResponse = BaseResponse<{
  updatedUsers: number;
  perUserQuotaBytes: number;
}>;
export type GetAdminStorageAlertsApiResponse = BaseResponse<StorageAlert[]>;

export interface StorageBackendPublicView {
  id: number;
  name: string;
  provider_type: 'minio' | 's3';
  endpoint: string;
  port: number | null;
  region: string | null;
  use_ssl: boolean;
  force_path_style: boolean;
  role: 'active' | 'standby' | 'readonly';
  status: 'unknown' | 'connected' | 'error';
  status_message: string | null;
  is_builtin: boolean;
  has_credentials: boolean;
  last_tested_at: string | null;
  updated_at?: string;
}

export interface StorageBackendTestResult {
  success: boolean;
  message: string;
  bucketCount?: number;
}

export interface StorageBackendMutationResponse {
  backend: StorageBackendPublicView;
  test: StorageBackendTestResult;
}

export type GetAdminStorageBackendsApiResponse = BaseResponse<
  StorageBackendPublicView[]
>;
export type CreateAdminStorageBackendApiResponse =
  BaseResponse<StorageBackendMutationResponse>;
export type UpdateAdminStorageBackendApiResponse =
  BaseResponse<StorageBackendMutationResponse>;
export type TestAdminStorageBackendApiResponse =
  BaseResponse<StorageBackendMutationResponse>;
export type ActivateAdminStorageBackendApiResponse =
  BaseResponse<StorageBackendPublicView>;

export type StorageMigrationMode = 'migrate' | 'backup' | 'sync';
export type StorageMigrationJobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface StorageMigrationJobView {
  id: number;
  source_backend_id: number;
  target_backend_id: number;
  mode: StorageMigrationMode;
  status: StorageMigrationJobStatus;
  total_objects: number;
  copied_objects: number;
  copied_bytes: number;
  failed_objects: number;
  progress_percent: number;
  error_message: string | null;
  retention_expire_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface StorageRetentionView {
  id: number;
  backend_id: number;
  migration_job_id: number | null;
  migrated_at: string;
  purge_at: string;
  purged_at: string | null;
  manual_purge: boolean;
  remaining_label: string;
  expired: boolean;
}

export type GetAdminStorageMigrationsApiResponse = BaseResponse<
  StorageMigrationJobView[]
>;
export type GetAdminStorageMigrationApiResponse =
  BaseResponse<StorageMigrationJobView>;
export type CreateAdminStorageMigrationApiResponse =
  BaseResponse<StorageMigrationJobView>;
export type GetAdminStorageRetentionsApiResponse = BaseResponse<
  StorageRetentionView[]
>;
export type PurgeAdminStorageRetentionApiResponse = BaseResponse<{
  retention: StorageRetentionView;
  deletedObjects: number;
}>;

export interface AdminStorageUserItem {
  userId: number;
  username: string;
  email: string;
  fileCount: number;
  folderCount: number;
  usedBytes: number;
}

export type AdminUserItem = AdminCloudUserResponse;

export interface AdminUserDetailResponse extends AdminUserItem {
  storage: {
    usedBytes: number;
    quotaBytes: number;
    totalFiles: number;
    totalFolders: number;
  };
}

export type GetAdminUserApiResponse = BaseResponse<AdminUserDetailResponse>;
export type UpdateAdminUserQuotaApiResponse = BaseResponse<{
  userId: number;
  quotaBytes: number;
}>;

export interface AdminBackupJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  trigger?: 'manual' | 'scheduled';
  createdAt: string;
  finishedAt: string | null;
  outputDir: string;
  files: string[];
  message: string;
}

export interface AdminBackupScheduleConfig {
  enabled: boolean;
  cron: string;
  minioMirror: boolean;
  updatedAt: string;
  nextRunAt: string | null;
}

export type GetAdminMetricsApiResponse = BaseResponse<AdminMetricsResponse>;
export type GetAdminActivityApiResponse = BaseResponse<AdminActivityResponse>;
export type GetAdminStorageOverviewApiResponse =
  BaseResponse<AdminStorageOverviewResponse>;
export type GetAdminStorageUsersApiResponse = BaseResponse<
  AdminStorageUserItem[]
>;
export type GetAdminUsersApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminUserItem>
>;
export type GetAdminBackupJobsApiResponse = BaseResponse<AdminBackupJob[]>;
export type GetAdminBackupJobApiResponse = BaseResponse<AdminBackupJob | null>;
export type GetAdminBackupScheduleApiResponse =
  BaseResponse<AdminBackupScheduleConfig>;
export type TriggerAdminBackupApiResponse = BaseResponse<AdminBackupJob>;

export interface AdminBackupRestoreResult {
  jobId: string;
  tables: Array<{ name: string; rows: number }>;
  minio?: { objectCount: number };
  message: string;
}

export type RestoreAdminBackupApiResponse =
  BaseResponse<AdminBackupRestoreResult>;

export interface AdminFileItem {
  id: number;
  filename: string;
  UUID: string;
  mimetype: string;
  size: number;
  type: string;
  user_id: number;
  username: string;
  email: string;
  createdAt: string | null;
}

export interface AdminTrashItem {
  id: number;
  filename: string;
  UUID: string;
  mimetype: string;
  size: number;
  type: string;
  user_id: number;
  username: string;
  email: string;
  deletedAt: string | null;
}

export interface AdminShareItem {
  id: number;
  token: string;
  file_uuid: string;
  filename: string;
  user_id: number;
  username: string;
  email: string;
  status: 'active' | 'revoked' | 'expired';
  downloadCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string | null;
}

export interface AdminUserLoginLogItem {
  id: number;
  user_id: number;
  ip: string | null;
  user_agent: string | null;
  login_at: string;
}

export type GetAdminUserLoginLogsApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminUserLoginLogItem>
>;

export type GetAdminFilesApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminFileItem>
>;
export type GetAdminTrashApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminTrashItem>
>;

export interface AdminUploadTaskItem {
  taskId: string;
  userId: number;
  username: string;
  filename: string;
  mimetype: string;
  size: number;
  parentId: string;
  totalChunks: number;
  receivedChunkIndexes: number[];
  progress: number;
  resumable: boolean;
  status: string;
  lastActivityAt: string;
}

export interface AdminUploadTasksResponse {
  total: number;
  items: AdminUploadTaskItem[];
}

export type GetAdminUploadTasksApiResponse = BaseResponse<AdminUploadTasksResponse>;

export interface AdminBatchCancelUploadResponse {
  total: number;
  cancelled: number;
  results: Array<{
    taskId: string;
    status: string;
    cancelled: boolean;
  }>;
}

export interface AdminBatchFileDeleteResponse {
  total: number;
  succeeded: number;
  results: Array<{ id: number; ok: boolean; reason?: string }>;
}
export type GetAdminSharesApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminShareItem>
>;

export interface AdminAuthProfile {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  avatar: string | null;
  status: 'active' | 'disabled';
  role: 'super_admin' | 'admin' | 'operator';
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAuthLoginData {
  token: string;
  expiresIn: string;
  admin: AdminAuthProfile;
}

export type AdminAuthLoginApiResponse = BaseResponse<AdminAuthLoginData>;
export type AdminAuthMeApiResponse = BaseResponse<AdminAuthProfile>;

export interface AdminLoginLogItem {
  id: number;
  admin_id: number;
  admin_username: string;
  admin_email: string;
  ip: string | null;
  user_agent: string | null;
  success: boolean;
  message: string | null;
  login_at: string;
}

export interface AdminPaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type GetAdminStaffListApiResponse = BaseResponse<AdminAuthProfile[]>;
export type GetAdminLoginLogsApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminLoginLogItem>
>;

export interface AdminOpsOverviewResponse {
  cache: { size: number; keyCount: number };
  node: {
    uptime: number;
    pid: number;
    nodeVersion: string;
    environment: string;
  };
}

export interface AdminOpsMinioBucket {
  name: string;
  objectCount: number;
  totalBytes: number;
  creationDate: string | null;
}

export interface AdminOpsMinioResponse {
  status: 'ok' | 'error';
  buckets: AdminOpsMinioBucket[];
  totalObjects: number;
  totalBytes: number;
  error?: string;
}

export interface OssStorageOverviewResponse {
  backend: {
    id: number;
    name: string;
    endpoint: string;
    status: string;
    last_tested_at: string | null;
  };
  overview: AdminOpsMinioResponse;
}

export interface OssStorageBucketsResponse {
  backend: OssStorageOverviewResponse['backend'];
  buckets: AdminOpsMinioBucket[];
  totalObjects: number;
  totalBytes: number;
}

export type GetOssStorageOverviewApiResponse =
  BaseResponse<OssStorageOverviewResponse>;
export type GetOssStorageBucketsApiResponse =
  BaseResponse<OssStorageBucketsResponse>;

export interface AdminOpsConfigResponse {
  nodeEnv: string;
  port: string;
  host: string;
  database: {
    host?: string;
    port?: string;
    name?: string;
    username?: string;
  };
  minio: {
    endpoint?: string;
    port?: string;
    useSsl: boolean;
  };
  upload: {
    maxFileSize: number;
    allowedTypesConfigured: boolean;
  };
  cors: {
    origin?: string;
    credentials: boolean;
  };
  backup: {
    cron: string | null;
    minioMirror: boolean;
  };
}

export interface AdminAuditLogItem {
  id: number;
  admin_id: number;
  admin_username: string;
  admin_email: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  detail: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export type GetAdminOpsOverviewApiResponse =
  BaseResponse<AdminOpsOverviewResponse>;
export type GetAdminOpsMinioApiResponse = BaseResponse<AdminOpsMinioResponse>;
export type GetAdminOpsConfigApiResponse = BaseResponse<AdminOpsConfigResponse>;
export type ClearAdminCacheApiResponse = BaseResponse<{ cleared: number }>;
export type GetAdminAuditLogsApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminAuditLogItem>
>;

export interface AdminForbiddenWordsResponse {
  words: string[];
  updatedAt: string;
  configPath: string;
}

export type GetAdminForbiddenWordsApiResponse =
  BaseResponse<AdminForbiddenWordsResponse>;
export type UpdateAdminForbiddenWordsApiResponse =
  BaseResponse<AdminForbiddenWordsResponse>;
