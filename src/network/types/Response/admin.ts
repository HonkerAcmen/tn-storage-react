import { BaseResponse } from '.';
import { AdminUserRoleResponse } from './user';

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

export interface AdminStorageOverviewResponse {
  totals: AdminMetricsResponse['storage'];
}

export interface AdminStorageUserItem {
  userId: number;
  username: string;
  email: string;
  fileCount: number;
  folderCount: number;
  usedBytes: number;
}

export type AdminUserItem = AdminUserRoleResponse;

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

export type GetAdminFilesApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminFileItem>
>;
export type GetAdminTrashApiResponse = BaseResponse<
  AdminPaginatedResponse<AdminTrashItem>
>;
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
