import { AiFillFolder } from 'react-icons/ai'; // 假设你用的是这个库
import { FileSystemTreeNode } from '../../network/types/Response/file';
import { isVirtualRoot } from '@/utils/fileSystem/fileSystemUtils';
interface FolderItemProps {
  item: FileSystemTreeNode;
  selectKey: string;
  selectId: string; // 要给上传的文件指定文件夹的id 所以返回一个文件夹id
  onSelect: (key: string) => void;
  onSelectId: (id: string) => void;
}

export default function FolderItem({
  item,
  selectKey,
  selectId,
  onSelect,
  onSelectId,
}: FolderItemProps) {
  const isSelect = selectKey === item.UUID;

  // 1. 过滤：如果不是文件夹，直接不渲染 (返回 null)
  if (item.type !== 'folder') return null;

  return (
    <div className="flex flex-col">
      {/* 渲染当前文件夹的 UI */}
      <li
        onClick={() => {
          onSelect(item.UUID);
          onSelectId(item.id);
        }}
        className={`my-1 flex cursor-pointer rounded-lg border p-2 transition duration-200 ${
          isSelect
            ? 'border-(--color-border-default) bg-(--select-bg) shadow-sm'
            : 'border-(--color-border-strong) bg-(--select-no-bg)'
        }`}
        aria-selected={isSelect}
      >
        <div className="flex flex-row items-center justify-between">
          <div className="mr-2">
            <AiFillFolder className="h-4 w-4 text-amber-400" />
          </div>
          {isVirtualRoot(item) ? <div>根目录</div> : <div>{item.filename}</div>}
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
              selectId={selectId}
              selectKey={selectKey}
              onSelect={onSelect}
              onSelectId={onSelectId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
