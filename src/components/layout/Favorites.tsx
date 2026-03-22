import { useState, useMemo } from 'react';
import { Empty, Button, message } from 'antd';
import { AiFillStar } from 'react-icons/ai';

import FileListItem from '@/components/FileListItem';
import {
  useFileActions,
  useFileMenu,
  useFavorites,
} from '@/features/files/hooks';
import { formatDate } from '@/utils/format/formatters';
import { useFileData } from '@/contexts/FileDataContext';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import FileDetailsModal from '../FilesHandle/FileDetailsModal';

export default function Favorites() {
  const [messageApi] = message.useMessage();
  const { favoriteIds, removeFavorite } = useFavorites();
  const { allFiles, updateFile } = useFileData();
  const { handleFolderNavigation } = useFileActions();
  const { getFileMenuItems } = useFileMenu();

  // 处理文件夹点击 - 导航到"所有文件"视图
  const handleFolderClick = (folderId: string) => {
    handleFolderNavigation(folderId, 'sub2');
  };

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemTreeNode | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  // 获取收藏的文件
  const favoriteFiles = useMemo(() => {
    return allFiles.filter((file) => favoriteIds.includes(file.UUID));
  }, [allFiles, favoriteIds]);

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

  // 取消收藏
  const handleUnfavorite = async (fileUUID: string) => {
    try {
      await removeFavorite(fileUUID);
      messageApi.success('已取消收藏');
    } catch {
      messageApi.error('取消收藏失败');
    }
  };

  return (
    <div className="ml-4">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-semibold text-[#2e2c34]">收藏</h1>
        <p className="mt-2 text-sm text-gray-500">
          查看和管理你收藏的文件和文件夹
        </p>
      </div>

      {favoriteFiles.length === 0 ? (
        <Empty
          description={
            <div>
              <p className="text-gray-500">还没有收藏任何文件</p>
              <p className="mt-2 text-sm text-gray-400">
                在文件列表中点击星标图标来收藏文件
              </p>
            </div>
          }
          className="py-12"
        />
      ) : (
        <ul className="mr-8 flex flex-col space-y-2">
          {favoriteFiles.map((item) => (
            <FileListItem
              key={item.id}
              file={item}
              menuItems={getFileMenuItems(item, {
                onDetailsOpen: (file: FileSystemTreeNode) => {
                  setSelectedFile(file);
                  setShowDetails(true);
                },
                onFolderNavigate: handleFolderClick,
              })}
              showSize
              showType
              showTime
              timeValue={`创建于 ${formatDate(new Date(item.createdAt))} • 修改于 ${formatDate(new Date(item.updatedAt))}`}
              actions={
                <Button
                  type="text"
                  icon={<AiFillStar className="h-5 w-5 text-amber-400" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleUnfavorite(item.UUID);
                  }}
                  className="flex items-center justify-center"
                />
              }
              onClick={() => {
                if (item.type === 'folder') {
                  handleFolderClick(item.id);
                }
              }}
            />
          ))}
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
