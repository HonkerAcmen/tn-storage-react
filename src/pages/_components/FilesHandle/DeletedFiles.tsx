import { useState, useMemo } from 'react';
import type { JSX } from 'react';
import {
  Typography,
  Space,
  Tag,
  Empty,
  Button,
  message,
  Dropdown,
  Modal,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  AiFillFileExcel,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFileUnknown,
  AiFillFileZip,
  AiFillFolder,
  AiFillMuted,
  AiFillPlaySquare,
  AiOutlineFileImage,
  AiOutlineFileJpg,
  AiOutlineEllipsis,
  AiOutlineRest,
  AiOutlineDelete,
  AiOutlineInfoCircle,
  AiOutlineClockCircle,
} from 'react-icons/ai';
import { fileDatas } from '../../../mock/index';
import { FileSystemNode } from '../../../types/fileSystem';
import FileDetailsModal from './FileDetailsModal';

const { Text } = Typography;
const { confirm } = Modal;

// 文件图标映射
const ICON_SIZE_CLASS = 'h-6 w-6';
const FILE_ICON_MAP: Record<string, JSX.Element> = {
  txt: <AiFillFileText className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  pdf: <AiFillFilePdf className={`${ICON_SIZE_CLASS} text-red-400`} />,
  jpg: <AiOutlineFileJpg className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  png: <AiOutlineFileImage className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  mp4: <AiFillPlaySquare className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  mp3: <AiFillMuted className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  json: <AiFillFileText className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  zip: <AiFillFileZip className={`${ICON_SIZE_CLASS} text-amber-400`} />,
  doc: <AiFillFileText className={`${ICON_SIZE_CLASS} text-blue-400`} />,
  docx: <AiFillFileText className={`${ICON_SIZE_CLASS} text-blue-400`} />,
  xlsx: <AiFillFileExcel className={`${ICON_SIZE_CLASS} text-green-400`} />,
  other: <AiFillFileUnknown className={`${ICON_SIZE_CLASS} text-gray-400`} />,
};

// 已删除文件的数据结构
interface DeletedFileItem {
  file: FileSystemNode;
  deletedAt: Date;
}

// 从 localStorage 获取已删除文件列表
function getDeletedFilesFromStorage(): DeletedFileItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('deletedFiles');
  if (stored) {
    const parsed = JSON.parse(stored);
    // 将日期字符串转换回 Date 对象
    return parsed.map((item: DeletedFileItem) => ({
      file: {
        ...item.file,
        createdAt: new Date(item.file.createdAt),
        updatedAt: new Date(item.file.updatedAt),
      },
      deletedAt: new Date(item.deletedAt),
    }));
  }
  return [];
}

// 初始化默认已删除文件数据
function initializeDefaultDeletedFiles(): DeletedFileItem[] {
  if (typeof window === 'undefined') return [];
  const allFiles = getAllFiles(fileDatas);
  const defaultDeleted = allFiles.slice(0, 3).map((file) => ({
    file,
    deletedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 随机删除时间（最近7天内）
  }));
  saveDeletedFilesToStorage(defaultDeleted);
  return defaultDeleted;
}

// 保存已删除文件列表到 localStorage
function saveDeletedFilesToStorage(deletedFiles: DeletedFileItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('deletedFiles', JSON.stringify(deletedFiles));
}

