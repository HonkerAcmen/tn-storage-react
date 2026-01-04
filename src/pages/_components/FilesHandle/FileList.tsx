import { useRouter } from 'next/router';
import { JSX, useMemo } from 'react';
import { Breadcrumb } from 'antd';
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
} from 'react-icons/ai';

import {
  FileSystemNode,
  findPathToNode,
  getChildrenByParentId,
} from '@/types/fileSystem';
import { useFileData } from '@/contexts/FileDataContext';

// 将 renderMap 移出组件，避免重复创建对象
// 使用 Record 类型增强类型安全
const ICON_SIZE_CLASS = 'h-16 w-16'; // 统一调整图标大小，避免太突兀
const RENDER_MAP: Record<string, JSX.Element> = {
  txt: <AiFillFileText className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  pdf: <AiFillFilePdf className={`${ICON_SIZE_CLASS} text-red-400`} />,
  jpg: <AiOutlineFileJpg className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  png: <AiOutlineFileImage className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  mp4: <AiFillPlaySquare className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  mp3: <AiFillMuted className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  json: <AiFillFileText className={`${ICON_SIZE_CLASS} text-gray-400`} />,
  zip: <AiFillFileZip className={`${ICON_SIZE_CLASS} text-amber-400`} />,
  doc: <AiFillFileText className={`${ICON_SIZE_CLASS} text-blue-400`} />,
  docx: <AiFillFileText className={`${ICON_SIZE_CLASS} text-blue-400`} />,
  xlsx: <AiFillFileExcel className={`${ICON_SIZE_CLASS} text-green-400`} />,
  other: <AiFillFileUnknown className={`${ICON_SIZE_CLASS} text-gray-400`} />,
};

export default function FileList() {
  const router = useRouter();
  const { fileTree } = useFileData();

  // 获取当前文件夹ID，默认为根节点ID '1'
  const currentFolderId = (router.query.folderId as string) || '1';

  // 计算当前层级的文件 (使用你之前的函数)
  const siblings = useMemo(() => {
    return getChildrenByParentId(fileTree, currentFolderId);
  }, [fileTree, currentFolderId]);

  // 计算面包屑路径 (使用新算法)
  const breadcrumbPath = useMemo(() => {
    return findPathToNode(fileTree, currentFolderId);
  }, [fileTree, currentFolderId]);

  // 统一导航处理
  function handleNavigate(targetId: string) {
    // 如果点击的是当前所在文件夹，不进行跳转
    if (targetId === currentFolderId) return;

    router.push(
      {
        pathname: router.pathname,
        // 通过 ID 动态计算路径，不再依赖 URL 里的 name
        query: { ...router.query, folderId: targetId },
      },
      undefined,
      { shallow: true }
    );
  }

  function handleItemClick(item: FileSystemNode) {
    if (item.type === 'folder') {
      handleNavigate(item.id);
    } else {
      console.log('Preview file:', item.name);
      // 这里可以加入文件预览逻辑
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 5. 修复面包屑：基于路径数组渲染 */}
      <Breadcrumb
        className="mt-4 px-4"
        items={breadcrumbPath.map((node, index) => {
          // 是否是最后一个节点（当前目录）
          const isLast = index === breadcrumbPath.length - 1;
          return {
            title: (
              <span
                onClick={() => !isLast && handleNavigate(node.id)}
                className={
                  !isLast
                    ? 'cursor-pointer rounded-md border border-white px-2 py-1 transition hover:border-gray-200 hover:text-gray-600'
                    : 'cursor-pointer rounded-md border border-white bg-gray-200 px-2 py-1 text-gray-600 transition duration-150 hover:border-gray-200'
                }
              >
                {node.name === 'root' ? '根目录' : node.name}
              </span>
            ),
          };
        })}
      />

      <ul className="grid w-full grid-cols-2 gap-6 p-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {siblings.map((v) => (
          <li
            // 使用唯一 id 作为 key，而不是 index
            key={v.id}
            className="flex cursor-pointer flex-col items-center justify-start rounded-xl border border-transparent p-4 transition-all duration-200 hover:border-gray-200 hover:bg-gray-100"
            onClick={() => handleItemClick(v)}
          >
            <div className="mb-3">
              {v.type === 'folder' ? (
                <AiFillFolder
                  className={`${ICON_SIZE_CLASS} text-yellow-400`}
                />
              ) : (
                // 使用 ?. 链式调用防止 ext 不存在导致的崩溃
                RENDER_MAP[v.ext || ''] || RENDER_MAP['other']
              )}
            </div>

            <span className="line-clamp-2 px-2 text-center text-sm break-all text-gray-700">
              {v.name}
              {v.type === 'file' && v.ext ? `.${v.ext}` : ''}
            </span>
          </li>
        ))}

        {siblings.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400">
            暂无文件
          </div>
        )}
      </ul>
    </div>
  );
}
