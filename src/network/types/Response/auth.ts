import { BaseResponse } from '.';

interface LoginResponse {
  userId: number;
  username: string;
  email: string;
  token: string;
  expiresIn: string;
}

interface RegisterResponse {
  username: string;
  passoword: string;
  salt: string;
  id: number;
}

interface GetSaltResponse {
  salt: string;
}

interface ForgotPasswordResponse {
  message: string;
}

export type LoginApiResponse = BaseResponse<LoginResponse>;
export type GetSaltApiResponse = BaseResponse<GetSaltResponse>;
export type RegisterApiResponse = BaseResponse<RegisterResponse>;
export type ForgotPasswordApiResponse = BaseResponse<ForgotPasswordResponse>;
