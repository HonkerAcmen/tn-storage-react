import { useState, useEffect, useMemo } from 'react';
import { Upload, Button, message, Progress, List, Modal } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineFile,
  AiOutlineInbox,
} from 'react-icons/ai';
import { useUploadFile, useGetUploadStatus } from '@/network/hooks/file';
import { useQueryClient } from '@tanstack/react-query';
import { DEFAULT_BUCKET } from '@/utils/constants/fileConstants';

const { Dragger } = Upload;

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [taskId, setTaskId] = useState<string | null>(null);
  const uploadFileMutation = useUploadFile();
  const queryClient = useQueryClient();

  // 查询上传任务状态
  const { data: uploadStatus } = useGetUploadStatus(taskId || '');
  const ups = useMemo(() => {
    return uploadStatus?.data;
  }, [uploadStatus]);

  // 监听上传状态变化，更新进度
  useEffect(() => {
    if (ups && taskId) {
      const progress = Math.round((ups.uploadedFiles / ups.fileNum) * 100);

      // 更新所有文件的进度
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        fileList.forEach((file) => {
          newProgress[file.uid] = progress;
        });
        return newProgress;
      });

      // 如果上传完成，清理状态
      if (ups.status === 'completed') {
        setUploading(false);
        messageApi.success('所有文件上传成功！');
        // 刷新文件列表
        queryClient.invalidateQueries({ queryKey: ['file', 'info'] });
        setTimeout(() => {
          setFileList([]);
          setUploadProgress({});
          setTaskId(null);
          onClose();
        }, 1000);
      }
    }
  }, [ups, taskId, fileList, queryClient, onClose]);

  // 上传配置（禁用自动上传，改为手动触发）
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      // 检查文件大小（限制 100MB）
      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        messageApi.error('文件大小不能超过 100MB！');
        return false;
      }
      // 禁用自动上传
      return false;
    },
    onChange: (info) => {
      setFileList(info.fileList);
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
  };

  // 开始上传
  const handleUpload = () => {
    if (fileList.length === 0) {
      messageApi.warning('请先选择要上传的文件！');
      return;
    }

    // 检查文件数量限制（API 限制 ≤100 个文件）
    if (fileList.length > 100) {
      messageApi.error('一次最多只能上传 100 个文件！');
      return;
    }

    setUploading(true);

    // 提取 File 对象
    const files = fileList
      .map((item) => item.originFileObj)
      .filter(Boolean) as File[];

    // 调用上传 API
    uploadFileMutation.mutateAsync(
      {
        bucket: DEFAULT_BUCKET,
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
  };

  // 清空文件列表
  const handleClear = () => {
    setFileList([]);
    setUploadProgress({});
    messageApi.info('已清空文件列表');
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
      {contextHolder}
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
                <List.Item className="mt-2 rounded-lg border border-gray-200 bg-white p-3">
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
