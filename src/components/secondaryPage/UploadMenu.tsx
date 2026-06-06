import { useFileData } from '@/contexts/FileDataContext';
import { useUploadQueue } from '@/contexts/UploadQueueContext';
import { message, Modal } from 'antd';

import { useState } from 'react';

import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import FileUploadButton from '../FilesHandle/FileUploadButton';
import FolderItem from '../FilesHandle/FolderItem';
import { useGetMySettings } from '@/network/hooks/user';
import { useEffect } from 'react';

interface UploadMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadMenu({ open, onClose }: UploadMenuProps) {
  const [messageApi, messageContextH] = message.useMessage();
  const { fileTree } = useFileData();
  const { data: settingsResponse } = useGetMySettings();
  const { enqueueFiles } = useUploadQueue();
  const [selectKey, setSelectKey] = useState('');
  const [selectId, setSelectId] = useState('');

  const settings = settingsResponse?.data?.data;

  const FILE_TYPE_MAP = [
    'doc',
    'docx',
    'xls',
    'xlsx',
    'csv',
    'ppt',
    'pptx',
    'pdf',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg',
    'heic',
    'mp4',
    'avi',
    'mkv',
    'mov',
    'wmv',
    'webm',
    'mp3',
    'wav',
    'flac',
    'aac',
    'ogg',
    'm4a',
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'txt',
    'md',
    'log',
    'rtf',
    'js',
    'ts',
    'html',
    'css',
    'json',
    'xml',
    'yaml',
    'yml',
  ];

  useEffect(() => {
    const defaultParentId = String(settings?.default_upload_parent_id ?? '1');
    const fallbackUUID = fileTree.UUID;

    if (!selectId) {
      if (defaultParentId === '1') {
        setSelectId('1');
        setSelectKey(fallbackUUID);
        return;
      }

      const stack = [fileTree];
      while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
          continue;
        }
        if (current.id === defaultParentId) {
          setSelectId(current.id);
          setSelectKey(current.UUID);
          return;
        }
        current.children?.forEach((child) => stack.push(child));
      }

      setSelectId('1');
      setSelectKey(fallbackUUID);
    }
  }, [fileTree, selectId, settings?.default_upload_parent_id]);

  function handleUpload(file: FileList | null) {
    const files: File[] = [];
    if (!selectKey) {
      messageApi.error('请选择一个文件夹');
      return;
    }
    if (file === null) {
      messageApi.error('没有选择文件');
      return;
    }

    for (const f of file) {
      if (
        !FILE_TYPE_MAP.includes(
          f.name
            .split('.')
            [f.name.split('.').length - 1].toLocaleLowerCase()
            .trim()
        )
      ) {
        messageApi.error(`文件 ${f.name} 文件类型不支持上传`);
        return;
      }

      files.push(f);
    }

    if (files.length > 20) {
      messageApi.error('同时上传的文件不能超过20个');
      return;
    }

    enqueueFiles(files, parseInt(selectId), DEFAULT_BUCKET);
    if (settings?.upload_notification ?? true) {
      messageApi.success('文件已加入上传队列');
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={700}
      title={<div>选择要上传的文件夹</div>}
      footer={null}
    >
      {messageContextH}
      <ul>
        <FolderItem
          key={fileTree.UUID}
          item={fileTree}
          selectId={selectId}
          selectKey={selectKey}
          onSelect={(key: string) => setSelectKey(key)}
          onSelectId={(id: string) => setSelectId(id)}
        />
      </ul>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onClose()}
          className="mr-2 h-8 w-16 cursor-pointer rounded-lg border border-gray-300"
        >
          取消
        </button>
        <FileUploadButton
          isFolderSelect={!selectKey}
          multiple={true}
          uploading={false}
          onFileSelect={handleUpload}
        >
          选择文件
        </FileUploadButton>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        上传进度可在页面右下角查看，关闭此窗口不会中断上传。
      </p>
    </Modal>
  );
}
