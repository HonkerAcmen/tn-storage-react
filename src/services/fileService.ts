import type { FileSystemNode } from '@/types/fileSystem';
import { openMock, getMockFileSystem } from '@/mock/index';

/**
 * 文件系统 API 服务
 * 根据 openMock 开关决定使用 Mock 数据还是真实 API
 * 
 * 当 openMock = true 时，使用 Mock 数据服务
 * 当 openMock = false 时，调用真实后端 API
 */

/**
 * 获取文件系统树
 */
export async function getFileSystemTree(): Promise<FileSystemNode> {
  if (openMock) {
    // 使用 Mock 数据
    const mockData = getMockFileSystem();
    if (!mockData) {
      throw new Error('Failed to generate mock file system');
    }
    return mockData;
  } else {
    // 调用真实 API
    try {
      const response = await fetch('/api/files/tree');
      if (!response.ok) {
        throw new Error('Failed to fetch file system tree');
      }
      const data = await response.json();
      // 转换日期字符串为 Date 对象
      return transformFileSystemNode(data);
    } catch (error) {
      console.error('Error fetching file system tree:', error);
      throw error;
    }
  }
}

/**
 * 更新文件信息
 */
export async function updateFile(
  fileId: string,
  updates: Partial<FileSystemNode>
): Promise<FileSystemNode> {
  if (openMock) {
    // 假数据：直接返回更新后的数据（实际应该更新状态）
    return {} as FileSystemNode;
  } else {
    // 调用真实 API
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update file');
      }
      const data = await response.json();
      return transformFileSystemNode(data);
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }
}

/**
 * 删除文件
 */
export async function deleteFile(fileId: string): Promise<void> {
  if (openMock) {
    // 假数据：直接返回（实际应该更新状态）
    return;
  } else {
    // 调用真实 API
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

/**
 * 转换文件系统节点：将 API 返回的数据转换为应用使用的格式
 */
function transformFileSystemNode(node: any): FileSystemNode {
  return {
    ...node,
    createdAt: new Date(node.createdAt),
    updatedAt: new Date(node.updatedAt),
    children: node.children
      ? node.children.map(transformFileSystemNode)
      : undefined,
  };
}

