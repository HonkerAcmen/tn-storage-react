import { useState, useMemo, useEffect, useRef } from 'react';
import {
  AiFillCloseCircle,
  AiOutlineSearch,
  AiOutlineInfoCircle,
} from 'react-icons/ai';
import { Empty, message } from 'antd';

import { useFileData } from '@/contexts/FileDataContext';
import { searchNodes } from '@/utils/fileSystem/fileSystemUtils';
import FileListItem from '@/components/FileListItem';
import FileDetailsModal from './FilesHandle/FileDetailsModal';
import { formatDate } from '@/utils/format/formatters';
import { FileSystemTreeNode } from '@/network/types/Response/file';

interface SearchResultsProps {
  open: boolean;
  searchKeyword: string;
  onClose: () => void;
  onSearchChange?: (keyword: string) => void;
}

export default function SearchResults({
  open,
  searchKeyword: initialKeyword = '',
  onClose,
  onSearchChange,
}: SearchResultsProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const { updateFile, fileMap } = useFileData();
  const [selectedFile, setSelectedFile] = useState<FileSystemTreeNode | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const prevInitialKeywordRef = useRef<string>(initialKeyword || '');

  // 同步外部传入的搜索关键词（使用异步更新避免级联渲染）
  useEffect(() => {
    const currentInitial = initialKeyword || '';
    if (prevInitialKeywordRef.current !== currentInitial) {
      prevInitialKeywordRef.current = currentInitial;
      // 使用 setTimeout 异步更新，避免同步 setState
      setTimeout(() => {
        setSearchKeyword(currentInitial);
      }, 0);
    }
  }, [initialKeyword]);

  // 执行搜索
  const searchResults = useMemo(() => {
    if (!searchKeyword || !searchKeyword.trim()) {
      return [];
    }
    return searchNodes(fileMap, searchKeyword);
  }, [fileMap, searchKeyword]);

  // 当模态框打开时，聚焦输入框
  useEffect(() => {
    if (open && inputRef.current) {
      // 延迟聚焦，确保模态框已完全渲染
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [open]);

  // 处理搜索关键词变化
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // 处理文件更新
  const handleFileUpdate = async (
    fileId: string,
    updates: Partial<FileSystemTreeNode>
  ) => {
    try {
      await updateFile(fileId, updates);
      messageApi.success('文件信息已更新');
    } catch {
      messageApi.error('更新文件失败');
    }
  };

  // 处理文件点击
  const handleFileClick = (file: FileSystemTreeNode) => {
    setSelectedFile(file);
    setShowDetails(true);
  };

  if (!open) return null;

  return (
    <>
      {contextHolder}
      <div className="search-overlay fixed inset-0 z-50 flex items-center justify-center bg-gray-400/50">
        <div className="search-modal relative flex h-[85vh] w-[90vw] max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex flex-1 items-center space-x-4">
              <AiOutlineSearch className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchKeyword}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 border-none text-lg focus:outline-none"
                placeholder="搜索文件和文件夹..."
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onClose();
                  }
                }}
              />
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-gray-100"
            >
              <AiFillCloseCircle className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* 搜索结果内容 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                搜索结果
                {searchKeyword && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({searchResults.length} 个结果)
                  </span>
                )}
              </h3>
            </div>

            {!searchKeyword || !searchKeyword.trim() ? (
              <div className="flex h-64 items-center justify-center">
                <Empty
                  description="请输入搜索关键词"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <Empty
                  description={`未找到包含 "${searchKeyword}" 的文件或文件夹`}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <ul className="space-y-2">
                {searchResults.map((file) => (
                  <FileListItem
                    key={file.id}
                    file={file}
                    showSize={file.type === 'file'}
                    showTime={true}
                    timeLabel="修改时间"
                    timeValue={formatDate(new Date(file.updatedAt))}
                    onClick={() => handleFileClick(file)}
                    actions={
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileClick(file);
                        }}
                        className="flex items-center justify-center rounded-lg px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-[#5542f6]"
                      >
                        <AiOutlineInfoCircle className="mr-1 h-4 w-4" />
                        详情
                      </button>
                    }
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 文件详情模态框 */}
      {selectedFile && (
        <FileDetailsModal
          open={showDetails}
          file={selectedFile}
          onClose={() => {
            setShowDetails(false);
            setSelectedFile(null);
          }}
          onUpdate={handleFileUpdate}
        />
      )}

      {/* 过渡动画样式 */}
      <style jsx>{`
        .search-overlay {
          animation: fadeIn 0.3s ease-out;
        }

        .search-modal {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
