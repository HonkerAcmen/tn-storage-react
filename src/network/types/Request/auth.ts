export interface CaptchaPayload {
  captchaId?: string;
  captchaCode?: string;
}

export interface LoginRequest extends CaptchaPayload {
  email: string;
  password: string;
}

export interface RegisterRequest extends CaptchaPayload {
  username: string;
  password: string;
  email: string;
  phone: string;
}

export interface ForgotPasswordRequest {
  email: string;
  newPassword: string;
  challengeToken: string;
}
