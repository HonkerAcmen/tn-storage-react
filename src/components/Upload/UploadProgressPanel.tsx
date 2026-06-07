import { useEffect, useRef, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { MdDownload } from 'react-icons/md';
import { Button, Drawer, Progress, Tabs } from 'antd';
import {
  useUploadQueue,
  type UploadItemStatus,
  type UploadQueueItem,
} from '@/contexts/UploadQueueContext';
import {
  useDownloadQueue,
  type DownloadItemStatus,
  type DownloadQueueItem,
} from '@/contexts/DownloadQueueContext';

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

function formatSpeed(bytesPerSecond: number) {
  if (bytesPerSecond <= 0) {
    return '0 B/s';
  }
  return `${formatFileSize(bytesPerSecond)}/s`;
}

function uploadStatusLabel(status: UploadItemStatus) {
  switch (status) {
    case 'queued':
      return '等待中';
    case 'uploading':
      return '上传中';
    case 'completed':
      return '已完成';
    case 'failed':
      return '失败';
    case 'cancelled':
      return '已取消';
    case 'interrupted':
      return '待续传';
    default:
      return status;
  }
}

function downloadStatusLabel(status: DownloadItemStatus) {
  switch (status) {
    case 'queued':
      return '等待中';
    case 'downloading':
      return '下载中';
    case 'completed':
      return '已完成';
    case 'failed':
      return '失败';
    case 'cancelled':
      return '已取消';
    default:
      return status;
  }
}

function itemStatusText(item: UploadQueueItem) {
  if (item.isInstant) {
    return item.status === 'completed' ? '秒传成功' : '秒传中';
  }
  if (item.status === 'uploading' && item.phase === 'hashing') {
    return '正在校验文件…';
  }
  if (
    (item.status === 'uploading' || item.status === 'completed') &&
    !item.isInstant
  ) {
    return item.status === 'completed' ? '速传成功' : '速传中';
  }
  return uploadStatusLabel(item.status);
}

function renderUploadModeTag(item: UploadQueueItem) {
  if (item.isInstant) {
    return (
      <span className="shrink-0 rounded-sm bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
        秒传
      </span>
    );
  }
  if (item.status === 'uploading' || item.status === 'completed') {
    return (
      <span className="shrink-0 rounded-sm bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
        速传
      </span>
    );
  }
  return null;
}

export default function UploadProgressPanel() {
  const upload = useUploadQueue();
  const download = useDownloadQueue();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeTargetIdRef = useRef<string | null>(null);
  const prevUploadCountRef = useRef(0);
  const prevDownloadCountRef = useRef(0);

  const totalActive = upload.activeCount + download.activeCount;
  const hasAnyTask = upload.items.length > 0 || download.items.length > 0;

  useEffect(() => {
    if (upload.items.length > prevUploadCountRef.current) {
      setDrawerOpen(true);
      setActiveTab('upload');
    }
    prevUploadCountRef.current = upload.items.length;
  }, [upload.items.length]);

  useEffect(() => {
    if (download.items.length > prevDownloadCountRef.current) {
      setDrawerOpen(true);
      setActiveTab('download');
    }
    prevDownloadCountRef.current = download.items.length;
  }, [download.items.length]);

  const openResumePicker = (id: string) => {
    resumeTargetIdRef.current = id;
    fileInputRef.current?.click();
  };

  const handleResumeFile = (fileList: FileList | null) => {
    const id = resumeTargetIdRef.current;
    resumeTargetIdRef.current = null;
    if (!id || !fileList?.length) {
      return;
    }
    upload.resumeItem(id, fileList[0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadHasFinished = upload.items.some(
    (item) => item.status === 'completed' || item.status === 'cancelled',
  );
  const downloadHasFinished = download.items.some(
    (item) => item.status === 'completed' || item.status === 'cancelled',
  );

  if (!hasAnyTask) {
    return null;
  }

  const clearCurrentTab = () => {
    if (activeTab === 'upload') {
      upload.clearCompleted();
    } else {
      download.clearCompleted();
    }
  };

  const showClear =
    activeTab === 'upload' ? uploadHasFinished : downloadHasFinished;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => handleResumeFile(event.target.files)}
      />

      {!drawerOpen ? (
        <button
          type="button"
          title="打开传输任务"
          aria-label="打开传输任务"
          onClick={() => setDrawerOpen(true)}
          className="fixed right-4 bottom-12 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition hover:bg-gray-50"
        >
          <AiOutlineCloudUpload className="h-6 w-6" />
          {totalActive > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-xs text-white">
              {totalActive}
            </span>
          ) : null}
        </button>
      ) : null}

      <Drawer
        title="传输任务"
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        destroyOnClose={false}
        extra={
          showClear ? (
            <Button type="link" size="small" onClick={clearCurrentTab}>
              清除已完成
            </Button>
          ) : null
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'upload',
              label: `上传${upload.activeCount > 0 ? ` (${upload.activeCount})` : ''}`,
              children:
                upload.items.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    暂无上传任务
                  </div>
                ) : (
                  <ul className="m-0 list-none p-0">
                  {upload.items.map((item) => (
                    <li
                      key={item.id}
                      className="mb-3 rounded-md border border-gray-100 p-3 last:mb-0"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <div className="truncate text-sm font-medium text-gray-800">
                              {item.fileName}
                            </div>
                            {renderUploadModeTag(item)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(item.fileSize)} · {itemStatusText(item)}
                            {item.status === 'uploading' &&
                            item.phase === 'uploading' &&
                            item.speed > 0
                              ? ` · ${formatSpeed(item.speed)}`
                              : ''}
                          </div>
                          {item.error ? (
                            <div className="mt-1 text-xs text-red-500">
                              {item.error}
                            </div>
                          ) : null}
                        </div>
                        {(item.status === 'queued' ||
                          item.status === 'uploading' ||
                          item.status === 'interrupted') && (
                          <Button
                            type="link"
                            size="small"
                            danger
                            onClick={() => void upload.cancelItem(item.id)}
                          >
                            取消
                          </Button>
                        )}
                      </div>
                      <Progress
                        percent={item.progress}
                        size="small"
                        status={
                          item.status === 'failed'
                            ? 'exception'
                            : item.status === 'completed'
                              ? 'success'
                              : 'active'
                        }
                      />
                      {item.status === 'interrupted' ? (
                        <Button
                          type="link"
                          size="small"
                          className="mt-1 px-0"
                          onClick={() => openResumePicker(item.id)}
                        >
                          选择同一文件继续上传
                        </Button>
                      ) : null}
                    </li>
                  ))}
                  </ul>
                ),
            },
            {
              key: 'download',
              label: `下载${download.activeCount > 0 ? ` (${download.activeCount})` : ''}`,
              children:
                download.items.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    暂无下载任务
                  </div>
                ) : (
                  <ul className="m-0 list-none p-0">
                  {download.items.map((item: DownloadQueueItem) => (
                    <li
                      key={item.id}
                      className="mb-3 rounded-md border border-gray-100 p-3 last:mb-0"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <MdDownload className="shrink-0 text-gray-500" />
                            <div className="truncate text-sm font-medium text-gray-800">
                              {item.fileName}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(item.fileSize)} ·{' '}
                            {downloadStatusLabel(item.status)}
                            {item.status === 'downloading' &&
                            item.speed &&
                            item.speed > 0
                              ? ` · ${formatSpeed(item.speed)}`
                              : ''}
                          </div>
                          {item.error ? (
                            <div className="mt-1 text-xs text-red-500">
                              {item.error}
                            </div>
                          ) : null}
                        </div>
                        {(item.status === 'queued' ||
                          item.status === 'downloading') && (
                          <Button
                            type="link"
                            size="small"
                            danger
                            onClick={() => download.cancelItem(item.id)}
                          >
                            取消
                          </Button>
                        )}
                      </div>
                      <Progress
                        percent={item.progress}
                        size="small"
                        status={
                          item.status === 'failed'
                            ? 'exception'
                            : item.status === 'completed'
                              ? 'success'
                              : 'active'
                        }
                      />
                    </li>
                  ))}
                  </ul>
                ),
            },
          ]}
        />
      </Drawer>
    </>
  );
}
