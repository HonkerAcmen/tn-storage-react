import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import http from '@/network/http';
import {
  AddFavoriteApiResponse,
  CreateFolderApiResponse,
  CreateShareApiResponse,
  DeleteAllTrashApiResponse,
  DeleteFileApiResponse,
  GetDownloadTotalApiResponse,
  GetFavoritesApiResponse,
  GetFileApiResponse,
  GetFileInfoApiResponse,
  GetFilesTypeCountApiResponse,
  GetFileSystemTreeApiResponse,
  GetRecentsApiResponse,
  GetShareListApiResponse,
  GetUploadStatusApiResponse,
  GetUploadTotalApiResponse,
  getTrashFilesApiResponse,
  PushFileDataTrashApiResponse,
  RemoveFavoriteApiResponse,
  ReStoreApiResopnse,
  RevokeShareApiResponse,
  SetDownloadTotalApiResponse,
  UploadFileApiResponse,
} from '@/network/types/Response/file';
import { useAuthed } from '@/utils/auth';
import {
  getDownloadTotalPath,
  getFileInfoPath,
  getFilePath,
  getFilesTypeCountPath,
  getUploadStatusPath,
  getUploadTotalPath,
  setDownloadTotalPath,
  uploadFilePath,
} from '../resPath';
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
  const authed = useAuthed();
  return useQuery({
    queryKey: ['file', 'data', 'tree'],
    queryFn: async () => {
      const res = await http.get<GetFileSystemTreeApiResponse>('/file/tree');
      return res;
    },
    enabled: authed,
    staleTime: 0,
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
  const authed = useAuthed();
  return useQuery({
    queryKey: ['file', 'data', 'trash'],
    queryFn: async () =>
      await http.get<getTrashFilesApiResponse>('/file/trash'),
    enabled: authed,
  });
}

export function useGetFavorites() {
  const authed = useAuthed();
  return useQuery({
    queryKey: ['file', 'favorite'],
    queryFn: async () =>
      await http.get<GetFavoritesApiResponse>('/file/favorite'),
    enabled: authed,
  });
}

export function useGetRecents() {
  const authed = useAuthed();
  return useQuery({
    queryKey: ['file', 'recent'],
    queryFn: async () => await http.get<GetRecentsApiResponse>('/file/recent'),
    enabled: authed,
    staleTime: 0,
  });
}

export function useGetShares() {
  const authed = useAuthed();
  return useQuery({
    queryKey: ['file', 'share'],
    queryFn: async () => await http.get<GetShareListApiResponse>('/file/share'),
    enabled: authed,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

//////////////// 其他方法 POST DELETE PUT////////////////

interface createFolderProps {
  foldername: string;
  parent: string;
}

/**
 * 创建文件夹接口
 */
export function useCreateFolder() {
  return useMutation<CreateFolderApiResponse, ErrorResponse, createFolderProps>(
    {
      mutationFn: async ({ foldername, parent }: createFolderProps) => {
        const res = await http.post<CreateFolderApiResponse>(
          `/file/folder/create/${foldername}/${parent}`
        );
        return res.data;
      },
    }
  );
}

/**
 * 恢复文件接口
 */
export function useReStore() {
  return useMutation<
    ReStoreApiResopnse,
    ErrorResponse,
    { UUID: string; type: string }
  >({
    mutationFn: async ({ UUID, type }: { UUID: string; type: string }) => {
      const res = await http.post<ReStoreApiResopnse>(
        `/file/trash/restore/${UUID}/${type}`
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
  return useMutation<
    DeleteFileApiResponse,
    ErrorResponse,
    {
      bucket: string;
      UUID: string;
      type: string;
    }
  >({
    mutationFn: async ({
      bucket,
      UUID,
      type,
    }: {
      bucket: string;
      UUID: string;
      type: string;
    }) => {
      const res = await http.delete<DeleteFileApiResponse>(
        `/file/${bucket}/${UUID}/${type}`
      );
      return res.data;
    },
  });
}

export function usePushFileDataTrash() {
  return useMutation<
    PushFileDataTrashApiResponse,
    ErrorResponse,
    {
      srcBucket: string;
      UUID: string;
      type: string;
    }
  >({
    mutationFn: async ({
      srcBucket,
      UUID,
      type,
    }: {
      srcBucket: string;
      UUID: string;
      type: string;
    }) => {
      const res = await http.post<PushFileDataTrashApiResponse>(
        `/file/trash/move/${srcBucket}/${UUID}/${type}`
      );
      return res.data;
    },
  });
}

export function useAddFavorite() {
  return useMutation<AddFavoriteApiResponse, ErrorResponse, { UUID: string }>({
    mutationFn: async ({ UUID }) => {
      const res = await http.post<AddFavoriteApiResponse>(
        `/file/favorite/${UUID}`
      );
      return res.data;
    },
  });
}

export function useRemoveFavorite() {
  return useMutation<
    RemoveFavoriteApiResponse,
    ErrorResponse,
    { UUID: string }
  >({
    mutationFn: async ({ UUID }) => {
      const res = await http.delete<RemoveFavoriteApiResponse>(
        `/file/favorite/${UUID}`
      );
      return res.data;
    },
  });
}

export function useMarkRecentAccess() {
  return useMutation<unknown, ErrorResponse, { UUID: string }>({
    mutationFn: async ({ UUID }) => {
      const res = await http.post(`/file/recent/access/${UUID}`);
      return res.data;
    },
  });
}

export function useCreateShare() {
  return useMutation<CreateShareApiResponse, ErrorResponse, { UUID: string }>({
    mutationFn: async ({ UUID }) => {
      const res = await http.post<CreateShareApiResponse>(
        `/file/share/${UUID}`
      );
      return res.data;
    },
  });
}

export function useRevokeShare() {
  const queryClient = useQueryClient();
  return useMutation<RevokeShareApiResponse, ErrorResponse, { token: string }>({
    mutationFn: async ({ token }) => {
      const res = await http.delete<RevokeShareApiResponse>(
        `/file/share/${token}`
      );
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['file', 'share'],
      });
    },
  });
}
