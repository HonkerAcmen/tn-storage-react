import { useCallback, useMemo } from 'react';
import {
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

  const removeDeletedFile = useCallback((fileId: string): void => {
    // setDeletedFiles((prev) => {
    //   const newDeletedFiles = prev.filter((item) => item.file.id !== fileId);
    //   saveDeletedFilesToStorage(newDeletedFiles);
    //   return newDeletedFiles;
    // });
  }, []);

  const clearDeletedFiles = useCallback((): void => {
    // setDeletedFiles([]);
    // saveDeletedFilesToStorage([]);
  }, []);

  return {
    deletedFiles: delList,
    addDeletedFile,
    removeDeletedFile,
    clearDeletedFiles,
  };
}
