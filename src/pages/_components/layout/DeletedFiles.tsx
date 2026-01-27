import { useState, useMemo } from 'react';
import { Empty, Button, message, Modal } from 'antd';
import type { MenuProps } from 'antd';
import {
  AiOutlineRest,
  AiOutlineDelete,
  AiOutlineInfoCircle,
  AiOutlineClockCircle,
} from 'react-icons/ai';

import FileListItem from '@/components/FileListItem';
import { useDeletedFiles } from '@/features/files/hooks';
import { formatDate } from '@/utils/format/formatters';
import { useFileData } from '@/contexts/FileDataContext';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import FileDetailsModal from '../FilesHandle/FileDetailsModal';

/**
 * 格式化删除时间
 */
function formatDeletedTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚删除';
  if (minutes < 60) return `${minutes}分钟前删除`;
  if (hours < 24) return `${hours}小时前删除`;
  if (days < 7) return `${days}天前删除`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DeletedFiles() {
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const { deletedFiles, removeDeletedFile, clearDeletedFiles } =
    useDeletedFiles();
  const { updateFile } = useFileData();

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemTreeNode | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  // 按删除时间排序（最新的在前）
  const sortedDeletedFiles = useMemo(() => {
    return [...deletedFiles].sort(
      (a, b) => b.deletedAt.getTime() - a.deletedAt.getTime()
    );
  }, [deletedFiles]);

  // 处理文件更新
  const handleFileUpdate = async (
    fileId: string,
    updates: Partial<FileSystemTreeNode>
  ) => {
    try {
      await updateFile(fileId, updates);
      messageApi.success('文件信息已更新');
    } catch {
      messageApi.error('更新文件失败');
    }
  };

  // 恢复文件
  const handleRestore = (fileId: string) => {
    removeDeletedFile(fileId);
    messageApi.success('文件已恢复');
  };

  // 永久删除文件
  const handlePermanentDelete = (fileId: string, fileName: string) => {
    modal.confirm({
      title: '确认永久删除',
      content: `确定要永久删除 "${fileName}" 吗？此操作无法撤销。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        removeDeletedFile(fileId);
        messageApi.success('文件已永久删除');
      },
    });
  };

  // 清空回收站
  const handleEmptyTrash = () => {
    modal.confirm({
      title: '确认清空回收站',
      content: `确定要清空回收站吗？此操作将永久删除所有文件，无法撤销。`,
      okText: '确认清空',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        clearDeletedFiles();
        messageApi.success('回收站已清空');
      },
    });
  };

  // 处理文件操作
  const handleFileAction = (action: string, item: FileSystemTreeNode) => {
    switch (action) {
      case 'restore':
        handleRestore(item.id);
        break;
      case 'permanentDelete':
        handlePermanentDelete(item.id, item.name);
        break;
      case 'details':
        setSelectedFile(item);
        setShowDetails(true);
        break;
      default:
        break;
    }
  };

  // 获取文件操作菜单
  const getFileMenuItems = (item: FileSystemTreeNode): MenuProps['items'] => {
    return [
      {
        key: 'restore',
        label: (
          <div className="flex items-center space-x-2">
            <AiOutlineRest className="h-4 w-4" />
            <span>恢复</span>
          </div>
        ),
        onClick: () => handleFileAction('restore', item),
      },
      {
        key: 'details',
        label: (
          <div className="flex items-center space-x-2">
            <AiOutlineInfoCircle className="h-4 w-4" />
            <span>查看详情</span>
          </div>
        ),
        onClick: () => handleFileAction('details', item),
      },
      {
        type: 'divider',
      },
      {
        key: 'permanentDelete',
        label: (
          <div className="flex items-center space-x-2 text-red-500">
            <AiOutlineDelete className="h-4 w-4" />
            <span>永久删除</span>
          </div>
        ),
        danger: true,
        onClick: () => handleFileAction('permanentDelete', item),
      },
    ];
  };

  return (
    <div className="ml-4">
      {messageContextHolder}
      {modalContextHolder}
      <div className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#2e2c34]">已删除文件</h1>
          <p className="mt-2 text-sm text-gray-500">
            查看和管理已删除的文件和文件夹，可以恢复或永久删除
          </p>
        </div>
        {sortedDeletedFiles.length > 0 && (
          <Button
            danger
            icon={<AiOutlineDelete />}
            onClick={handleEmptyTrash}
            className="mr-8"
          >
            清空回收站
          </Button>
        )}
      </div>

      {sortedDeletedFiles.length === 0 ? (
        <Empty
          description={
            <div>
              <p className="text-gray-500">回收站是空的</p>
              <p className="mt-2 text-sm text-gray-400">
                已删除的文件会显示在这里，你可以恢复或永久删除它们
              </p>
            </div>
          }
          className="py-12"
        />
      ) : (
        <ul className="mr-8 flex flex-col space-y-2">
          {sortedDeletedFiles.map((deletedItem, index) => {
            const item = deletedItem.file;
            // 使用组合 key 确保唯一性：文件 ID + 删除时间戳 + 索引
            const uniqueKey = `${item.id}-${deletedItem.deletedAt.getTime()}-${index}`;
            return (
              <FileListItem
                key={uniqueKey}
                file={item}
                menuItems={getFileMenuItems(item)}
                showSize
                showType
                showTime
                timeValue={
                  <>
                    <AiOutlineClockCircle className="mr-1 inline" />
                    {formatDeletedTime(deletedItem.deletedAt)} • 创建于{' '}
                    {formatDate(new Date(item.createdAt))}
                  </>
                }
                actions={
                  <Button
                    type="text"
                    icon={<AiOutlineRest className="h-5 w-5 text-blue-500" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(item.id);
                    }}
                    className="flex items-center justify-center"
                  >
                    恢复
                  </Button>
                }
                onClick={() => {
                  // 点击已删除的文件或文件夹时，打开详情
                  setSelectedFile(item);
                  setShowDetails(true);
                }}
              />
            );
          })}
        </ul>
      )}

      {/* 文件详情模态框 */}
      <FileDetailsModal
        open={showDetails}
        file={selectedFile}
        onClose={() => {
          setShowDetails(false);
          setSelectedFile(null);
        }}
        onUpdate={handleFileUpdate}
      />
    </div>
  );
}

// 导出删除文件相关的工具函数，供其他组件使用
export { useDeletedFiles, type DeletedFileItem } from '@/features/files/hooks';
