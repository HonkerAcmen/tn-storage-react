import { useCallback, useMemo } from 'react';
import {
  useDeleteAllTrash,
  useDeleteFile,
  useGetDelListInTrash,
  usePushFileDataTrash,
} from '@/network/hooks/file';
import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';

/**
 * 已删除文件管理 Hook
 */
export function useDeletedFiles() {
  const { data: delListData } = useGetDelListInTrash();
  const pushFileDataTrash = usePushFileDataTrash();
  const deleteAllTrash = useDeleteAllTrash();
  const deleteFile = useDeleteFile();

  const queryClient = useQueryClient();
  const messageApi = message;

  const delList = useMemo(() => {
    return Array.from(delListData?.data.data ?? []);
  }, [delListData]);

  const addDeletedFile = useCallback(
    (UUID: string) => {
      return new Promise<void>((resolve, reject) =>
        pushFileDataTrash.mutate(
          {
            srcBucket: DEFAULT_BUCKET,
            UUID,
          },
          {
            onSuccess: () => {
              messageApi.success('已移入回收站');
              // 使得查询失效，触发重新获取
              queryClient.invalidateQueries({
                queryKey: ['file', 'data', 'tree'],
              });
              queryClient.invalidateQueries({
                queryKey: ['file', 'data', 'trash'],
              });
              resolve();
            },

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
              const errorMsg = error?.message || '未知错误';
              messageApi.error(`删除失败: ${errorMsg}`);
              reject(error);
            },
          }
        )
      );
    },
    [pushFileDataTrash, queryClient, messageApi]
  );

  const removeDeletedFile = useCallback(
    (UUID: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        deleteFile.mutate(
          {
            bucket: 'trash',
            UUID,
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ['file', 'data', 'trash'],
              });
              resolve('已永久删除');
            },
            onError: (err) => {
              reject(err.message);
            },
          }
        );
      });
    },
    [deleteFile, queryClient]
  );

  /**
   * 清空回收站
   * 由调用方负责展示 message 提示
   */
  const clearDeletedFiles = useCallback(async (): Promise<void> => {
    await deleteAllTrash.mutateAsync('trash');
    queryClient.invalidateQueries({
      queryKey: ['file', 'data', 'trash'],
    });
  }, [deleteAllTrash, queryClient]);

  return {
    deletedFiles: delList,
    addDeletedFile,
    removeDeletedFile,
    clearDeletedFiles,
  };
}
