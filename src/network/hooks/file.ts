import { useMutation, useQuery } from '@tanstack/react-query';
import http from '@/network/http';
import {
  BatchDeleteFileApiResponse,
  DeleteAllTrashApiResponse,
  DeleteFileApiResponse,
  GetDownloadTotalApiResponse,
  GetFileApiResponse,
  GetFileInfoApiResponse,
  GetFilesTypeCountApiResponse,
  GetFileSystemTreeApiResponse,
  getTrashFilesApiResponse,
  GetUploadStatusApiResponse,
  GetUploadTotalApiResponse,
  PushFileDataTrashApiResponse,
  ReStoreApiResopnse,
  SetDownloadTotalApiResponse,
  UploadFileApiResponse,
} from '@/network/types/Response/file';
import {
  batchDeleteFilePath,
  getDownloadTotalPath,
  getFileInfoPath,
  getFilePath,
  getFilesTypeCountPath,
  getUploadStatusPath,
  getUploadTotalPath,
  setDownloadTotalPath,
  uploadFilePath,
} from '../resPath';
import { BatchDeleteFileRequest } from '@/network/types/Request/file';
import { ErrorResponse } from '../types/Response';

//////////////// Get 方法 / Query方法 ////////////////

/**
 * 获取每日下载量统计数据
 */
export function useGetDownloadTotal() {
  return useQuery<GetDownloadTotalApiResponse, ErrorResponse>({
    queryKey: ['file', 'download', 'total'],
    queryFn: async () => {
      const res =
        await http.get<GetDownloadTotalApiResponse>(getDownloadTotalPath);
      return res.data;
    },
  });
}

/**
 * 获取文件树
 * @returns
 */
export function useGetFileSystemTree() {
  return useQuery({
    queryKey: ['file', 'data', 'tree'],
    queryFn: async () => {
      const res = await http.get<GetFileSystemTreeApiResponse>('/file/tree');
      return res;
    },
  });
}

/**
 * 获取上传总数
 */
export function useGetUploadTotal() {
  return useQuery<GetUploadTotalApiResponse, ErrorResponse>({
    queryKey: ['file', 'upload', 'total'],
    queryFn: async () => {
      const res = await http.get<GetUploadTotalApiResponse>(getUploadTotalPath);
      return res.data;
    },
  });
}

/**
 * 设置某日下载的数量
 */
export function useSetDownloadTotal() {
  return useMutation<SetDownloadTotalApiResponse, ErrorResponse>({
    mutationFn: async () => {
      const res =
        await http.get<SetDownloadTotalApiResponse>(setDownloadTotalPath);
      return res.data;
    },
  });
}

/**
 * 获取不同文件类型的数量统计
 */
export function useGetFilesTypeCount() {
  return useQuery<GetFilesTypeCountApiResponse, ErrorResponse>({
    queryKey: ['file', 'upload', 'typeTotal'],
    queryFn: async () => {
      const res = await http.get<GetFilesTypeCountApiResponse>(
        getFilesTypeCountPath
      );
      return res.data;
    },
  });
}

/**
 * 查询上传任务状态
 */
export function useGetUploadStatus(taskId: string) {
  return useQuery({
    queryKey: ['file', 'upload', 'status', taskId],
    queryFn: async () => {
      const res = await http.get<GetUploadStatusApiResponse>(
        `${getUploadStatusPath}/${taskId}`
      );
      return res;
    },
    enabled: !!taskId,
    refetchInterval: (query) => {
      // 如果状态不是 completed，每 2 秒轮询一次
      // query.state.data 是 AxiosResponse<GetUploadStatusApiResponse>
      // query.state.data.data 是 GetUploadStatusApiResponse (BaseResponse<UploadStatusResponse>)
      // query.state.data.data.data 是 UploadStatusResponse
      const response = query.state.data;
      if (!response) return 2000;
      const status = response.data?.status;
      return status === 'completed' ? false : 2000;
    },
  });
}

/**
 * 文件下载接口
 */
export function useGetFile(bucket: string, id: string, enabled = true) {
  return useQuery({
    queryKey: ['file', 'data', bucket, id],
    queryFn: async () => {
      const res = await http.get<GetFileApiResponse>(
        `${getFilePath}/${bucket}/${id}`,
        {
          responseType: 'blob', // 下载文件需要使用 blob
        }
      );
      return res;
    },
    enabled: enabled && !!bucket && !!id,
  });
}

/**
 * 获取单个文件的详细信息
 */
export function useGetFileInfo(UUID: string) {
  return useQuery({
    queryKey: ['file', 'info', UUID],
    queryFn: async () => {
      const res = await http.get<GetFileInfoApiResponse>(
        `${getFileInfoPath}/${UUID}`
      );
      return res;
    },
    enabled: !!UUID,
  });
}

export function useGetDelListInTrash() {
  return useQuery({
    queryKey: ['file', 'data', 'trash'],
    queryFn: async () =>
      await http.get<getTrashFilesApiResponse>('/file/trash'),
  });
}

//////////////// 其他方法 ////////////////

/**
 * 恢复文件接口
 */
export function useReStore() {
  return useMutation<ReStoreApiResopnse, ErrorResponse, string>({
    mutationFn: async (UUID: string) => {
      const res = await http.post<ReStoreApiResopnse>(
        `/file/trash/restore/${UUID}`
      );

      return res.data;
    },
  });
}

/**
 * 清空垃圾桶
 */
export function useDeleteAllTrash() {
  return useMutation<DeleteAllTrashApiResponse, ErrorResponse, string>({
    mutationFn: async (bucketName: string) => {
      const res = await http.delete<DeleteAllTrashApiResponse>(
        `/file/trash/empty/${bucketName}`
      );

      return res.data;
    },
  });
}

/**
 * 上传文件到指定桶
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({
      bucket,
      parentid,
      files,
    }: {
      bucket: string;
      parentid: number;
      files: File[];
    }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file, encodeURIComponent(file.name));
      });

      const res = await http.post<UploadFileApiResponse>(
        `${uploadFilePath}/${bucket}/${parentid}`,
        formData,
        {
          headers: {
            'Accept-Charset': 'utf-8',
          },
        }
      );
      return res;
    },
  });
}

/**
 * 删除单个文件
 */
export function useDeleteFile() {
  return useMutation({
    mutationFn: async ({ bucket, UUID }: { bucket: string; UUID: string }) =>
      await http.delete<DeleteFileApiResponse>(`/file/${bucket}/${UUID}`),
  });
}

/**
 * 批量删除文件
 */
export function useBatchDeleteFile() {
  return useMutation({
    mutationFn: async ({
      bucket,
      UUIDs,
    }: {
      bucket: string;
      UUIDs: BatchDeleteFileRequest;
    }) => {
      try {
        const res = await http.delete<BatchDeleteFileApiResponse>(
          `${batchDeleteFilePath}/${bucket}`,
          {
            data: UUIDs,
          }
        );
        // message 提示由调用方处理
        return res;
      } catch {
        // message 提示由调用方处理
        throw new Error('Batch delete failed');
      }
    },
  });
}

export function usePushFileDataTrash() {
  return useMutation({
    mutationFn: async ({
      srcBucket,
      UUID,
    }: {
      srcBucket: string;
      UUID: string;
    }) =>
      await http.post<PushFileDataTrashApiResponse>(
        `/file/trash/move/${srcBucket}/${UUID}`
      ),
  });
}
