// 分页查询参数
export interface FilePagesInfoRequest {
  page?: string;
  pageSize?: string;
}

// 批量删除文件请求（UUID 数组）
export type BatchDeleteFileRequest = string[];
