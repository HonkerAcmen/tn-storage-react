import type { FileSystemNode } from '@/types/fileSystem';
import { generateFileSystem } from './randomFileData';
import { getAllFiles } from '@/utils/fileSystem/fileSystemUtils';

/**
 * Mock 数据服务
 * 统一管理所有 mock 数据的生成和初始化逻辑
 * 为真实后端数据接入做准备
 * 
 * 注意：这些函数用于生成 Mock 数据
 * 调用这些函数前，应该先检查 openMock 开关
 */

/**
 * 获取 Mock 文件系统数据
 * 根据环境（服务器端/客户端）生成相应的 Mock 数据
 */
export function getMockFileSystem(): FileSystemNode {
  if (typeof window === 'undefined') {
    // 服务器端使用固定种子
    return generateFileSystem(3, 6, 12345);
  }
  // 客户端使用当前时间戳作为种子
  const seed = Date.now();
  return generateFileSystem(3, 6, seed);
}

/**
 * 获取所有文件（用于初始化默认数据）
 */
export function getMockAllFiles(): FileSystemNode[] {
  const fileSystem = getMockFileSystem();
  if (!fileSystem) {
    return [];
  }
  return getAllFiles(fileSystem);
}

/**
 * 初始化默认收藏数据
 */
export function initializeMockFavorites(): string[] {
  const allFiles = getMockAllFiles();
  return allFiles.slice(0, 5).map((file) => file.id);
}

/**
 * 初始化默认已删除文件数据
 */
export function initializeMockDeletedFiles(): Array<{
  file: FileSystemNode;
  deletedAt: Date;
}> {
  const allFiles = getMockAllFiles();
  return allFiles.slice(0, 3).map((file) => ({
    file,
    deletedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 随机删除时间（最近7天内）
  }));
}

