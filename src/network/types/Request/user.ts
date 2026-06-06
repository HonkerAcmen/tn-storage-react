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
  download_concurrency?: number;
  download_rate_limit_kbps?: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  captchaId?: string;
  captchaCode?: string;
  challengeToken?: string;
}
