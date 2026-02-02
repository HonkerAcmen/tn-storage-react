import { Typography, Space, Tag, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { AiFillFolder, AiOutlineEllipsis } from 'react-icons/ai';
import { getFileIcon, ICON_SIZE_MEDIUM } from './files/FileIcon';
import { formatFileSize } from '@/utils/format/formatters';
import { FileSystemTreeNode } from '@/network/types/Response/file';

const { Text } = Typography;

interface FileListItemProps {
  file: FileSystemTreeNode;
  menuItems?: MenuProps['items'];
  actions?: React.ReactNode;
  showSize?: boolean;
  showType?: boolean;
  showTime?: boolean;
  timeLabel?: string;
  timeValue?: React.ReactNode;
  onClick?: () => void;
}

/**
 * 文件列表项组件
 */
export default function FileListItem({
  file,
  menuItems,
  actions,
  showSize = true,
  showType = false,
  showTime = false,
  timeLabel,
  timeValue,
  onClick,
}: FileListItemProps) {
  return (
    <li
      className="mb-2 flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {file.type === 'folder' ? (
          <AiFillFolder className={`${ICON_SIZE_MEDIUM} text-amber-400`} />
        ) : (
          <div className="text-gray-400">{getFileIcon(file.ext, 'small')}</div>
        )}
        <div className="flex flex-col">
          <Space>
            <Text className="text-gray-800">{file.filename}</Text>
            {showSize && file.type === 'file' && (
              <Tag color="blue">{formatFileSize(parseInt(file.size))}</Tag>
            )}
            {showType && file.type === 'folder' && (
              <Tag color="orange">文件夹</Tag>
            )}
          </Space>
          {showTime && timeValue && (
            <div className="mt-1">
              {typeof timeValue === 'string' ? (
                <Text type="secondary" className="text-xs">
                  {timeLabel && `${timeLabel} `}
                  {timeValue}
                </Text>
              ) : (
                <Text type="secondary" className="text-xs text-gray-500">
                  {timeValue}
                </Text>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {actions}
        {menuItems && (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: (e) => e.domEvent.stopPropagation(),
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<AiOutlineEllipsis className="h-5 w-5 text-gray-600" />}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center"
            />
          </Dropdown>
        )}
      </div>
    </li>
  );
}
