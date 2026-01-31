import { useFileData } from '@/contexts/FileDataContext';
import { message, Modal, Progress } from 'antd';
import { FolderItem } from '../FilesHandle/FolderItem';
import { useEffect, useMemo, useRef, useState } from 'react';
import FileUploadButton from '../FilesHandle/FileUploadButton';
import { useGetUploadStatus, useUploadFile } from '@/network/hooks/file';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';
import { useQueryClient } from '@tanstack/react-query';

interface UploadMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadMenu({ open, onClose }: UploadMenuProps) {
  /**
   * 变量定义区域
   */
  const [messageApi, messageContextH] = message.useMessage();
  const { allFiles } = useFileData();
  const [selectKey, setSelectKey] = useState('');
  const [fileList, setFileList] = useState<File[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadFileMutation = useUploadFile();
  const queryClient = useQueryClient();
  const [, setUploadProgress] = useState<Record<string, number>>({});
  const [selectId, setSelectId] = useState('');

  const [progress, setProgress] = useState(0);
  const successShownRef = useRef(false);
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

  /**
   * 查询上传任务状态
   */
  const { data: uploadStatus } = useGetUploadStatus(taskId || '');
  const ups = useMemo(() => {
    return uploadStatus?.data;
  }, [uploadStatus]);

  // 新任务开始时重置成功提示标记
  useEffect(() => {
    successShownRef.current = false;
  }, [taskId]);

  // 监听上传状态变化，更新进度
  useEffect(() => {
    if (ups && taskId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(Math.round((ups.uploadedFiles / ups.fileNum) * 100));

      // 更新所有文件的进度
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        const currentProgress = Math.round(
          (ups.uploadedFiles / ups.fileNum) * 100
        );
        fileList.forEach((file) => {
          newProgress[file.name] = currentProgress;
        });
        return newProgress;
      });

      // 如果上传完成，清理状态（使用 ref 避免 progress 变化导致重复触发）
      if (ups.status === 'completed' && !successShownRef.current) {
        successShownRef.current = true;
        setUploading(false);
        messageApi.success('所有文件上传成功！');
        // 刷新文件列表
        queryClient.invalidateQueries({ queryKey: ['file', 'data', 'tree'] });
        setTimeout(() => {
          setFileList([]);
          setUploadProgress({});
          setTaskId(null);
          onClose();
        }, 1000);
      }
    }
  }, [ups, taskId, fileList, queryClient, onClose, messageApi]);

  function handleUpload(file: FileList | null) {
    const MAXSIZE = 100 * 1024 * 1024;
    const files: File[] = [];
    if (!selectKey) messageApi.error('请选择一个文件夹');
    if (file === null) {
      messageApi.error('没有选择文件');
    } else {
      for (const f of file) {
        if (f.size > MAXSIZE) {
          messageApi.warning(`文件 ${f.name} 的大小超过限制`);
          return;
        }

        if (!FILE_TYPE_MAP.includes(f.name.split('.')[1])) {
          messageApi.error(`文件 ${f.name} 文件类型不支持上传`);
        }

        files.push(f);
      }

      setFileList(files);

      if (files.length > 20) {
        messageApi.error('同时上传的文件不能超过20个');
      }

      setUploading(true);
      uploadFileMutation.mutateAsync(
        {
          bucket: DEFAULT_BUCKET,
          parentid: parseInt(selectId),
          files,
        },
        {
          onSuccess: (response) => {
            // 获取任务 ID
            const taskId = response.data.data.taskId;
            if (taskId) {
              setTaskId(taskId);
            } else {
              messageApi.error('未能获取任务id');
            }

            queryClient.invalidateQueries({
              queryKey: ['file', 'data', 'tree'],
            });
          },
          onError: (error) => {
            setUploading(false);
            const msg = error.message || '上传失败，请重试！';
            messageApi.error(msg);
            console.error('业务层错误:', error);
          },
        }
      );
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
        {allFiles.map((item) => (
          <FolderItem
            key={item.UUID}
            item={item}
            selectId={selectId}
            selectKey={selectKey}
            onSelect={(key: string) => setSelectKey(key)}
            onSelectId={(id: string) => setSelectId(id)}
          />
        ))}
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
          uploading
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
