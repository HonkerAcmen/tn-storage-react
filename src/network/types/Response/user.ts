import { BaseResponse } from '.';

interface GetUserWithNameResponse {
  id: number;
  username: string;
  email: string;
  phone: string;
  desc: string;
}

interface StorageSummaryResponse {
  totalFiles: number;
  totalFolders: number;
  favoriteCount: number;
  usedBytes: number;
  totalBytes: number;
  categories: {
    document: number;
    image: number;
    video: number;
    audio: number;
    other: number;
  };
}

export interface UserSettingsResponse {
  id: number;
  user_id: number;
  language: string;
  theme: string;
  auto_save: boolean;
  default_upload_parent_id: number;
  auto_clean_temp: boolean;
  two_factor_enabled: boolean;
  email_notification: boolean;
  upload_notification: boolean;
  share_notification: boolean;
  role: string;
  allow_file_upload: boolean;
  allow_file_download: boolean;
  allow_file_delete: boolean;
  allow_favorite: boolean;
  allow_share: boolean;
  permissions_customized: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface UserLoginHistoryResponse {
  id: number;
  user_id: number;
  ip: string | null;
  user_agent: string | null;
  loginAt: string;
}

export interface AdminUserRoleResponse {
  id: number;
  username: string;
  email: string;
  phone: string;
  desc: string;
  role: 'admin' | 'user' | 'viewer';
  account_status: 'active' | 'disabled';
  permissions: UserSettingsResponse;
}

interface GetUserAvatarResponse {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: {
    type: string;
    data: number[];
  };
}

type AvatarUploadResponse = object;

export interface InitAvatarUploadResponse {
  taskId: string;
  avatarUuid: string;
  totalChunks: number;
  bucket: string;
  message: string;
}

export interface UploadAvatarChunkResponse {
  taskId: string;
  avatarUuid: string;
  chunkIndex: number;
  receivedChunks: number;
  totalChunks: number;
  status: string;
}

export type InitAvatarUploadApiResponse = BaseResponse<InitAvatarUploadResponse>;
export type UploadAvatarChunkApiResponse = BaseResponse<UploadAvatarChunkResponse>;
type UpdateUserDataResponse = string;

export type GetUserWithNameApiResponse = BaseResponse<GetUserWithNameResponse>;
export type AvatarUploadApiResponse = BaseResponse<AvatarUploadResponse>;
export type GetUserAvatarApiResponse = BaseResponse<GetUserAvatarResponse>;
export type UpdateUserDataApiResponse = BaseResponse<UpdateUserDataResponse>;
export type GetUserStorageApiResponse = BaseResponse<StorageSummaryResponse>;
export type GetUserSettingsApiResponse = BaseResponse<UserSettingsResponse>;
export type UpdateUserSettingsApiResponse = BaseResponse<UserSettingsResponse>;
export type GetUserLoginHistoryApiResponse = BaseResponse<
  UserLoginHistoryResponse[]
>;
export type ChangePasswordApiResponse = BaseResponse<null>;
export type GetCloudAdminUsersApiResponse = BaseResponse<
  AdminUserRoleResponse[]
>;
