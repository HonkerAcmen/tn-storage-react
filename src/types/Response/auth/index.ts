interface BaseResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: Date;
}

interface LoginResponse {
  userId: number;
  username: string;
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

export type LoginApiResponse = BaseResponse<LoginResponse>;
export type GetSaltApiResponse = BaseResponse<GetSaltResponse>;
export type RegisterApiResponse = BaseResponse<RegisterResponse>;
