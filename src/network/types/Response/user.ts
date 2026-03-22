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
type UpdateUserDataResponse = string;

export type GetUserWithNameApiResponse = BaseResponse<GetUserWithNameResponse>;
export type AvatarUploadApiResponse = BaseResponse<AvatarUploadResponse>; // 头像上传
export type GetUserAvatarApiResponse = BaseResponse<GetUserAvatarResponse>;
export type UpdateUserDataApiResponse = BaseResponse<UpdateUserDataResponse>;
export type GetUserStorageApiResponse = BaseResponse<StorageSummaryResponse>;
