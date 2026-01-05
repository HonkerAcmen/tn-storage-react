import { BaseResponse } from '.';

interface GetUserWithNameResponse {
  id: number;
  username: string;
  email: string;
  phone: string;
}

export type GetUserWithNameApiResponse = BaseResponse<GetUserWithNameResponse>;
