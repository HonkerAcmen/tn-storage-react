export interface BaseResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: Date;
}

export type ErrorResponse = BaseResponse<object>;
