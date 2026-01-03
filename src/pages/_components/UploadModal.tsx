import { useState } from 'react';
import { Upload, Button, message, Progress, List, Modal } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineFile,
  AiOutlineInbox,
} from 'react-icons/ai';
import { UploadFileResponse } from '@/types/fileSystem';

const { Dragger } = Upload;

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      // 检查文件大小（限制 100MB）
      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        message.error('文件大小不能超过 100MB！');
        return false;
      }
      return true;
    },
    onChange: (info) => {
      setFileList(info.fileList);

      // 模拟上传进度
      if (info.file.status === 'uploading') {
        const fileId = info.file.uid;
        const timer = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[fileId] || 0;
            if (current >= 90) {
              clearInterval(timer);
              return prev;
            }
            return { ...prev, [fileId]: current + 10 };
          });
        }, 200);
      }

      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功！`);
        setUploadProgress((prev) => ({ ...prev, [info.file.uid]: 100 }));
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败！`);
      }
    },
    onRemove: (file) => {
      setFileList((prevList) =>
        prevList.filter((item) => item.uid !== file.uid)
      );
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.uid];
        return newProgress;
      });
    },
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      // 模拟上传过程
      const fileId = (file as UploadFile).uid;
      let progress = 0;

      const timer = setInterval(() => {
        progress += 10;
        onProgress?.({ percent: progress } as unknown as ProgressEvent);

        if (progress >= 100) {
          clearInterval(timer);
          // 模拟成功
          setTimeout(() => {
            onSuccess?.({} as UploadFileResponse);
          }, 500);
        }
      }, 200);
    },
  };

  // 开始上传
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择要上传的文件！');
      return;
    }

    setUploading(true);
    try {
      // 这里可以调用真实的上传 API
      // await uploadFiles(fileList);

      // 模拟上传
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success('所有文件上传成功！');
      setFileList([]);
      setUploadProgress({});
      onClose();
    } catch (error) {
      message.error('上传失败，请重试！');
    } finally {
      setUploading(false);
    }
  };

  // 清空文件列表
  const handleClear = () => {
    setFileList([]);
    setUploadProgress({});
    message.info('已清空文件列表');
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AiOutlineCloudUpload className="h-5 w-5 text-[#5542f6]" />
            <span className="text-lg font-semibold">上传文件</span>
          </div>
        </div>
      }
      className="upload-modal"
    >
      <div className="space-y-4">
        {/* 拖拽上传区域 */}
        <Dragger {...uploadProps} className="rounded-lg">
          <p className="ant-upload-drag-icon flex justify-center">
            <AiOutlineInbox className="h-12 w-12 text-[#5542f6]" />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持多文件上传，单个文件不超过 100MB
          </p>
        </Dragger>

        {/* 文件列表 */}
        {fileList.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                已选择 {fileList.length} 个文件
              </span>
              <Button
                type="link"
                danger
                size="small"
                onClick={handleClear}
                icon={<AiOutlineDelete className="h-4 w-4" />}
              >
                清空
              </Button>
            </div>

            <List
              dataSource={fileList}
              renderItem={(file) => (
                <List.Item className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex flex-1 items-center space-x-3">
                      <AiOutlineFile className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size || 0)}
                        </p>
                      </div>
                    </div>
                    {uploadProgress[file.uid] !== undefined && (
                      <div className="ml-4 w-32">
                        <Progress
                          percent={uploadProgress[file.uid]}
                          size="small"
                          status={
                            uploadProgress[file.uid] === 100
                              ? 'success'
                              : 'active'
                          }
                        />
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            className="bg-[#5542f6] hover:bg-[#4532e6]"
            icon={<AiOutlineCloudUpload />}
          >
            {uploading ? '上传中...' : '开始上传'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
