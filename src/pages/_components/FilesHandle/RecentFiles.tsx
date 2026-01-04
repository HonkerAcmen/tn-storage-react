import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Tabs, Tag } from 'antd';
import type { TabsProps } from 'antd';
import { AiOutlineClockCircle } from 'react-icons/ai';
import FileListItem from '@/components/FileListItem';
import { formatRelativeTime, formatDate } from '@/utils/format/formatters';
import { useFileData } from '@/contexts/FileDataContext';
import type { FileSystemNode } from '@/types/fileSystem';

export default function RecentFiles() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recent');
  const { allFiles } = useFileData();

  // 处理文件夹点击 - 导航到"所有文件"视图
  const handleFolderClick = (folderId: string) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, view: 'sub2', folderId },
      },
      undefined,
      { shallow: true }
    );
  };

  // 最近访问的文件（按 updatedAt 排序）
  const recentlyAccessed = useMemo(() => {
    return [...allFiles]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20);
  }, [allFiles]);

  // 最近上传的文件（按 createdAt 排序）
  const recentlyCreated = useMemo(() => {
    return [...allFiles]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);
  }, [allFiles]);

  // 最近修改的文件（按 updatedAt 排序，排除今天创建的）
  const recentlyModified = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...allFiles]
      .filter((file) => file.createdAt < today)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20);
  }, [allFiles]);

  const tabItems: TabsProps['items'] = [
    {
      key: 'recent',
      label: (
        <span className="flex items-center space-x-2">
          <AiOutlineClockCircle />
          <span>最近访问</span>
        </span>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyAccessed.map((item) => (
            <FileListItem
              key={item.id}
              file={item}
              showSize
              showTime
              timeValue={`${formatRelativeTime(item.updatedAt)} • 修改于 ${formatDate(item.updatedAt)}`}
              onClick={() => {
                if (item.type === 'folder') {
                  handleFolderClick(item.id);
                }
              }}
            />
          ))}
        </ul>
      ),
    },
    {
      key: 'created',
      label: (
        <span className="flex items-center space-x-2">
          <AiOutlineClockCircle />
          <span>最近上传</span>
        </span>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyCreated.map((item) => (
            <FileListItem
              key={item.id}
              file={item}
              showSize
              showTime
              timeValue={`${formatRelativeTime(item.createdAt)} • 上传于 ${formatDate(item.createdAt)}`}
              actions={
                item.type === 'file' && (
                  <Tag color="green" className="mr-2">
                    新上传
                  </Tag>
                )
              }
              onClick={() => {
                if (item.type === 'folder') {
                  handleFolderClick(item.id);
                }
              }}
            />
          ))}
        </ul>
      ),
    },
    {
      key: 'modified',
      label: (
        <span className="flex items-center space-x-2">
          <AiOutlineClockCircle />
          <span>最近修改</span>
        </span>
      ),
      children: (
        <ul className="flex flex-col space-y-2">
          {recentlyModified.map((item) => (
            <FileListItem
              key={item.id}
              file={item}
              showSize
              showTime
              timeValue={`${formatRelativeTime(item.updatedAt)} • 修改于 ${formatDate(item.updatedAt)}`}
              actions={
                item.type === 'file' && (
                  <Tag color="orange" className="mr-2">
                    已修改
                  </Tag>
                )
              }
              onClick={() => {
                if (item.type === 'folder') {
                  handleFolderClick(item.id);
                }
              }}
            />
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="ml-4">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-semibold text-[#2e2c34]">最近的</h1>
        <p className="mt-2 text-sm text-gray-500">
          查看最近访问、上传或修改的文件
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="w-full"
      />
    </div>
  );
}
