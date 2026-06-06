import { Typography, Tag, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { AiFillFolder, AiOutlineEllipsis } from 'react-icons/ai';
import { getFileIcon, ICON_SIZE_MEDIUM } from './FilesHandle/FileIcon';
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
  const ext = file.filename
    .split('.')
    [file.filename.split('.').length - 1].toLocaleLowerCase()
    .trim();

  return (
    <li
      className="mb-2 flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-gray-100 px-4 py-3 transition hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="shrink-0">
        {file.type === 'folder' ? (
          <AiFillFolder className={`${ICON_SIZE_MEDIUM} text-amber-400`} />
        ) : (
          <div className="text-gray-400">{getFileIcon(ext, 'small')}</div>
        )}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <Text
            ellipsis={{ tooltip: file.filename }}
            className="min-w-0 flex-1 text-gray-800"
          >
            {file.filename}
          </Text>
          {showSize && file.type === 'file' ? (
            <Tag color="blue" className="!m-0 shrink-0">
              {formatFileSize(parseInt(file.size))}
            </Tag>
          ) : null}
          {showType && file.type === 'folder' ? (
            <Tag color="orange" className="!m-0 shrink-0">
              文件夹
            </Tag>
          ) : null}
        </div>
        {showTime && timeValue ? (
          <div className="mt-0.5 line-clamp-1 min-w-0 overflow-hidden text-xs text-gray-500">
            {typeof timeValue === 'string' ? (
              <span>
                {timeLabel ? `${timeLabel} ` : ''}
                {timeValue}
              </span>
            ) : (
              timeValue
            )}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {actions}
        {menuItems ? (
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
        ) : null}
      </div>
    </li>
  );
}
