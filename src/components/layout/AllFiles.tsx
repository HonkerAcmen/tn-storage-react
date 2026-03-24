import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Empty, Button, message, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';

import {
  AiOutlineAppstore,
  AiOutlineCaretDown,
  AiOutlineMenu,
  AiFillStar,
  AiOutlineStar,
  AiOutlineEllipsis,
  AiFillFolder,
} from 'react-icons/ai';
import {
  getChildrenByParentId,
  findPathToNode,
} from '@/utils/fileSystem/fileSystemUtils';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import FileListItem from '@/components/FileListItem';

import { useFileActions, useFileMenu } from '@/features/files/hooks';
import { formatDate } from '@/utils/format/formatters';
import { useFileData } from '@/contexts/FileDataContext';
import {
  getFileIcon,
  ICON_SIZE_LARGE,
} from '@/components/FilesHandle/FileIcon';
import { Breadcrumb } from 'antd';
import FileDetailsModal from '../FilesHandle/FileDetailsModal';
import { useCreateFolder } from '@/network/hooks/file';
import { queryClient } from '@/network/queryClient';

interface MenuItemNameProps {
  key: number;
  name: string;
  icon: unknown;
}

type SortType = 'latest' | 'oldest' | 'name' | 'type';

export default function AllFiles() {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const { fileTree, updateFile, fileMap, openPreviewDialog } = useFileData();

  // 获取当前文件夹ID，如果没有则在根路径下显示根目录的直接子节点
  const currentFolderId = router.query.folderId as string | '1';

  // 0: 列表模式, 1: 网格模式
  const [seleRadioItem, setSeleRadioItem] = useState(1);

  const [MenuItemName, setMenuItemName] = useState<MenuItemNameProps>({
    key: 1,
    name: '最新添加',
    icon: <AiOutlineAppstore />,
  });

  const MenuItemsName: MenuItemNameProps[] = [
    { key: 1, name: '最新添加', icon: '' },
    { key: 2, name: '最旧添加', icon: '' },
    { key: 3, name: '名称', icon: '' },
    { key: 4, name: '类型', icon: '' },
  ];

  // 转换为 Dropdown 的 items 格式
  const sortMenuItems: MenuProps['items'] = MenuItemsName.map((item) => ({
    key: item.key.toString(),
    label: item.name,
    icon: item.icon as React.ReactNode,
    onClick: () => {
      setMenuItemName(item);
    },
  }));

  // 文件操作 hooks
  const fileActions = useFileActions();
  const fileMenu = useFileMenu();
  const {
    handleFileAction,
    handleFolderNavigation,
    handleBackToRoot,
    isFavorite,
  } = fileActions;
  const { getFileMenuItems } = fileMenu;

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemTreeNode | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPos, setActionMenuPos] = useState({
    x: 0,
    y: 0,
  });

  const activeMenuRef = useRef<HTMLDivElement>(null);

  const [showFolderNameInputElem, setShowFolderNameInputElem] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);

  const createFolder = useCreateFolder();

  const [confirmLoading, setConfirmLoading] = useState(false);
  // *************************函数定义区***************************** //

  // 获取当前要显示的文件列表
  const currentFiles = useMemo(() => {
    // 如果有 folderId，显示该文件夹的直接子节点
    if (currentFolderId) {
      return getChildrenByParentId(fileMap, currentFolderId);
    }
    // 否则显示根目录的直接子节点（不是所有文件）
    if (fileTree.type === 'folder' && fileTree.children) {
      return fileTree.children;
    }
    return [];
  }, [currentFolderId, fileMap, fileTree.children, fileTree.type]);

  // 计算面包屑路径
  const breadcrumbPath = useMemo(() => {
    if (!currentFolderId) return [];
    const path = findPathToNode(fileTree, currentFolderId);
    // 确保路径包含根目录，如果第一个节点不是根目录，则添加根目录
    if (path.length > 0 && path[0].id !== '1') {
      // 如果路径不包含根目录，我们需要找到根目录
      // 但通常 findPathToNode 应该总是从根开始，所以这里主要是确保逻辑正确
      return path;
    }
    return path;
  }, [fileTree, currentFolderId]);

  // 根据分组方式排序文件
  const sortedFiles = useMemo(() => {
    const files = [...currentFiles];
    const sortType: SortType =
      MenuItemName.key === 1
        ? 'latest'
        : MenuItemName.key === 2
          ? 'oldest'
          : MenuItemName.key === 3
            ? 'name'
            : 'type';

    switch (sortType) {
      case 'latest':
        return files.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return files.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'name':
        return files.sort((a, b) => {
          const nameA = a.filename.toLowerCase();
          const nameB = b.filename.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'type':
        return files.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
          }
          if (a.type === 'file' && b.type === 'file') {
            return (a.ext || '').localeCompare(b.ext || '');
          }
          return 0;
        });
      default:
        return files;
    }
  }, [currentFiles, MenuItemName.key]);

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

  // 处理文件夹点击 - 在当前页面进入文件夹
  const handleFolderClick = (folderId: string) => {
    handleFolderNavigation(folderId, 'sub2');
  };

  // 处理面包屑导航
  const handleBreadcrumbClick = (targetId: string) => {
    if (targetId === '1') {
      handleBackToRoot();
    } else {
      handleFolderClick(targetId);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setActionMenuPos({
      x: event.clientX,
      y: event.clientY,
    });
    setShowActionMenu(true);
  };

  const handleClick = (event: MouseEvent) => {
    if (
      activeMenuRef &&
      !activeMenuRef.current?.contains(event.target as Node)
    ) {
      setShowActionMenu(false); // 点击其他地方时隐藏菜单
    }
  };

  function handleFolderInputModal() {
    if (folderInputRef.current) {
      setConfirmLoading(true);
      createFolder.mutate(
        {
          foldername: folderInputRef.current.value,
          parent: currentFolderId ? currentFolderId : '1',
        },
        {
          onSuccess: (res) => {
            queryClient.invalidateQueries({
              queryKey: ['file', 'data', 'tree'],
            });
            messageApi.success(res.message);
            // 关闭加载状态
            setConfirmLoading(false);

            // 关闭文件夹模态框
            setShowFolderNameInputElem(false);

            // 清空输入栏数据
            if (folderInputRef.current) {
              folderInputRef.current.value = '';
            }
          },
          onError: (err) => {
            setConfirmLoading(false);
            // 判断err.message为一个object
            if (
              Object.prototype.toString.call(err.message) === '[object Object]'
            ) {
              messageApi.error('未知错误, 请稍后重试');
            } else {
              // 如果不是就是普通的字符串message
              messageApi.error(err.message);
            }
          },
        }
      );
    }
  }

  useEffect(() => {
    // 添加事件监听
    document.addEventListener('click', handleClick);

    // 清除事件监听
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      {contextHolder}
      <div className="relative ml-4 h-screen" onContextMenu={handleContextMenu}>
        {/* 头部 Header */}
        <div className="mt-4 mb-6 flex flex-row items-center justify-between">
          <div className="mb-4 flex flex-col">
            <p className="text-3xl font-semibold whitespace-nowrap text-[#2e2c34]">
              所有文件
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {currentFolderId
                ? '查看文件夹内容'
                : '查看和管理所有文件和文件夹'}
            </p>
          </div>

          <div className="mr-8 flex flex-row gap-6">
            {/* 列表/网格切换 */}
            <div className="flex h-10 w-20 items-center justify-center">
              <div
                onClick={() => setSeleRadioItem(0)}
                className={`flex h-full w-[50%] cursor-pointer items-center justify-center rounded-l-lg border border-gray-200 transition duration-150 hover:bg-gray-200 ${seleRadioItem === 0 ? 'bg-gray-100' : ''}`}
              >
                <AiOutlineMenu />
              </div>
              <div
                onClick={() => setSeleRadioItem(1)}
                className={`${seleRadioItem === 1 ? 'bg-gray-100' : ''} flex h-full w-[50%] cursor-pointer items-center justify-center rounded-r-lg border border-gray-200 transition duration-150 hover:bg-gray-200`}
              >
                <AiOutlineAppstore />
              </div>
            </div>

            {/* 分组方式选择 */}
            <Dropdown
              menu={{ items: sortMenuItems }}
              trigger={['click']}
              placement="bottomLeft"
            >
              <div className="flex w-64 cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-2 transition duration-150 hover:bg-gray-50">
                <p className="text-xs text-gray-500">
                  分组方式:{' '}
                  <span className="ml-2 text-sm text-gray-800">
                    {MenuItemName?.name}
                  </span>
                </p>
                <AiOutlineCaretDown className="text-gray-500" />
              </div>
            </Dropdown>
          </div>
        </div>

        {/* 面包屑导航 */}
        {currentFolderId && (
          <Breadcrumb
            className="mb-4 px-4"
            items={[
              {
                title: (
                  <span
                    onClick={() => handleBreadcrumbClick('1')}
                    className="cursor-pointer rounded-md border border-white px-2 py-1 transition hover:border-gray-200 hover:text-gray-600"
                  >
                    所有文件
                  </span>
                ),
              },
              ...breadcrumbPath
                .filter((node) => node.id !== '1')
                .map((node, index, filteredPath) => {
                  const isLast = index === filteredPath.length - 1;
                  return {
                    title: (
                      <span
                        onClick={() =>
                          !isLast && handleBreadcrumbClick(node.id)
                        }
                        className={
                          !isLast
                            ? 'cursor-pointer rounded-md border border-white px-2 py-1 transition hover:border-gray-200 hover:text-gray-600'
                            : 'cursor-pointer rounded-md border border-white bg-gray-200 px-2 py-1 text-gray-600 transition duration-150 hover:border-gray-200'
                        }
                      >
                        {node.filename}
                      </span>
                    ),
                  };
                }),
            ]}
          />
        )}

        {/* 内容区域 */}
        {seleRadioItem === 0 ? (
          // 列表模式
          sortedFiles.length === 0 ? (
            <Empty
              description={
                <div>
                  <p className="text-gray-500">暂无文件</p>
                  <p className="mt-2 text-sm text-gray-400">
                    上传文件后，文件将显示在这里
                  </p>
                </div>
              }
              className="py-12"
            />
          ) : (
            <ul className="mt-2 mr-8 flex flex-col space-y-2">
              {sortedFiles.map((item) => {
                const convertedItem = item;
                return (
                  <FileListItem
                    key={item.id}
                    file={convertedItem}
                    menuItems={getFileMenuItems(convertedItem, {
                      onDetailsOpen: () => {
                        setSelectedFile(item);
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
                        icon={
                          isFavorite(item.UUID) ? (
                            <AiFillStar className="h-5 w-5 text-amber-400" />
                          ) : (
                            <AiOutlineStar className="h-5 w-5 text-gray-400" />
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileAction('favorite', convertedItem, {
                            onDetailsOpen: () => {
                              setSelectedFile(item);
                              setShowDetails(true);
                            },
                            onFolderNavigate: handleFolderClick,
                          });
                        }}
                        className="flex items-center justify-center"
                      />
                    }
                    onClick={() => {
                      if (item.type === 'folder') {
                        handleFolderClick(item.id);
                      } else {
                        openPreviewDialog(item);
                      }
                    }}
                  />
                );
              })}
            </ul>
          )
        ) : // 网格模式
        sortedFiles.length === 0 ? (
          <Empty
            description={
              <div>
                <p className="text-gray-500">暂无文件</p>
                <p className="mt-2 text-sm text-gray-400">
                  上传文件后，文件将显示在这里
                </p>
              </div>
            }
            className="py-12"
          />
        ) : (
          <ul className="grid w-full grid-cols-2 gap-6 p-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {sortedFiles.map((item) => (
              <li
                key={item.id}
                className="group relative flex cursor-pointer flex-col items-center justify-start rounded-xl border border-transparent p-4 transition-all duration-200 hover:border-gray-200 hover:bg-gray-100"
                onClick={() => {
                  if (item.type === 'folder') {
                    handleFolderClick(item.id);
                  } else {
                    openPreviewDialog(item);
                  }
                }}
              >
                {/* 上方图标文字 */}
                <div className="mb-3 flex flex-col items-center justify-center">
                  {item.type === 'folder' ? (
                    <AiFillFolder
                      className={`${ICON_SIZE_LARGE} text-amber-400`}
                    />
                  ) : (
                    <div className="text-gray-400">
                      {getFileIcon(item.ext, 'large')}
                    </div>
                  )}
                  <span className="line-clamp-2 text-center text-sm break-all text-gray-700">
                    {item.filename}
                  </span>
                </div>

                {/* 下方收藏按钮和更多选项 */}
                <div className="flex flex-row justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="w-full px-2">
                    {/* 收藏按钮 */}
                    <div className="mt-2 flex items-center justify-center">
                      <Button
                        type="text"
                        size="small"
                        icon={
                          isFavorite(item.UUID) ? (
                            <AiFillStar className="h-4 w-4 text-amber-400" />
                          ) : (
                            <AiOutlineStar className="h-4 w-4 text-gray-400" />
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          const convertedItem = item;
                          handleFileAction('favorite', convertedItem, {
                            onDetailsOpen: () => {
                              setSelectedFile(item);
                              setShowDetails(true);
                            },
                            onFolderNavigate: handleFolderClick,
                          });
                        }}
                        className="flex items-center justify-center"
                      />
                    </div>
                  </div>

                  {/* 右下角功能按钮 */}
                  <div className="mt-2">
                    <Dropdown
                      menu={{
                        items: getFileMenuItems(item, {
                          onDetailsOpen: () => {
                            setSelectedFile(item);
                            setShowDetails(true);
                          },
                          onFolderNavigate: handleFolderClick,
                        }),
                        onClick: (e) => e.domEvent.stopPropagation(),
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={
                          <AiOutlineEllipsis className="h-4 w-4 text-gray-600" />
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center bg-white shadow-md hover:bg-gray-50"
                      />
                    </Dropdown>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 文件详情模态框 */}
        {selectedFile && (
          <FileDetailsModal
            open={showDetails}
            file={selectedFile}
            onClose={() => {
              setShowDetails(false);
              setSelectedFile(null);
            }}
            onUpdate={async (fileId, updates) => {
              const apiUpdates: Partial<FileSystemTreeNode> = {
                filename: updates.filename,
              };

              // 只在文件节点时添加这些属性
              if (selectedFile.type === 'file') {
                if ('ext' in updates && updates.ext !== undefined) {
                  apiUpdates.ext = updates.ext as string;
                }
                if ('size' in updates && updates.size !== undefined) {
                  apiUpdates.size = updates.size.toString();
                }
              }

              if (updates.createdAt) {
                apiUpdates.createdAt = updates.createdAt.toString();
              }
              if (updates.updatedAt) {
                apiUpdates.updatedAt = updates.updatedAt.toString();
              }

              await handleFileUpdate(fileId, apiUpdates);
            }}
          />
        )}

        {showActionMenu && (
          <div
            className="absolute flex h-10 w-40 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-800 transition duration-200 hover:border-gray-400"
            ref={activeMenuRef}
            style={{
              top: `${actionMenuPos.y - 75}px`, // 使用内联样式来设置动态位置
              left: `${actionMenuPos.x - 245}px`, // 使用内联样式来设置动态位置
              zIndex: 1000,
            }}
            onClick={() => setShowFolderNameInputElem(true)}
          >
            <div>新建文件夹</div>
          </div>
        )}

        <Modal
          title={'文件夹创建'}
          open={showFolderNameInputElem}
          onOk={handleFolderInputModal}
          okText={'确认'}
          cancelText={'取消'}
          confirmLoading={confirmLoading}
          onCancel={() => setShowFolderNameInputElem(false)}
        >
          {/* 中间 */}

          <input
            className="w-full rounded-lg border border-gray-200 p-2 text-sm tracking-wider text-gray-800"
            type="text"
            ref={folderInputRef}
          />
          {/* 足部 */}
        </Modal>
      </div>
    </>
  );
}
