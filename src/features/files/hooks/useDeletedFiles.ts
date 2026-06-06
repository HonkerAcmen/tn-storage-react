import { useCallback, useMemo } from 'react';
import {
  useDeleteAllTrash,
  useDeleteFile,
  useGetDelListInTrash,
  usePushFileDataTrash,
  useReStore,
} from '@/network/hooks/file';
import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { getApiErrorMessage } from '@/utils/apiError';

/**
 * 已删除文件管理 Hook
 */
export function useDeletedFiles() {
  const { data: delListData } = useGetDelListInTrash();
  const pushFileDataTrash = usePushFileDataTrash();
  const deleteAllTrash = useDeleteAllTrash();
  const deleteFile = useDeleteFile();
  const restore = useReStore();

  const queryClient = useQueryClient();
  const messageApi = message;

  const delList = useMemo(() => {
    return Array.from(delListData?.data.data ?? []);
  }, [delListData]);

  const addDeletedFile = useCallback(
    (UUID: string, type: string) => {
      return new Promise<void>((resolve, reject) =>
        pushFileDataTrash.mutate(
          {
            srcBucket: DEFAULT_BUCKET,
            UUID,
            type,
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

            onError: (error: unknown) => {
              const errorMsg = getApiErrorMessage(error, '未知错误');
              messageApi.error(`删除失败: ${errorMsg}`);
              reject(error);
            },
          }
        )
      );
    },
    [pushFileDataTrash, queryClient, messageApi]
  );

  const restoreFn = useCallback(
    (UUID: string, type: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        restore.mutate(
          { UUID, type },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ['file', 'data', 'tree'],
              });
              queryClient.invalidateQueries({
                queryKey: ['file', 'data', 'trash'],
              });
              queryClient.invalidateQueries({
                queryKey: ['file', 'favorite'],
              });
              queryClient.invalidateQueries({
                queryKey: ['file', 'recent'],
              });

              resolve('文件已恢复');
            },
            onError: (err) => {
              reject(getApiErrorMessage(err, '恢复失败'));
            },
          }
        );
      });
    },
    [queryClient, restore]
  );

  const removeDeletedFile = useCallback(
    (UUID: string, type: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        deleteFile.mutate(
          {
            bucket: 'trash',
            UUID,
            type,
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ['file', 'data', 'trash'],
              });
              queryClient.invalidateQueries({
                queryKey: ['file', 'favorite'],
              });
              queryClient.invalidateQueries({
                queryKey: ['file', 'recent'],
              });
              resolve('已永久删除');
            },
            onError: (err) => {
              reject(getApiErrorMessage(err, '删除失败'));
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
    queryClient.invalidateQueries({
      queryKey: ['file', 'favorite'],
    });
    queryClient.invalidateQueries({
      queryKey: ['file', 'recent'],
    });
  }, [deleteAllTrash, queryClient]);

  return {
    deletedFiles: delList,
    restoreFn,
    addDeletedFile,
    removeDeletedFile,
    clearDeletedFiles,
  };
}