// 递归获取所有文件
function getAllFiles(node: FileSystemNode): FileSystemNode[] {
  const files: FileSystemNode[] = [];

  if (node.type === 'file') {
    files.push(node);
  } else if (node.type === 'folder' && node.children) {
    node.children.forEach((child) => {
      files.push(...getAllFiles(child));
    });
  }

  return files;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 格式化删除时间
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
  // 初始化已删除文件列表
  const [deletedFiles, setDeletedFiles] = useState<DeletedFileItem[]>(() => {
    const stored = getDeletedFilesFromStorage();
    if (stored.length === 0) {
      return initializeDefaultDeletedFiles();
    }
    return stored;
  });

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // 按删除时间排序（最新的在前）
  const sortedDeletedFiles = useMemo(() => {
    return [...deletedFiles].sort(
      (a, b) => b.deletedAt.getTime() - a.deletedAt.getTime()
    );
  }, [deletedFiles]);

  // 处理文件更新
  const handleFileUpdate = (
    fileId: string,
    updates: Partial<FileSystemNode>
  ) => {
    message.success('文件信息已更新');
    console.log('更新文件:', fileId, updates);
  };

  // 恢复文件
  const handleRestore = (fileId: string) => {
    const newDeletedFiles = deletedFiles.filter(
      (item) => item.file.id !== fileId
    );
    setDeletedFiles(newDeletedFiles);
    saveDeletedFilesToStorage(newDeletedFiles);
    message.success('文件已恢复');
  };

  // 永久删除文件
  const handlePermanentDelete = (fileId: string, fileName: string) => {
    confirm({
      title: '确认永久删除',
      content: `确定要永久删除 "${fileName}" 吗？此操作无法撤销。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        const newDeletedFiles = deletedFiles.filter(
          (item) => item.file.id !== fileId
        );
        setDeletedFiles(newDeletedFiles);
        saveDeletedFilesToStorage(newDeletedFiles);
        message.success('文件已永久删除');
      },
    });
  };

  // 清空回收站
  const handleEmptyTrash = () => {
    confirm({
      title: '确认清空回收站',
      content: `确定要清空回收站吗？此操作将永久删除所有文件，无法撤销。`,
      okText: '确认清空',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        setDeletedFiles([]);
        saveDeletedFilesToStorage([]);
        message.success('回收站已清空');
      },
    });
  };

  // 处理文件操作
  const handleFileAction = (action: string, item: FileSystemNode) => {
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
  const getFileMenuItems = (item: FileSystemNode): MenuProps['items'] => {
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

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="ml-4">
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
        <ul className="flex flex-col space-y-2">
          {sortedDeletedFiles.map((deletedItem) => {
            const item = deletedItem.file;
            return (
              <li
                key={item.id}
                className="mb-2 flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {item.type === 'folder' ? (
                    <AiFillFolder className="h-8 w-8 text-amber-400" />
                  ) : (
                    <div className="text-gray-400">
                      {FILE_ICON_MAP[item.ext || ''] || FILE_ICON_MAP['other']}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <Space>
                      <Text className="text-gray-800">
                        {item.name}
                        {item.type === 'file' && item.ext ? `.${item.ext}` : ''}
                      </Text>
                      {item.type === 'file' && (
                        <Tag color="blue">{formatFileSize(item.size)}</Tag>
                      )}
                      {item.type === 'folder' && (
                        <Tag color="orange">文件夹</Tag>
                      )}
                    </Space>
                    <Space className="mt-1">
                      <Text type="secondary" className="text-xs">
                        <AiOutlineClockCircle className="mr-1 inline" />
                        {formatDeletedTime(deletedItem.deletedAt)}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        • 创建于 {formatTime(item.createdAt)}
                      </Text>
                    </Space>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                  <Dropdown
                    menu={{ items: getFileMenuItems(item) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={
                        <AiOutlineEllipsis className="h-5 w-5 text-gray-600" />
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center"
                    />
                  </Dropdown>
                </div>
              </li>
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
export function addToDeletedFiles(file: FileSystemNode): void {
  const deletedFiles = getDeletedFilesFromStorage();
  const deletedItem: DeletedFileItem = {
    file,
    deletedAt: new Date(),
  };
  deletedFiles.push(deletedItem);
  saveDeletedFilesToStorage(deletedFiles);
}

export function removeFromDeletedFiles(fileId: string): void {
  const deletedFiles = getDeletedFilesFromStorage();
  const newDeletedFiles = deletedFiles.filter(
    (item) => item.file.id !== fileId
  );
  saveDeletedFilesToStorage(newDeletedFiles);
}
