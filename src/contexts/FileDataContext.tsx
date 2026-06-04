import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import { Input, Modal, message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import http from '@/network/http';

import {
  useGetFileSystemTree,
  usePushFileDataTrash,
} from '@/network/hooks/file';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { mapToList } from '@/utils/fileSystem/fileSystemUtils';
import FilePreviewModal from '@/components/FilesHandle/FilePreviewModal';
import FolderItem from '@/components/FilesHandle/FolderItem';

// --- 类型定义 ---

// 后端返回的原始数据格式
interface BackendTreeNode {
  id: string;
  UUID: string;
  filename: string;
  type: 'file' | 'folder';
  parent_id: number;
  size: string;
  ext: string;
  children?: BackendTreeNode[];
  createdAt: string;
  updatedAt: string;
}

interface FileDataContextType {
  fileTree: FileSystemTreeNode;
  allFiles: FileSystemTreeNode[]; // 扁平化的所有文件列表
  fileMap: Map<string, FileSystemTreeNode>;
  loading: boolean;

  updateFile: (
    fileId: string,
    updates: Partial<FileSystemTreeNode>
  ) => Promise<void>;
  openRenameDialog: (file: FileSystemTreeNode) => void;
  openPreviewDialog: (file: FileSystemTreeNode) => void;
  openTransferDialog: (
    file: FileSystemTreeNode,
    mode: 'move' | 'copy'
  ) => void;
  deleteFile: (UUID: string, type: string) => Promise<void>;
  refreshFiles: () => void;
}

// --- 常量与工具函数 ---

// 初始空根节点
const EMPTY_ROOT: FileSystemTreeNode = {
  id: '1',
  UUID: '0',
  parent_id: 0,
  size: '0',
  ext: 'other',
  filename: 'root',
  type: 'folder',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  children: [],
};

function cloneEmptyRoot(): FileSystemTreeNode {
  return {
    ...EMPTY_ROOT,
    children: [],
  };
}

/**
 * 转换后端数据格式到前端格式（纯函数）
 */
const transformTreeNode = (node: BackendTreeNode): FileSystemTreeNode => {
  return {
    id: String(node.id),
    UUID: node.UUID,
    filename: node.filename || 'Untitled', // 提供默认名
    type: node.type,
    parent_id: node.parent_id,
    size: node.size || '0',
    ext: node.ext || 'other',
    children: Array.isArray(node.children)
      ? node.children.map(transformTreeNode)
      : [],
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
};

function normalizeFileTreeData(
  rawData: FileSystemTreeNode | BackendTreeNode | Array<FileSystemTreeNode | BackendTreeNode>
): FileSystemTreeNode {
  if (!rawData) {
    return cloneEmptyRoot();
  }

  if (Array.isArray(rawData)) {
    const root = cloneEmptyRoot();
    root.children = rawData.map((node) => transformTreeNode(node as BackendTreeNode));
    return root;
  }

  const normalizedNode = transformTreeNode(rawData as BackendTreeNode);

  if (
    normalizedNode.type === 'folder' &&
    normalizedNode.parent_id === 0 &&
    normalizedNode.filename === 'root'
  ) {
    return normalizedNode;
  }

  const root = cloneEmptyRoot();
  root.children = [normalizedNode];
  return root;
}

/**
 * 构造缓存表
 * @param root 整个文件结构的根结点
 * @returns
 */
function buildFileMap(
  root: FileSystemTreeNode
): Map<string, FileSystemTreeNode> {
  const map = new Map<string, FileSystemTreeNode>();

  function transformation(root: FileSystemTreeNode) {
    if (!root) return;
    map.set(String(root.id), root);

    if ('children' in root && root.children) {
      root.children.forEach(transformation);
    }
  }

  transformation(root);
  return map;
}

// --- Context 定义 ---

const FileDataContext = createContext<FileDataContextType | undefined>(
  undefined
);

// --- Provider 组件 ---

export function FileDataProvider({ children }: { children: ReactNode }) {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const [renameTarget, setRenameTarget] = useState<FileSystemTreeNode | null>(
    null
  );
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<FileSystemTreeNode | null>(
    null
  );
  const [transferTarget, setTransferTarget] =
    useState<FileSystemTreeNode | null>(null);
  const [transferMode, setTransferMode] = useState<'move' | 'copy'>('move');
  const [transferTargetId, setTransferTargetId] = useState('1');
  const [transferTargetKey, setTransferTargetKey] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // 1. 获取数据
  const {
    data: fileSystemTreeData,
    isLoading,
    refetch,
  } = useGetFileSystemTree();
  const pushFileDataTrash = usePushFileDataTrash();

  // 2. 计算 fileTree (Memoized)
  const fileTree = useMemo(() => {
    const fstData = fileSystemTreeData?.data?.data;

    if (!fstData || (Array.isArray(fstData) && fstData.length <= 0)) {
      return EMPTY_ROOT;
    }

    return normalizeFileTreeData(fstData);
  }, [fileSystemTreeData]);

  // 初始化为文件映射表
  const fileMap = useMemo(() => buildFileMap(fileTree), [fileTree]);

  // 3. 计算 allFiles (Memoized)
  // 这里修正为 扁平化所有文件
  // 这里假设你需要所有文件用于搜索/统计。
  const allFiles = useMemo(() => {
    if (!fileTree || !fileTree.children) return [];

    // 将整个树（包括根节点或仅根节点的子节点）扁平化
    return mapToList(fileMap);
  }, [fileMap, fileTree]);

  // 4. 操作方法
  const updateFile = useCallback(
    async (fileId: string, updates: Partial<FileSystemTreeNode>) => {
      const target = fileMap.get(fileId);
      if (!target) {
        throw new Error('文件未找到');
      }

      if (updates.filename !== undefined) {
        const filename = updates.filename.trim();
        if (!filename) {
          throw new Error('文件名不能为空');
        }

        await http.put(`/file/rename/${target.UUID}`, {
          filename,
        });

        await queryClient.invalidateQueries({
          queryKey: ['file', 'data', 'tree'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['file', 'recent'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['file', 'favorite'],
        });
        await queryClient.refetchQueries({
          queryKey: ['file', 'data', 'tree'],
          type: 'active',
        });
        await queryClient.refetchQueries({
          queryKey: ['file', 'recent'],
          type: 'active',
        });
        await queryClient.refetchQueries({
          queryKey: ['file', 'favorite'],
          type: 'active',
        });
        return;
      }

      throw new Error('当前仅支持重命名操作');
    },
    [fileMap, queryClient]
  );

  const deleteFile = useCallback(
    async (UUID: string, type: string) =>
      new Promise<void>((resolve, reject) =>
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
                queryKey: ['file', 'favorite'],
              });
              queryClient.invalidateQueries({
                queryKey: ['file', 'recent'],
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
      ),
    [pushFileDataTrash, messageApi, queryClient]
  );

  const openRenameDialog = useCallback((file: FileSystemTreeNode) => {
    setRenameTarget(file);
    setRenameValue(file.filename);
  }, []);

  const openPreviewDialog = useCallback((file: FileSystemTreeNode) => {
    setPreviewTarget(file);
  }, []);

  const openTransferDialog = useCallback(
    (file: FileSystemTreeNode, mode: 'move' | 'copy') => {
      setTransferTarget(file);
      setTransferMode(mode);
      setTransferTargetId('1');
      setTransferTargetKey(fileTree.UUID);
    },
    [fileTree.UUID]
  );

  const handleRenameConfirm = useCallback(async () => {
    if (!renameTarget) {
      return;
    }

    const nextName = renameValue.trim();
    if (!nextName) {
      messageApi.error('文件名不能为空');
      return;
    }

    if (nextName === renameTarget.filename) {
      setRenameTarget(null);
      setRenameValue('');
      return;
    }

    try {
      setRenameLoading(true);
      await updateFile(renameTarget.id, { filename: nextName });
      messageApi.success('重命名成功');
      setRenameTarget(null);
      setRenameValue('');
    } catch (error) {
      const err = error as { message?: string };
      messageApi.error(err?.message || '重命名失败');
    } finally {
      setRenameLoading(false);
    }
  }, [messageApi, renameTarget, renameValue, updateFile]);

  const handleRenameCancel = useCallback(() => {
    setRenameTarget(null);
    setRenameValue('');
  }, []);

  const handleTransferCancel = useCallback(() => {
    setTransferTarget(null);
    setTransferTargetId('1');
    setTransferTargetKey(fileTree.UUID);
  }, [fileTree.UUID]);

  const handleTransferConfirm = useCallback(async () => {
    if (!transferTarget) {
      return;
    }

    try {
      setTransferLoading(true);
      await http.post(
        `/file/${transferMode}/${transferTarget.UUID}`,
        {
          targetParentId: Number(transferTargetId),
        }
      );

      await queryClient.invalidateQueries({
        queryKey: ['file', 'data', 'tree'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['file', 'recent'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['file', 'favorite'],
      });
      await queryClient.refetchQueries({
        queryKey: ['file', 'data', 'tree'],
        type: 'active',
      });
      await queryClient.refetchQueries({
        queryKey: ['file', 'recent'],
        type: 'active',
      });
      await queryClient.refetchQueries({
        queryKey: ['file', 'favorite'],
        type: 'active',
      });

      messageApi.success(transferMode === 'move' ? '移动成功' : '复制成功');
      handleTransferCancel();
    } catch (error) {
      const err = error as { message?: string };
      messageApi.error(
        err?.message || (transferMode === 'move' ? '移动失败' : '复制失败')
      );
    } finally {
      setTransferLoading(false);
    }
  }, [
    handleTransferCancel,
    messageApi,
    queryClient,
    transferMode,
    transferTarget,
    transferTargetId,
  ]);

  const refreshFiles = useCallback(() => {
    refetch();
  }, [refetch]);

  // 5. 构造 Context Value (Memoized)
  // 这一点很重要，否则每次 Provider 重渲染都会导致所有消费者重渲染
  const contextValue = useMemo<FileDataContextType>(
    () => ({
      fileTree,
      fileMap,
      allFiles,
      loading: isLoading,
      updateFile,
      openRenameDialog,
      openPreviewDialog,
      openTransferDialog,
      deleteFile,
      refreshFiles,
    }),
    [
      fileTree,
      fileMap,
      allFiles,
      isLoading,
      updateFile,
      openRenameDialog,
      openPreviewDialog,
      openTransferDialog,
      deleteFile,
      refreshFiles,
    ]
  );

  return (
    <FileDataContext.Provider value={contextValue}>
      {contextHolder}
      {children}
      <Modal
        open={Boolean(renameTarget)}
        title="重命名"
        okText="保存"
        cancelText="取消"
        onOk={() => void handleRenameConfirm()}
        onCancel={handleRenameCancel}
        confirmLoading={renameLoading}
        destroyOnHidden
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-500">
            为 {renameTarget?.type === 'folder' ? '文件夹' : '文件'} 设置新的名称。
          </p>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="请输入新的名称"
            autoFocus
            maxLength={255}
            onPressEnter={() => void handleRenameConfirm()}
          />
        </div>
      </Modal>
      <FilePreviewModal
        open={Boolean(previewTarget)}
        file={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />
      <Modal
        open={Boolean(transferTarget)}
        title={transferMode === 'move' ? '移动到文件夹' : '复制到文件夹'}
        okText={transferMode === 'move' ? '移动' : '复制'}
        cancelText="取消"
        onOk={() => void handleTransferConfirm()}
        onCancel={handleTransferCancel}
        confirmLoading={transferLoading}
        destroyOnHidden
        width={700}
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-500">
            {transferMode === 'move' ? '选择要移动到的目标文件夹。' : '选择要复制到的目标文件夹。'}
          </p>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 p-3">
            <ul>
              <FolderItem
                key={fileTree.UUID}
                item={fileTree}
                selectId={transferTargetId}
                selectKey={transferTargetKey}
                onSelect={(key: string) => setTransferTargetKey(key)}
                onSelectId={(id: string) => setTransferTargetId(id)}
              />
            </ul>
          </div>
        </div>
      </Modal>
    </FileDataContext.Provider>
  );
}

export function useFileData() {
  const context = useContext(FileDataContext);
  if (context === undefined) {
    throw new Error('useFileData must be used within a FileDataProvider');
  }
  return context;
}
