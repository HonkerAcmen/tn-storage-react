import { useState, useMemo } from 'react';
import { Button, Dropdown, Empty, message } from 'antd';
import {
  AiFillCustomerService,
  AiFillFile,
  AiFillFileText,
  AiFillFolder,
  AiFillPicture,
  AiFillPlaySquare,
  AiFillStar,
  AiOutlineEllipsis,
} from 'react-icons/ai';
import EChart from '@/components/Echart';
import { useFileData } from '@/contexts/FileDataContext';
import { useFileActions, useFileMenu } from '@/features/files/hooks';
import { formatDate, formatFileSize } from '@/utils/format/formatters';
import { getFileIcon } from '@/components/FilesHandle/FileIcon';
import { useGetRecents } from '@/network/hooks/file';

import type { FileSystemTreeNode } from '@/network/types/Response/file';
import type { TopLevelFormatterParams } from 'echarts/types/dist/shared';
import FileDetailsModal from '../FilesHandle/FileDetailsModal';
import { FILE_TYPE_MAP } from '@/utils/fileUtils';

function SectionEmptyState({ description }: { description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-10">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span className="text-sm text-gray-500">{description}</span>
        }
      />
    </div>
  );
}

export default function MyCloud() {
  const [messageApi, contextHolder] = message.useMessage();
  const { allFiles, updateFile, openPreviewDialog } = useFileData();
  const { handleFolderNavigation, isFavorite } = useFileActions();
  const { getFileMenuItems } = useFileMenu();
  const { data: recentsData } = useGetRecents();

  // 详情模态框状态
  const [selectedFile, setSelectedFile] = useState<FileSystemTreeNode | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

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

  // 处理文件夹点击 - 导航到"所有文件"视图
  const handleFolderClick = (folderId: string) => {
    handleFolderNavigation(folderId, 'sub2');
  };

  // 获取最近上传的文件（按创建时间排序，取前4个）
  const recentlyUploaded = useMemo(() => {
    const fileByUUID = new Map(allFiles.map((file) => [file.UUID, file]));
    const createdUUIDs = recentsData?.data.data.created ?? [];
    return createdUUIDs
      .map((uuid) => fileByUUID.get(uuid))
      .filter((item): item is NonNullable<typeof item> => !!item)
      .slice(0, 4);
  }, [allFiles, recentsData]);

  // 获取收藏的文件（取前3个）
  const favoriteFiles = useMemo(() => {
    return allFiles.filter((file) => isFavorite(file.UUID)).slice(0, 3);
  }, [allFiles, isFavorite]);

  // 根据实际文件数据计算存储统计
  const saveData = useMemo(() => {
    // 只统计文件，不包括文件夹
    const files = allFiles.filter((item) => item.type === 'file');

    // 统计各类文件
    const stats = {
      document: { count: 0, size: 0 },
      image: { count: 0, size: 0 },
      video: { count: 0, size: 0 },
      audio: { count: 0, size: 0 },
      other: { count: 0, size: 0 },
    };

    files.map((file) => {
      const fileSize = parseInt(file.size) || 0;
      const fileExtName = file.filename
        .split('.')
        [file.filename.split('.').length - 1].toLocaleLowerCase()
        .trim();

      if (!fileExtName) {
        stats.other.count++;
        stats.other.size += fileSize;
        return;
      }

      if (FILE_TYPE_MAP['documentExts'].includes(fileExtName)) {
        stats.document.count++;
        stats.document.size += fileSize;
      } else if (FILE_TYPE_MAP['imageExts'].includes(fileExtName)) {
        stats.image.count++;
        stats.image.size += fileSize;
      } else if (FILE_TYPE_MAP['videoExts'].includes(fileExtName)) {
        stats.video.count++;
        stats.video.size += fileSize;
      } else if (FILE_TYPE_MAP['audioExts'].includes(fileExtName)) {
        stats.audio.count++;
        stats.audio.size += fileSize;
      } else {
        stats.other.count++;
        stats.other.size += fileSize;
      }
    });

    return [
      {
        key: 1,
        name: '文件',
        fileNumber: stats.document.count,
        fileSize: stats.document.size,
        iconBg: '#e5f6ff',
        icon: <AiFillFileText className="scale-125 text-[#00a5ff]" />,
      },
      {
        key: 2,
        name: '图片',
        fileNumber: stats.image.count,
        fileSize: stats.image.size,
        iconBg: '#eeecfe',
        icon: <AiFillPicture className="scale-125 text-[#5542f6]" />,
      },
      {
        key: 3,
        name: '视频',
        fileNumber: stats.video.count,
        fileSize: stats.video.size,
        iconBg: '#e8f9f6',
        icon: <AiFillPlaySquare className="scale-125 text-[#22c9ad]" />,
      },
      {
        key: 4,
        name: '音频',
        fileNumber: stats.audio.count,
        fileSize: stats.audio.size,
        iconBg: '#fef0f5',
        icon: <AiFillCustomerService className="scale-125 text-[#fa699d]" />,
      },
      {
        key: 5,
        name: '其他',
        fileNumber: stats.other.count,
        fileSize: stats.other.size,
        iconBg: '#fff5ec',
        icon: <AiFillFile className="scale-125 text-[#ffa043]" />,
      },
    ];
  }, [allFiles]);

  const hasStorageData = useMemo(
    () => saveData.some((item) => item.fileSize > 0),
    [saveData]
  );

  return (
    <>
      {contextHolder}
      <div className="grid w-full gap-6 p-6 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
        {/* ================= 左侧内容 ================= */}
        <div className="col-span-8 flex flex-col space-y-8">
          {/* 活动 */}
          <section>
            <h1 className="py-4 text-3xl font-semibold text-[#2e2c34]">
              我的云
            </h1>
            <p className="mb-4 text-sm text-[#2e2c34]">从你的活动来看</p>

            {/* 自适应网格卡片 */}
            {recentlyUploaded.length === 0 ? (
              <SectionEmptyState description="无数据" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recentlyUploaded.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex h-32 cursor-pointer flex-col rounded-2xl border border-gray-100 p-4 transition duration-175 hover:bg-gray-100"
                    onClick={() => {
                      if (item.type === 'folder') {
                        handleFolderClick(item.id);
                      } else {
                        openPreviewDialog(item);
                      }
                    }}
                  >
                    <div className="mb-2">
                      {item.type === 'folder' ? (
                        <div>
                          <AiFillFolder className="h-10 w-10 text-amber-400" />
                          <h2 className="line-clamp-1 text-gray-800">
                            {item.filename}
                          </h2>
                          <span className="text-sm text-gray-600">
                            {formatDate(new Date(item.createdAt))}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-gray-400">
                            {getFileIcon(item.ext, 'medium')}
                          </div>
                          <h2 className="line-clamp-1 text-gray-800">
                            {item.filename}
                          </h2>
                          <span className="text-sm text-gray-600">
                            {formatDate(new Date(item.createdAt))}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Dropdown
                        menu={{
                          items: getFileMenuItems(item, {
                            onDetailsOpen: () => {
                              setSelectedFile(item);
                              setShowDetails(true);
                            },
                            onFolderNavigate: handleFolderClick,
                          }),
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
                          },
                        }}
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
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 最近上传 */}
          <section>
            <p className="mb-4 text-sm text-[#2e2c34]">最近上传</p>

            {recentlyUploaded.length === 0 ? (
              <SectionEmptyState description="无数据" />
            ) : (
              <ul className="flex flex-col">
                {recentlyUploaded.slice(0, 3).map((item) => (
                  <li
                    key={item.id}
                    className="group relative mb-2 flex h-20 cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-1 transition hover:bg-gray-100"
                    onClick={() => {
                      if (item.type === 'folder') {
                        handleFolderClick(item.id);
                      } else {
                        openPreviewDialog(item);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        {item.type === 'folder' ? (
                          <AiFillFolder className="h-8 w-8 text-amber-400" />
                        ) : (
                          getFileIcon(item.ext, 'small')
                        )}
                      </div>
                      <p className="text-gray-700">{item.filename}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>添加于 {formatDate(new Date(item.createdAt))}</span>

                      <div
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Dropdown
                          menu={{
                            items: getFileMenuItems(item, {
                              onDetailsOpen: () => {
                                setSelectedFile(item);
                                setShowDetails(true);
                              },
                              onFolderNavigate: handleFolderClick,
                            }),
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                            },
                          }}
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
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 已收藏 */}
          <section>
            <p className="mb-4 text-sm text-[#2e2c34]">已收藏</p>

            {favoriteFiles.length === 0 ? (
              <SectionEmptyState description="无数据" />
            ) : (
              <ul className="flex flex-col divide-y divide-gray-200">
                {favoriteFiles.map((item) => (
                  <li
                    key={item.id}
                    className="group relative mb-2 flex h-16 cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-1 transition duration-150 hover:bg-gray-50"
                    onClick={() => {
                      if (item.type === 'folder') {
                        handleFolderClick(item.id);
                      } else {
                        openPreviewDialog(item);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {item.type === 'folder' ? (
                        <AiFillFolder className="h-8 w-8 text-amber-400" />
                      ) : (
                        <div className="text-gray-400">
                          {getFileIcon(item.ext, 'small')}
                        </div>
                      )}
                      <p className="text-gray-700">{item.filename}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AiFillStar className="mr-2 h-6 w-6 text-amber-400" />
                      <div
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Dropdown
                          menu={{
                            items: getFileMenuItems(item, {
                              onDetailsOpen: () => {
                                setSelectedFile(item);
                                setShowDetails(true);
                              },
                              onFolderNavigate: handleFolderClick,
                            }),
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                            },
                          }}
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
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ================= 右侧图表 ================= */}
        <div className="col-span-4 rounded-2xl bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">存储大小</h2>
          {hasStorageData ? (
            <div
              className="flex h-50 items-center justify-center rounded-xl text-gray-400"
              style={{ boxShadow: '0px 0px 5px #eaeaea' }}
            >
              <EChart
                option={{
                  tooltip: {
                    trigger: 'item',
                    formatter: (params: TopLevelFormatterParams) => {
                      const param = Array.isArray(params) ? params[0] : params;
                      const item = saveData.find((d) => d.name === param.name);
                      if (item) {
                        return `${param.name}<br/>${item.fileNumber} 个文件<br/>${formatFileSize(item.fileSize)}`;
                      }
                      return `${param.name}: ${param.value}`;
                    },
                  },
                  series: [
                    {
                      name: '存储大小',
                      type: 'pie',
                      radius: ['40%', '50%'],
                      center: ['50%', '70%'],
                      startAngle: 180,
                      endAngle: 360,
                      data: saveData
                        .filter((item) => item.fileSize > 0)
                        .map((item) => ({
                          value: item.fileSize,
                          name: item.name,
                        })),
                    },
                  ],
                }}
              />
            </div>
          ) : (
            <SectionEmptyState description="无数据" />
          )}
          <ul className="mt-4">
            {saveData.map((item, i) => (
              <li
                key={i}
                className={`relative mb-4 flex cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-100 px-4 py-2 transition duration-150 hover:bg-gray-100`}
              >
                <div className="flex">
                  <div
                    className={`mr-4 flex h-14 w-14 items-center justify-center rounded-lg`}
                    style={{ backgroundColor: item.iconBg }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-gray-800">{item.name}</p>
                    <span className="text-gray-500">
                      {item.fileNumber} files
                    </span>
                  </div>
                </div>
                <span className="text-gray-600">
                  {formatFileSize(item.fileSize)}
                </span>
              </li>
            ))}
          </ul>
        </div>

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
      </div>
    </>
  );
}
