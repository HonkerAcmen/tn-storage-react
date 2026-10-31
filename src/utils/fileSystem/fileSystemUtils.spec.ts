import { describe, expect, it } from 'vitest';
import { FileSystemTreeNode } from '@/network/types/Response/file';
import { ROOT_NODE_ID } from '@/utils/constants/fileConstants';
import { findNodeById, findPathToNode, getChildrenByParentId, isVirtualRoot } from './fileSystemUtils';

describe('virtual root identity', () => {
  it('distinguishes the virtual root from real folder ID 1 during navigation', () => {
    const child: FileSystemTreeNode = { id: '2', UUID: 'child', filename: 'child', type: 'folder', parent_id: 1, children: [], size: '0', ext: 'other', createdAt: '', updatedAt: '' };
    const folder = { id: '1', UUID: 'folder', filename: 'folder', type: 'folder', parent_id: 0, children: [child] } as FileSystemTreeNode;
    const root = { id: ROOT_NODE_ID, UUID: '0', filename: 'root', type: 'folder', parent_id: 0, children: [folder] } as FileSystemTreeNode;
    expect(ROOT_NODE_ID).toBe('0');
    expect(isVirtualRoot(root)).toBe(true);
    expect(isVirtualRoot(folder)).toBe(false);
    expect(findNodeById(root, '1')).toBe(folder);
    expect(findPathToNode(root, '2').map(n => n.id)).toEqual(['0', '1', '2']);
    const map = new Map([[root.id, root], [folder.id, folder], [child.id, child]]);
    expect(getChildrenByParentId(map, '0')).toEqual([folder]);
    expect(getChildrenByParentId(map, '1')).toEqual([child]);
  });
});
