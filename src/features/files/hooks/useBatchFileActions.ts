import { useCallback } from 'react';
import { message, Modal } from 'antd';
import http from '@/network/http';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import { useDownloadQueue } from '@/contexts/DownloadQueueContext';
import { queryClient } from '@/network/queryClient';

interface BatchTrashResult {
  succeeded: string[];
  failed: Array<{ UUID: string; reason: string }>;
}

export function useBatchFileActions() {
  const { enqueueDownloads } = useDownloadQueue();
  const [modal, modalContextHolder] = Modal.useModal();

  const batchMoveToTrash = useCallback(async (items: FileSystemTreeNode[]) => {
    if (items.length === 0) {
      return;
    }
    const res = await http.post<{ data: BatchTrashResult }>(
      '/file/trash/batch-move',
      {
        items: items.map((item) => ({
          UUID: item.UUID,
          type: item.type,
        })),
      },
    );
    const result = res.data.data;
    await queryClient.invalidateQueries({ queryKey: ['file', 'data', 'tree'] });
    await queryClient.invalidateQueries({ queryKey: ['file', 'data', 'trash'] });
    if (result.failed.length > 0) {
      message.warning(
        `已移入 ${result.succeeded.length} 项，失败 ${result.failed.length} 项`,
      );
    } else {
      message.success(`已将 ${result.succeeded.length} 项移入回收站`);
    }
    return result;
  }, []);

  const batchDeleteTrash = useCallback(async (items: FileSystemTreeNode[]) => {
    if (items.length === 0) {
      return;
    }
    const res = await http.post<{ data: BatchTrashResult }>(
      '/file/trash/batch-delete',
      {
        items: items.map((item) => ({
          UUID: item.UUID,
          type: item.type,
        })),
      },
    );
    const result = res.data.data;
    await queryClient.invalidateQueries({ queryKey: ['file', 'data', 'trash'] });
    if (result.failed.length > 0) {
      message.warning(
        `已删除 ${result.succeeded.length} 项，失败 ${result.failed.length} 项`,
      );
    } else {
      message.success(`已永久删除 ${result.succeeded.length} 项`);
    }
    return result;
  }, []);

  const confirmBatchMoveToTrash = useCallback(
    (items: FileSystemTreeNode[], onDone?: () => void) => {
      if (items.length === 0) {
        return;
      }
      modal.confirm({
        title: '移入回收站',
        content: `确定将选中的 ${items.length} 项移入回收站吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          await batchMoveToTrash(items);
          onDone?.();
        },
      });
    },
    [batchMoveToTrash, modal],
  );

  const confirmBatchDeleteTrash = useCallback(
    (items: FileSystemTreeNode[], onDone?: () => void) => {
      if (items.length === 0) {
        return;
      }
      modal.confirm({
        title: '永久删除',
        content: `确定永久删除选中的 ${items.length} 项吗？此操作无法撤销。`,
        okText: '永久删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          await batchDeleteTrash(items);
          onDone?.();
        },
      });
    },
    [batchDeleteTrash, modal],
  );

  const batchDownload = useCallback(
    (items: FileSystemTreeNode[]) => {
      const files = items.filter((item) => item.type === 'file');
      if (files.length === 0) {
        message.info('请选择要下载的文件');
        return;
      }
      enqueueDownloads(files);
      message.success(`已加入下载队列（${files.length} 个文件）`);
    },
    [enqueueDownloads],
  );

  return {
    modalContextHolder,
    batchMoveToTrash,
    batchDeleteTrash,
    confirmBatchMoveToTrash,
    confirmBatchDeleteTrash,
    batchDownload,
  };
}
