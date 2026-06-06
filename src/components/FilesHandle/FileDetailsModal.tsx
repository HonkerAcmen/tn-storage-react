import { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Space,
  Divider,
  Button,
  Form,
  Input,
  message,
} from 'antd';
import {
  AiFillFolder,
  AiOutlineCopy,
  AiOutlineEye,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineCheck,
  AiOutlineFolderOpen,
} from 'react-icons/ai';

import { getFileIcon } from '@/components/FilesHandle/FileIcon';
import { formatFileSize, formatDateTime } from '@/utils/format/formatters';
import { getApiErrorMessage } from '@/utils/apiError';
import { useFileData } from '@/contexts/FileDataContext';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import { findPathToNode } from '@/utils/fileSystem/fileSystemUtils';
import * as fileOperations from '@/features/files/services/fileOperations';
import { useDownloadQueue } from '@/contexts/DownloadQueueContext';
interface FileDetailsModalProps {
  open: boolean;
  file: FileSystemTreeNode | null;
  onClose: () => void;
  onUpdate?: (
    fileId: string,
    updates: Partial<FileSystemTreeNode>
  ) => Promise<void>;
}

export default function FileDetailsModal({
  open,
  file,
  onClose,
  onUpdate,
}: FileDetailsModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const { fileTree, openPreviewDialog, openTransferDialog } = useFileData();
  const { enqueueDownloads } = useDownloadQueue();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 1. 提取文件名和后缀的解析逻辑 (useMemo 避免重复计算)
  const fileInfo = useMemo(() => {
    if (!file || file.type === 'folder')
      return { name: file?.filename || '', ext: '' };

    const lastDotIndex = file.filename.lastIndexOf('.');
    // 处理无后缀或以点开头的隐藏文件
    if (lastDotIndex <= 0) return { name: file.filename, ext: '' };

    return {
      name: file.filename.substring(0, lastDotIndex),
      ext: file.filename.substring(lastDotIndex + 1).toLowerCase(),
    };
  }, [file]);

  // 2. 获取文件全路径
  const filePath = useMemo(() => {
    if (!file || !open) return '';
    const path = findPathToNode(fileTree, file.id);
    return path
      .map((node) => (node.filename === 'root' ? '根目录' : node.filename))
      .join(' / ');
  }, [file, fileTree, open]);

  // 3. 当文件切换或 Modal 打开时，重置表单和编辑状态
  useEffect(() => {
    if (open && file) {
      form.setFieldsValue({
        name: fileInfo.name,
        ext: fileInfo.ext,
      });
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id, open, fileInfo, form]);

  if (!file) return null;

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const newName =
        file.type === 'file' && values.ext
          ? `${values.name}.${values.ext}`
          : values.name;

      setLoading(true);
      if (onUpdate) {
        await onUpdate(file.id, {
          filename: newName,
          updatedAt: new Date().toISOString(),
        });
      }
      messageApi.success('更新成功');
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  // 渲染图标逻辑
  const renderIcon = (size: 'small' | 'large') => {
    if (file.type === 'folder') {
      return (
        <AiFillFolder
          className={`${size === 'large' ? 'h-24 w-24' : 'h-8 w-8'} text-amber-400`}
        />
      );
    }
    return getFileIcon(fileInfo.ext, size);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      title={
        <div className="flex items-center space-x-3">
          <div className={file.type === 'folder' ? '' : 'text-gray-400'}>
            {renderIcon('small')}
          </div>
          <span className="text-lg font-semibold">文件详情</span>
        </div>
      }
    >
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div className="space-y-6">
          {/* 文件预览区 */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50/50 p-8">
            <div className="mb-4">{renderIcon('large')}</div>
            <h3 className="mb-2 text-center text-xl font-semibold break-all text-gray-800">
              {file.filename}
            </h3>
            <Space>
              <Tag color={file.type === 'file' ? 'blue' : 'orange'}>
                {file.type === 'file' ? '文件' : '文件夹'}
              </Tag>
              {fileInfo.ext && (
                <Tag color="green">{fileInfo.ext.toUpperCase()}</Tag>
              )}
            </Space>
          </div>

          <Divider />

          {/* 详细信息列表 */}
          <Descriptions
            column={1}
            bordered
            size="small"
            labelStyle={{ width: '120px', fontWeight: 500 }}
          >
            <Descriptions.Item label="名称">
              {isEditing ? (
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: '请输入名称' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="文件名"
                    suffix={fileInfo.ext ? `.${fileInfo.ext}` : null}
                  />
                </Form.Item>
              ) : (
                <span className="break-all">{file.filename}</span>
              )}
            </Descriptions.Item>

            {file.type === 'file' && (
              <Descriptions.Item label="大小">
                {formatFileSize(Number(file.size))}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="存储位置">
              <span className="text-gray-600">{filePath}</span>
            </Descriptions.Item>

            <Descriptions.Item label="修改时间">
              {formatDateTime(new Date(file.updatedAt))}
            </Descriptions.Item>

            <Descriptions.Item label="文件 ID">
              <span className="font-mono text-xs text-gray-400">{file.id}</span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* 底部操作栏 */}
        <div className="mt-8 flex items-center justify-end space-x-3 pt-4">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>取消</Button>
              <Button
                type="primary"
                loading={loading}
                icon={<AiOutlineCheck />}
                onClick={handleSave}
                className="bg-indigo-600"
              >
                保存修改
              </Button>
            </>
          ) : (
            <>
              <Button
                icon={<AiOutlineEye />}
                disabled={file.type === 'folder'}
                onClick={() => openPreviewDialog(file)}
              >
                预览
              </Button>
              <Button
                icon={<AiOutlineDownload />}
                disabled={file.type === 'folder'}
                onClick={() => enqueueDownloads([file])}
              >
                下载
              </Button>
              <Button
                icon={<AiOutlineShareAlt />}
                disabled={file.type === 'folder'}
                onClick={() => {
                  void fileOperations
                    .copyShareLinkForFile(file)
                    .then(() => {
                      messageApi.success('链接已复制');
                    })
                    .catch((err) => {
                      messageApi.error(
                        getApiErrorMessage(err, '分享失败，请重试'),
                      );
                    });
                }}
              >
                分享
              </Button>
              <Button
                icon={<AiOutlineFolderOpen />}
                onClick={() => openTransferDialog(file, 'move')}
              >
                移动
              </Button>
              <Button
                icon={<AiOutlineCopy />}
                onClick={() => openTransferDialog(file, 'copy')}
              >
                复制
              </Button>
              <Button
                type="primary"
                icon={<AiOutlineEdit />}
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600"
              >
                重命名
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
}
