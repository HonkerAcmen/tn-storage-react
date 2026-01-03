import { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
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
  AiFillFileExcel,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFileUnknown,
  AiFillFileZip,
  AiFillFolder,
  AiFillMuted,
  AiFillPlaySquare,
  AiOutlineFileImage,
  AiOutlineFileJpg,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiFillCloseCircle,
  AiOutlineCheck,
  AiOutlineClose,
} from 'react-icons/ai';
import { FileSystemNode } from '../../../types/fileSystem';
import { findPathToNode } from '../../../types/fileSystem';
import { getFileIcon } from '../../../utils/fileIcons';
import { formatFileSize, formatDateTime, getFileDisplayName } from '../../../utils/fileUtils';
import { useFileData } from '../../../contexts/FileDataContext';

interface FileDetailsModalProps {
  open: boolean;
  file: FileSystemNode | null;
  onClose: () => void;
  onUpdate?: (fileId: string, updates: Partial<FileSystemNode>) => void;
}

export default function FileDetailsModal({
  open,
  file,
  onClose,
  onUpdate,
}: FileDetailsModalProps) {
  const { fileTree } = useFileData();

  // 获取文件路径
  const getFilePath = (nodeId: string): string => {
    const path = findPathToNode(fileTree, nodeId);
    return path
      .map((node) => (node.name === 'root' ? '根目录' : node.name))
      .join(' / ');
  };
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const previousFileIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (file && open) {
      const fileId = file.id;
      const isNewFile = previousFileIdRef.current !== fileId;

      if (isNewFile) {
        // 分离文件名和扩展名
        if (file.type === 'file' && file.ext) {
          const nameWithoutExt = file.name.replace(`.${file.ext}`, '');
          form.setFieldsValue({
            name: nameWithoutExt,
            ext: file.ext,
          });
        } else {
          form.setFieldsValue({
            name: file.name,
          });
        }
        previousFileIdRef.current = fileId;
        // 使用 setTimeout 来避免在 effect 中同步调用 setState
        setTimeout(() => setIsEditing(false), 0);
      }
    }
  }, [file, form, open]);

  if (!file) return null;

  const filePath = getFilePath(file.id);

  // 处理保存编辑
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const newName =
        file.type === 'file' && values.ext
          ? `${values.name}.${values.ext}`
          : values.name;

      // 调用更新回调
      if (onUpdate) {
        onUpdate(file.id, {
          name: newName,
          updatedAt: new Date(),
        });
      }

      message.success('保存成功！');
      setIsEditing(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  // 处理 Modal 关闭
  const handleClose = () => {
    setIsEditing(false);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {file.type === 'folder' ? (
              <AiFillFolder className="h-8 w-8 text-amber-400" />
            ) : (
              <div className="text-gray-400">
                {getFileIcon(file.ext, 'small')}
              </div>
            )}
            <span className="text-lg font-semibold">文件详情</span>
          </div>
        </div>
      }
      className="file-details-modal"
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div className="space-y-6">
          {/* 文件图标和名称 */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="mb-4">
            {file.type === 'folder' ? (
              <AiFillFolder className="h-24 w-24 text-amber-400" />
            ) : (
              <div className="text-gray-400">
                {getFileIcon(file.ext, 'large')}
              </div>
            )}
            </div>
            {
              <>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">
            {getFileDisplayName(file)}
          </h3>
                <Space>
                  {file.type === 'file' ? (
                    <Tag color="blue">文件</Tag>
                  ) : (
                    <Tag color="orange">文件夹</Tag>
                  )}
                  {file.type === 'file' && file.ext && (
                    <Tag color="green">{file.ext.toUpperCase()}</Tag>
                  )}
                </Space>
              </>
            }
          </div>

          <Divider />

          {/* 详细信息 */}
          <Descriptions column={1} bordered>
            <Descriptions.Item label="名称">
              {isEditing ? (
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: '请输入名称' },
                    { min: 1, message: '名称至少1个字符' },
                    { max: 255, message: '名称最多255个字符' },
                  ]}
                  className="mb-0"
                >
                  <Input placeholder="请输入名称" />
                </Form.Item>
              ) : (
                <span>{getFileDisplayName(file)}</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="类型">
              {file.type === 'file' ? (
                <Space>
                  <Tag color="blue">文件</Tag>
                  {file.ext && (
                    <Tag color="green">{file.ext.toUpperCase()}</Tag>
                  )}
                </Space>
              ) : (
                <Tag color="orange">文件夹</Tag>
              )}
            </Descriptions.Item>

            {file.type === 'file' && (
              <Descriptions.Item label="大小">
                {formatFileSize(file.size)}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="位置">
              <span className="text-gray-600">{filePath}</span>
            </Descriptions.Item>

            <Descriptions.Item label="创建时间">
              {formatDateTime(file.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="修改时间">
              {formatDateTime(file.updatedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="文件ID">
              <span className="font-mono text-xs text-gray-500">{file.id}</span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
          {isEditing ? (
            <>
              <Button icon={<AiOutlineClose />} onClick={handleCancel}>
                取消
              </Button>
              <Button
                type="primary"
                icon={<AiOutlineCheck />}
                onClick={handleSave}
                className="bg-[#5542f6] hover:bg-[#4532e6]"
              >
                保存
              </Button>
            </>
          ) : (
            <>
              <Button
                icon={<AiOutlineDownload />}
                onClick={() => {
                  message.info(`正在下载 ${file.name}...`);
                }}
              >
                下载
              </Button>
              <Button
                icon={<AiOutlineShareAlt />}
                onClick={() => {
                  message.info(`正在分享 ${file.name}...`);
                }}
              >
                分享
              </Button>
              <Button
                type="primary"
                icon={<AiOutlineEdit />}
                onClick={() => setIsEditing(true)}
                className="bg-[#5542f6] hover:bg-[#4532e6]"
              >
                编辑
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
}
