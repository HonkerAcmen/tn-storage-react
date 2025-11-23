import { FileSystemNode, FileExtension } from "@/types/fileSystem";

const exts: FileExtension[] = [
  "txt", "pdf", "jpg", "png", "mp4", "mp3",
  "json", "zip", "doc", "docx", "wav",
  "tar", "xlsx", "log", "other"
];

function randomExt(): FileExtension {
  return exts[Math.floor(Math.random() * exts.length)];
}

function randomName(prefix: string) {
  return `${prefix}_${Math.floor(Math.random() * 10000)}`;
}

function randomDate() {
  return new Date(Date.now() - Math.floor(Math.random() * 10000000000));
}

function createFile(id: string): FileSystemNode {
  return {
    id,
    name: randomName("file"),
    createdAt: randomDate(),
    updatedAt: randomDate(),
    type: "file",
    size: Math.floor(Math.random() * 2000) + 100,
    ext: randomExt(),
  };
}

function createFolder(
  id: string,
  depth: number,
  maxDepth: number,
  maxChildren: number
): FileSystemNode {
  const children: FileSystemNode[] = [];

  if (depth < maxDepth) {
    const childCount = Math.floor(Math.random() * maxChildren) + 1;

    for (let i = 0; i < childCount; i++) {
      const isFile = Math.random() < 0.6; // 60% 文件
      const childId = `${id}-${i + 1}`;

      if (isFile) {
        children.push(createFile(childId));
      } else {
        children.push(
          createFolder(childId, depth + 1, maxDepth, maxChildren)
        );
      }
    }
  }

  return {
    id,
    name: randomName("folder"),
    createdAt: randomDate(),
    updatedAt: randomDate(),
    type: "folder",
    children,
  };
}

/**
 * 生成随机文件系统
 */
export function generateFileSystem(
  maxDepth = 3,
  maxChildren = 6
): FileSystemNode {
  return createFolder("1", 0, maxDepth, maxChildren);
}
