import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Modal, Spin, Tag } from 'antd';
import { AiOutlineDownload } from 'react-icons/ai';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import { formatFileSize } from '@/utils/format/formatters';
import { FILE_TYPE_MAP } from '@/utils/fileUtils';
import { getFileIcon } from './FileIcon';
import {
  downloadFile,
  fetchFileBlob,
} from '@/features/files/services/fileOperations';

interface FilePreviewModalProps {
  open: boolean;
  file: FileSystemTreeNode | null;
  onClose: () => void;
}

type PreviewState = {
  objectUrl: string | null;
  textContent: string | null;
  mimetype: string;
};

function getPreviewType(ext: string) {
  const lowerExt = ext.toLowerCase();
  if (FILE_TYPE_MAP.imageExts.includes(lowerExt)) return 'image';
  if (FILE_TYPE_MAP.videoExts.includes(lowerExt)) return 'video';
  if (FILE_TYPE_MAP.audioExts.includes(lowerExt)) return 'audio';
  if (lowerExt === 'pdf') return 'pdf';
  if (
    [
      'txt',
      'md',
      'json',
      'js',
      'ts',
      'jsx',
      'tsx',
      'html',
      'css',
      'xml',
      'yaml',
      'yml',
      'csv',
      'log',
      'rtf',
    ].includes(lowerExt)
  ) {
    return 'text';
  }
  return 'unsupported';
}

export default function FilePreviewModal({
  open,
  file,
  onClose,
}: FilePreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PreviewState>({
    objectUrl: null,
    textContent: null,
    mimetype: '',
  });

  const fileExt = useMemo(() => {
    if (!file || file.type === 'folder') {
      return '';
    }
    const index = file.filename.lastIndexOf('.');
    return index > 0 ? file.filename.slice(index + 1).toLowerCase() : '';
  }, [file]);

  const previewType = useMemo(() => getPreviewType(fileExt), [fileExt]);

  useEffect(() => {
    let active = true;
    let currentObjectUrl: string | null = null;

    if (!open || !file || file.type === 'folder') {
      return;
    }

    setLoading(true);
    setError('');
    setPreview({
      objectUrl: null,
      textContent: null,
      mimetype: '',
    });

    void fetchFileBlob(file)
      .then(async ({ blob, mimetype }) => {
        if (!active) {
          return;
        }

        const nextState: PreviewState = {
          objectUrl: null,
          textContent: null,
          mimetype,
        };

        if (previewType === 'text') {
          nextState.textContent = await blob.text();
        } else if (
          previewType === 'image' ||
          previewType === 'video' ||
          previewType === 'audio' ||
          previewType === 'pdf'
        ) {
          currentObjectUrl = URL.createObjectURL(blob);
          nextState.objectUrl = currentObjectUrl;
        }

        setPreview(nextState);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        console.error('文件预览加载失败:', err);
        setError('预览加载失败，请稍后重试');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [file, open, previewType]);

  const renderPreview = () => {
    if (!file) {
      return null;
    }

    if (file.type === 'folder') {
      return (
        <Alert
          type="info"
          message="文件夹暂不支持预览"
          description="可以进入文件夹查看内容。"
          showIcon
        />
      );
    }

    if (loading) {
      return (
        <div className="flex h-[420px] items-center justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          type="error"
          message="预览失败"
          description={error}
          showIcon
        />
      );
    }

    switch (previewType) {
      case 'image':
        return (
          <div className="flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-[#f5f6fb]">
            <img
              src={preview.objectUrl || ''}
              alt={file.filename}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        );
      case 'video':
        return (
          <div className="overflow-hidden rounded-xl bg-black">
            <video
              src={preview.objectUrl || ''}
              controls
              className="h-[420px] w-full"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="flex h-[220px] flex-col items-center justify-center rounded-xl bg-[#f5f6fb] p-8">
            <div className="mb-6 text-gray-400">{getFileIcon(fileExt, 'large')}</div>
            <audio src={preview.objectUrl || ''} controls className="w-full max-w-xl" />
          </div>
        );
      case 'pdf':
        return (
          <iframe
            src={preview.objectUrl || ''}
            title={file.filename}
            className="h-[520px] w-full rounded-xl border border-gray-200"
          />
        );
      case 'text':
        return (
          <pre className="h-[420px] overflow-auto rounded-xl border border-gray-200 bg-[#f8fafc] p-4 text-sm leading-6 whitespace-pre-wrap text-gray-700">
            {preview.textContent || '空文件'}
          </pre>
        );
      default:
        return (
          <div className="flex h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
            <div className="mb-4 text-gray-400">{getFileIcon(fileExt, 'large')}</div>
            <p className="text-base font-medium text-gray-700">当前文件类型暂不支持在线预览</p>
            <p className="mt-2 text-sm text-gray-500">
              可以直接下载后在本地查看。
            </p>
          </div>
        );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={previewType === 'pdf' ? 960 : 860}
      destroyOnClose
      title={
        <div className="flex items-center gap-3">
          <div className="text-gray-400">{file ? getFileIcon(fileExt, 'small') : null}</div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-800">
              {file?.filename || '文件预览'}
            </p>
            {file && (
              <div className="mt-1 flex items-center gap-2">
                <Tag color="blue">{file.type === 'file' ? '文件' : '文件夹'}</Tag>
                {file.type === 'file' && fileExt && <Tag color="green">{fileExt.toUpperCase()}</Tag>}
                {file.type === 'file' && (
                  <Tag>{formatFileSize(Number(file.size || 0))}</Tag>
                )}
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {renderPreview()}
        {file?.type === 'file' && (
          <div className="flex justify-end">
            <Button
              icon={<AiOutlineDownload />}
              onClick={() => void downloadFile(file)}
            >
              下载文件
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
