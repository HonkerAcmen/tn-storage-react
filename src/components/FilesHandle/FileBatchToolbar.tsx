import { Button, Space } from 'antd';

interface FileBatchToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  deleteLabel?: string;
}

export default function FileBatchToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  onDelete,
  onDownload,
  onRestore,
  onPermanentDelete,
  deleteLabel = '移入回收站',
}: FileBatchToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  const actionBtnClass =
    '!h-7 !border-gray-300 !text-gray-700 !shadow-none hover:!border-gray-400 hover:!text-gray-900';

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-2.5">
      <span className="text-sm text-gray-600">
        已选择 {selectedCount} / {totalCount} 项
      </span>
      <Space size={8} wrap>
        <Button size="small" className={actionBtnClass} onClick={onSelectAll}>
          全选
        </Button>
        <Button size="small" className={actionBtnClass} onClick={onClear}>
          取消选择
        </Button>
        {onDownload ? (
          <Button size="small" className={actionBtnClass} onClick={onDownload}>
            下载
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            size="small"
            danger
            className="!h-7 !shadow-none"
            onClick={onDelete}
          >
            {deleteLabel}
          </Button>
        ) : null}
        {onRestore ? (
          <Button size="small" className={actionBtnClass} onClick={onRestore}>
            恢复
          </Button>
        ) : null}
        {onPermanentDelete ? (
          <Button
            size="small"
            danger
            className="!h-7 !shadow-none"
            onClick={onPermanentDelete}
          >
            永久删除
          </Button>
        ) : null}
      </Space>
    </div>
  );
}
