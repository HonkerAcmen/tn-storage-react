export interface UpdateUserDataRequest {
  username: string;
  email: string;
  phone: string;
  desc: string;
}

export interface UpdateUserSettingsRequest {
  language?: string;
  theme?: string;
  auto_save?: boolean;
  default_upload_parent_id?: number;
  auto_clean_temp?: boolean;
  two_factor_enabled?: boolean;
  email_notification?: boolean;
  upload_notification?: boolean;
  share_notification?: boolean;
  role?: string;
  allow_file_upload?: boolean;
  allow_file_download?: boolean;
  allow_file_delete?: boolean;
  allow_favorite?: boolean;
  allow_share?: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
