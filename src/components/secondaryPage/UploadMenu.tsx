import { useFileData } from '@/contexts/FileDataContext';
import { message, Modal, Progress } from 'antd';

import { useState } from 'react';

import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { useQueryClient } from '@tanstack/react-query';
import FileUploadButton from '../FilesHandle/FileUploadButton';
import FolderItem from '../FilesHandle/FolderItem';
import { uploadFilesInChunks } from '@/features/files/services/chunkUpload';

interface UploadMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadMenu({ open, onClose }: UploadMenuProps) {
  /**
   * 变量定义区域
   */
  const [messageApi, messageContextH] = message.useMessage();
  const { fileTree } = useFileData();
  const [selectKey, setSelectKey] = useState('');
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const [selectId, setSelectId] = useState('');

  const [progress, setProgress] = useState(0);

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

  /**
   * 函数定义区域
   */

  /**
   * 格式化文件大小
   * @param bytes 文件的大小
   * @returns
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  async function handleUpload(file: FileList | null) {
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

    try {
      setFileList(files);
      setProgress(0);
      setUploading(true);
      await uploadFilesInChunks({
        bucket: DEFAULT_BUCKET,
        parentid: parseInt(selectId),
        files,
        onProgress: ({ totalProgress }) => {
          setProgress(totalProgress);
        },
      });

      messageApi.success('所有文件上传成功！');
      queryClient.invalidateQueries({
        queryKey: ['file', 'data', 'tree'],
      });
      queryClient.invalidateQueries({
        queryKey: ['file', 'recent'],
      });
      setTimeout(() => {
        setFileList([]);
        setProgress(0);
        onClose();
      }, 1000);
    } catch (error) {
      const err = error as { message?: string };
      const msg = err?.message || '上传失败，请重试！';
      messageApi.error(msg);
      console.error('分片上传失败:', error);
    } finally {
      setUploading(false);
    }
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
        {/* {allFiles.map((item) => ( */}
        <FolderItem
          key={fileTree.UUID}
          item={fileTree}
          selectId={selectId}
          selectKey={selectKey}
          onSelect={(key: string) => setSelectKey(key)}
          onSelectId={(id: string) => setSelectId(id)}
        />
        {/* ))} */}
      </ul>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onClose()}
          className="mr-2 h-8 w-16 cursor-pointer rounded-lg border border-gray-300"
        >
          取消
        </button>
        <FileUploadButton
          isFolderSelect={selectKey ? false : true}
          multiple={true}
          uploading={uploading}
          onFileSelect={handleUpload}
        >
          {uploading ? '上传中' : '选择文件'}
        </FileUploadButton>
      </div>

      {fileList.length > 0 ? (
        <div>
          <div className="mt-4">
            <Progress percent={progress} />
          </div>
          <ul className="h-max-64 h-min-15">
            {fileList.map((f, index) => (
              <li
                key={index}
                className="mt-2 flex flex-row justify-between rounded-lg border border-gray-200 p-2"
              >
                {f.name + ' 共 ' + formatFileSize(f.size)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        ''
      )}
    </Modal>
  );
}
