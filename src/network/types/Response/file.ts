import { BaseResponse } from '.';

// 文件树节点接口
export interface FileSystemTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  ext: string;
  createdAt: string;
  updatedAt: string;
  children: FileSystemTreeNode[];
}

// 文件树响应接口
export interface FileSystemTreeResponse {
  id: string;
  name: string;
  type: 'folder';
  children?: FileSystemTreeNode[];
  createdAt: string;
  updatedAt: string;
}

// 文件信息接口
export interface FileInfo {
  id: string;
  filename: string;
  UUID: string;
  mimetype: string;
  size: string;
  upload_time: string;
}

// 文件详细信息接口
export interface FileDetailInfo {
  UUID: string;
  filename: string;
  filetype: string;
  filesize: string;
}

// 分页查询文件信息响应
export interface FilePagesInfoResponse {
  list: FileInfo[];
  total: number;
}

// 上传任务创建响应
export interface UploadTaskResponse {
  taskId: string;
  message: string;
}

// 上传任务状态响应
export interface UploadStatusResponse {
  taskId: string;
  fileNum: number;
  uploadedFiles: number;
  status: string;
}

// 删除文件响应
export interface DeleteFileResponse {
  code: number;
  message: string;
  data: object;
  timestamp: string;
}

// 批量删除文件响应
export interface BatchDeleteFileResponse {
  code: number;
  message: string;
  data: null;
  timestamp: string;
}

// API 响应类型
export type GetDownloadTotalApiResponse = BaseResponse<Record<string, unknown>>;
export type GetUploadTotalApiResponse = BaseResponse<Record<string, unknown>>;
export type SetDownloadTotalApiResponse = BaseResponse<Record<string, unknown>>;
export type GetFilesTypeCountApiResponse = BaseResponse<
  Record<string, unknown>
>;
export type UploadFileApiResponse = BaseResponse<UploadTaskResponse>;
export type GetUploadStatusApiResponse = UploadStatusResponse;
export type GetFileApiResponse = BaseResponse<Record<string, unknown>>;
export type GetFilePagesInfoApiResponse = BaseResponse<FilePagesInfoResponse>;
export type GetFileInfoApiResponse = BaseResponse<FileDetailInfo>;
export type DeleteFileApiResponse = DeleteFileResponse;
export type BatchDeleteFileApiResponse = BaseResponse<BatchDeleteFileResponse>;
export type GetFileSystemTreeApiResponse = BaseResponse<FileSystemTreeResponse>;
export type PushFileDataTrashApiResponse = BaseResponse<object>;
