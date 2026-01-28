import { AiFillFolder } from 'react-icons/ai'; // 假设你用的是这个库
import { FileSystemTreeNode } from '../../../network/types/Response/file';
interface FolderItemProps {
  item: FileSystemTreeNode;
  selectKey: string;
  onSelect: (key: string) => void;
}

export const FolderItem = ({ item, selectKey, onSelect }: FolderItemProps) => {
  const isSelect = selectKey === item.UUID;

  // 1. 过滤：如果不是文件夹，直接不渲染 (返回 null)
  if (item.type !== 'folder') return null;

  return (
    <div className="flex flex-col">
      {/* 渲染当前文件夹的 UI */}
      <li
        onClick={() => onSelect(item.UUID)}
        className={`my-1 flex cursor-pointer rounded-lg border border-gray-100 bg-gray-100 p-2 hover:border-gray-300 ${isSelect ? 'border-gray-300' : ''}`}
      >
        <div className="flex flex-row items-center justify-between">
          <div className="mr-2">
            <AiFillFolder className="h-8 w-8 text-amber-400" />
          </div>
          <div>{item.name}</div>
        </div>
      </li>

      {/* 2. 递归：如果有 children，继续渲染子级 */}
      {item.children && item.children.length > 0 && (
        //这里添加 ml-8 (margin-left) 可以在视觉上产生缩进效果，体现层级关系
        <ul className="ml-8">
          {item.children.map((child) => (
            <FolderItem
              key={child.id}
              item={child}
              selectKey={selectKey}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
