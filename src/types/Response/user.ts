import { BaseResponse } from '.';

interface GetUserWithNameResponse {
  id: number;
  username: string;
  email: string;
  phone: string;
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

export type GetUserWithNameApiResponse = BaseResponse<GetUserWithNameResponse>;
export type AvatarUploadApiResponse = BaseResponse<null>;
export type GetUserAvatarApiResponse = BaseResponse<GetUserAvatarResponse>;
