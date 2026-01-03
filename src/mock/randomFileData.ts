import { FileSystemNode, FileExtension } from "@/types/fileSystem";

const exts: FileExtension[] = [
  "txt", "pdf", "jpg", "png", "mp4", "mp3",
  "json", "zip", "doc", "docx", "wav",
  "tar", "xlsx", "log", "other"
];

// 使用固定的种子来确保服务器端和客户端生成相同的数据
class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// 创建全局的随机数生成器实例，确保服务器端和客户端使用相同的种子
let seededRandom: SeededRandom | null = null;

function getSeededRandom(): SeededRandom {
  if (!seededRandom) {
    seededRandom = new SeededRandom(12345);
  }
  return seededRandom;
}

function randomExt(): FileExtension {
  const rng = getSeededRandom();
  return exts[Math.floor(rng.next() * exts.length)];
}

function randomName(prefix: string, index: number): string {
  // 使用索引而不是随机数，确保可重复
  const rng = getSeededRandom();
  const num = Math.floor(rng.next() * 10000) + index;
  return `${prefix}_${num}`;
}

function randomDate(index: number): Date {
  // 使用索引来生成可重复的日期
  // 使用固定的基准日期（2024-01-01），确保服务器端和客户端生成相同的日期
  const baseDate = new Date('2024-01-01T00:00:00Z').getTime();
  const rng = getSeededRandom();
  const daysAgo = Math.floor(rng.next() * 365) + index;
  return new Date(baseDate - daysAgo * 24 * 60 * 60 * 1000);
}

function createFile(id: string, index: number): FileSystemNode {
  const rng = getSeededRandom();
  return {
    id,
    name: randomName("file", index),
    createdAt: randomDate(index),
    updatedAt: randomDate(index + 1000),
    type: "file",
    size: Math.floor(rng.next() * 2000) + 100,
    ext: randomExt(),
  };
}

function createFolder(
  id: string,
  depth: number,
  maxDepth: number,
  maxChildren: number,
  globalIndex: { value: number }
): FileSystemNode {
  const children: FileSystemNode[] = [];

  if (depth < maxDepth) {
    const rng = getSeededRandom();
    const childCount = Math.floor(rng.next() * maxChildren) + 1;

    for (let i = 0; i < childCount; i++) {
      const isFile = rng.next() < 0.6; // 60% 文件
      const childId = `${id}-${i + 1}`;
      const currentIndex = globalIndex.value++;

      if (isFile) {
        children.push(createFile(childId, currentIndex));
      } else {
        children.push(
          createFolder(childId, depth + 1, maxDepth, maxChildren, globalIndex)
        );
      }
    }
  }

  const folderIndex = globalIndex.value++;
  return {
    id,
    name: randomName("folder", folderIndex),
    createdAt: randomDate(folderIndex),
    updatedAt: randomDate(folderIndex + 1000),
    type: "folder",
    children,
  };
}

/**
 * 生成随机文件系统
 * @param maxDepth 最大深度
 * @param maxChildren 最大子节点数
 * @param seed 随机数种子，如果不提供则使用当前时间戳
 */
export function generateFileSystem(
  maxDepth = 3,
  maxChildren = 6,
  seed?: number
): FileSystemNode {
  // 如果没有提供种子，使用当前时间戳（仅在客户端）
  const finalSeed = seed ?? (typeof window !== 'undefined' ? Date.now() : 12345);
  // 重置随机数生成器，使用新的种子
  seededRandom = new SeededRandom(finalSeed);
  const globalIndex = { value: 0 };
  return createFolder("1", 0, maxDepth, maxChildren, globalIndex);
}
