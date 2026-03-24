import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Empty, Tabs, Tag } from 'antd';
import type { TabsProps } from 'antd';
import { AiOutlineClockCircle } from 'react-icons/ai';
import FileListItem from '@/components/FileListItem';
import { formatRelativeTime, formatDate } from '@/utils/format/formatters';
import { useFileData } from '@/contexts/FileDataContext';
import { useGetRecents } from '@/network/hooks/file';

function SectionEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-10">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span className="text-sm text-gray-500">无数据</span>}
      />
    </div>
  );
}

export default function RecentFiles() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recent');
  const { allFiles, openPreviewDialog } = useFileData();
  const { data: recentsData } = useGetRecents();

  const fileByUUID = useMemo(() => {
    return new Map(allFiles.map((file) => [file.UUID, file]));
  }, [allFiles]);

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
    const recentUUIDs = recentsData?.data.data.recent ?? [];
    return recentUUIDs
      .map((uuid) => fileByUUID.get(uuid))
      .filter((item): item is NonNullable<typeof item> => !!item)
      .slice(0, 20);
  }, [fileByUUID, recentsData]);

  // 最近上传的文件（按 createdAt 排序）
  const recentlyCreated = useMemo(() => {
    const createdUUIDs = recentsData?.data.data.created ?? [];
    return createdUUIDs
      .map((uuid) => fileByUUID.get(uuid))
      .filter((item): item is NonNullable<typeof item> => !!item)
      .slice(0, 20);
  }, [fileByUUID, recentsData]);

  // 最近修改的文件（按 updatedAt 排序，排除今天创建的）
  const recentlyModified = useMemo(() => {
    const modifiedUUIDs = recentsData?.data.data.modified ?? [];
    return modifiedUUIDs
      .map((uuid) => fileByUUID.get(uuid))
      .filter((item): item is NonNullable<typeof item> => !!item)
      .slice(0, 20);
  }, [fileByUUID, recentsData]);

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
        recentlyAccessed.length === 0 ? (
          <SectionEmptyState />
        ) : (
          <ul className="flex flex-col space-y-2">
            {recentlyAccessed.map((item) => (
              <FileListItem
                key={item.id}
                file={item}
                showSize
                showTime
                timeValue={`${formatRelativeTime(new Date(item.updatedAt))} • 修改于 ${formatDate(new Date(item.updatedAt))}`}
                onClick={() => {
                  if (item.type === 'folder') {
                    handleFolderClick(item.id);
                  } else {
                    openPreviewDialog(item);
                  }
                }}
              />
            ))}
          </ul>
        )
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
        recentlyCreated.length === 0 ? (
          <SectionEmptyState />
        ) : (
          <ul className="flex flex-col space-y-2">
            {recentlyCreated.map((item) => (
              <FileListItem
                key={item.id}
                file={item}
                showSize
                showTime
                timeValue={`${formatRelativeTime(new Date(item.createdAt))} • 上传于 ${formatDate(new Date(item.createdAt))}`}
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
                  } else {
                    openPreviewDialog(item);
                  }
                }}
              />
            ))}
          </ul>
        )
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
        recentlyModified.length === 0 ? (
          <SectionEmptyState />
        ) : (
          <ul className="flex flex-col space-y-2">
            {recentlyModified.map((item) => (
              <FileListItem
                key={item.id}
                file={item}
                showSize
                showTime
                timeValue={`${formatRelativeTime(new Date(item.updatedAt))} • 修改于 ${formatDate(new Date(item.updatedAt))}`}
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
                  } else {
                    openPreviewDialog(item);
                  }
                }}
              />
            ))}
          </ul>
        )
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
