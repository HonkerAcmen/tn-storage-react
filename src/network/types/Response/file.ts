import { BaseResponse } from '.';

// 文件树节点接口
export interface FileSystemTreeNode {
  id: string;
  UUID: string;
  filename: string;
  type: 'file' | 'folder';
  parent_id: number;
  size: string;
  ext: string;
  children?: FileSystemTreeNode[];
  createdAt: string;
  updatedAt: string;
}
export interface DeletedList extends FileSystemTreeNode {
  deletedAt: string;
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

export interface MultipartUploadInitResponse {
  taskId: string;
  UUID: string;
  totalChunks: number;
  message: string;
}

export interface MultipartUploadChunkResponse {
  taskId: string;
  chunkIndex: number;
  receivedChunks: number;
  totalChunks: number;
  status: string;
}

// 上传任务状态响应
export interface UploadStatusResponse {
  taskId: string;
  fileNum: number;
  uploadedFiles: number;
  status: string;
}

export interface FileChunkManifest {
  UUID: string;
  filename: string;
  mimetype: string;
  totalChunks: number;
}

export interface RecentFileRecord {
  UUID: string;
  time: string | null;
}

export interface RecentFileResponse {
  recent: RecentFileRecord[];
  created: RecentFileRecord[];
  modified: RecentFileRecord[];
}

export interface ShareFileResponse {
  token: string;
  url: string;
  expiresAt: string | null;
}

export interface ShareRecordResponse {
  token: string;
  file_uuid: string;
  bucket: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  downloadCount: number;
  lastAccessAt: string | null;
  file: FileSystemTreeNode | null;
}

// 批量删除文件响应
export interface BatchDeleteFileResponse {
  code: number;
  message: string;
  data: null;
  timestamp: string;
}

// 获取垃圾桶全部数据响应
type getTrashFilesResponse = DeletedList[];

// 全部删除垃圾桶数据接口类型
type DeleteAllTrashResponse = object;

// 单独删除垃圾桶数据接口类型
type DeleteFileResponse = object;

// 恢复垃圾桶数据接口类型
type ReStoreResponse = object;
type FavoriteListResponse = string[];
type FavoriteMutationResponse = object;

// 新建文件数据接口类型
interface CreateFolderResponse {
  filename: string;
  UUID: string;
  type: 'folder';
  parent_id: number;
  id: string;
  updatedAt: string;
  createdAt: string;
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
export type InitMultipartUploadApiResponse =
  BaseResponse<MultipartUploadInitResponse>;
export type UploadChunkApiResponse = BaseResponse<MultipartUploadChunkResponse>;
export type GetFileApiResponse = BaseResponse<Record<string, unknown>>;
export type GetFileChunkManifestApiResponse = BaseResponse<FileChunkManifest>;
export type GetRecentsApiResponse = BaseResponse<RecentFileResponse>;
export type CreateShareApiResponse = BaseResponse<ShareFileResponse>;
export type GetShareListApiResponse = BaseResponse<ShareRecordResponse[]>;
export type RevokeShareApiResponse = BaseResponse<null>;
export type GetFilePagesInfoApiResponse = BaseResponse<FilePagesInfoResponse>;
export type GetFileInfoApiResponse = BaseResponse<FileDetailInfo>;

export type BatchDeleteFileApiResponse = BaseResponse<BatchDeleteFileResponse>;
export type GetFileSystemTreeApiResponse = BaseResponse<
  FileSystemTreeNode | FileSystemTreeNode[]
>;
export type PushFileDataTrashApiResponse = BaseResponse<object>;
export type getTrashFilesApiResponse = BaseResponse<getTrashFilesResponse>;
export type DeleteAllTrashApiResponse = BaseResponse<DeleteAllTrashResponse>;
export type DeleteFileApiResponse = BaseResponse<DeleteFileResponse>;
export type ReStoreApiResopnse = BaseResponse<ReStoreResponse>;
export type CreateFolderApiResponse = BaseResponse<CreateFolderResponse>;
export type GetFavoritesApiResponse = BaseResponse<FavoriteListResponse>;
export type AddFavoriteApiResponse = BaseResponse<FavoriteMutationResponse>;
export type RemoveFavoriteApiResponse = BaseResponse<FavoriteMutationResponse>;
