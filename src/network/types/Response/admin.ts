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
