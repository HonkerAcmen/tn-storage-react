import { FileSystemNode, FolderNode } from '@/types/fileSystem';
import { fileDatas } from '../../mock/index';
import { FileNode } from '../../types/fileSystem';
import { AiFillFolder } from 'react-icons/ai';
import { useRouter } from 'next/router';
import { JSX } from 'react';
interface FolderPageProps {
  folderId: string;
  renderMap: Record<string, JSX.Element>;
}

/**
 * 待做：需要抽象成一个组件把这个和AllFiles里面的文件夹逻辑
 * 思路：我们的需求就是打开所有文件项，然后显示第一层的文件和文件夹，点击文件夹继续显示下一层。这个和树结构差不多像，可以考虑
 * 一个文件树，我们在第一层的时候遍历第一层树节点，在某个层就遍历某层节点，需要注意的是，这个层就是非空文件夹
 */

export default function FolderPage({ folderId }: FolderPageProps) {
  // 存放新一层文件夹及文件
  const files: Array<FileSystemNode> = [];
  const router = useRouter();
  let num = 0;

  // 筛选出符合文件夹id的文件夹
  const newFileDatas = fileDatas.filter((item) =>
    item.id === folderId ? item : null
  );
  function traverse(nodes: FileSystemNode[]) {
    for (const node of nodes) {
      if (node.type === 'folder' && num < 1) {
        num += 1;
        traverse(node.children);
      } else {
        files.push(node);
      }
    }
  }
  traverse(newFileDatas);

  // 生成假的文件系统数据
  type withOutChildren = Omit<FolderNode, 'children'>;
  type newFileSystemType = withOutChildren | FileNode;

  const newTypeFileDatas: newFileSystemType[] = files.map((item) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item.type === 'folder' ? (({ children, ...rest }) => rest)(item) : item
  );

  function handleClick(item: newFileSystemType) {
    if (item.type === 'folder') {
      // 核心修复：使用 router.pathname 保持当前主路由不变，仅更新参数
      // shallow: true 避免运行 getServerSideProps (根据你的数据获取策略决定是否保留)
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, folderId: item.id, name: item.name },
        },
        undefined,
        { shallow: true }
      );
    } else {
      console.log('preview', item.name);
    }
  }

  // 处理面包屑导航点击
  const handleBreadcrumbClick = () => {
    // 移除 folderId 参数，回到根目录
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { folderId, name, ...restQuery } = router.query;
    router.push(
      {
        pathname: router.pathname,
        query: restQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <ul className="grid w-full gap-6 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {newTypeFileDatas.map((v, i) => (
        <li
          key={i}
          className="flex h-60 w-60 cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 transition duration-150 hover:bg-gray-100"
          onClick={() => handleClick(v)}
        >
          {v.type === 'folder' ? (
            <div className="flex flex-col items-center justify-center">
              <AiFillFolder className="h-20 w-20 text-amber-400" />
              <span className="text-sm text-gray-600">{v.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {/* {renderMap[v.ext] || renderMap['other']}
              <span className="text-sm text-gray-600">
                {v.name}.{v.ext}
              </span> */}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
