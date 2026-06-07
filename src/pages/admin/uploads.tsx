import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Popconfirm,
  Progress,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { MdCancel } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { AdminUserSelect } from '@/components/admin/AdminUserSelect';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  useAdminBatchCancelUploadTasks,
  useAdminCancelUploadTask,
  useAdminUploadTasks,
} from '@/network/hooks/admin';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { AdminUploadTaskItem } from '@/network/types/Response/admin';
import { formatDateTime, formatFileSize } from '@/utils/format/formatters';

export default function AdminUploadsPage() {
  const [userIdFilter, setUserIdFilter] = useState<number | undefined>();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const cancelTask = useAdminCancelUploadTask();
  const batchCancel = useAdminBatchCancelUploadTasks();

  const { data, isLoading, isError, refetch } = useAdminUploadTasks(
    userIdFilter ? { userId: userIdFilter } : undefined,
  );

  const result = data?.data?.data;
  const items = result?.items ?? [];
  const total = result?.total ?? 0;

  const resumableCount = useMemo(
    () => items.filter((item) => item.resumable).length,
    [items],
  );

  const handleBatchCancel = async () => {
    if (selectedTaskIds.length === 0) {
      return;
    }
    try {
      const res = await batchCancel.mutateAsync(selectedTaskIds);
      const cancelled = res.data.data.cancelled;
      feedback.success(`已取消 ${cancelled} 个上传任务`);
      setSelectedTaskIds([]);
    } catch (err) {
      feedback.error(err, '批量取消失败');
    }
  };

  return (
    <AdminLayout title="上传监控">
      <Card {...adminCardProps}>
        <Space wrap className="mb-4">
          <AdminUserSelect
            value={userIdFilter}
            onChange={(v) => {
              setUserIdFilter(v);
              setSelectedTaskIds([]);
            }}
          />
          <Typography.Text type="secondary">
            进行中 {total} 个
            {resumableCount > 0 ? `，可断点续传 ${resumableCount} 个` : ''}
          </Typography.Text>
          {canWrite && selectedTaskIds.length > 0 ? (
            <Popconfirm
              title={`取消选中的 ${selectedTaskIds.length} 个上传任务？`}
              onConfirm={handleBatchCancel}
            >
              <Button danger loading={batchCancel.isPending}>
                批量取消
              </Button>
            </Popconfirm>
          ) : null}
        </Space>

        <AdminQueryAlert
          isError={isError}
          message="无法加载上传任务列表"
          onRetry={() => refetch()}
        />

        <Table<AdminUploadTaskItem>
          rowKey="taskId"
          loading={isLoading}
          dataSource={items}
          scroll={{ x: 1100 }}
          rowSelection={
            canWrite
              ? {
                  selectedRowKeys: selectedTaskIds,
                  onChange: (keys) => setSelectedTaskIds(keys as string[]),
                }
              : undefined
          }
          pagination={false}
          columns={[
            { title: '任务 ID', dataIndex: 'taskId', width: 220, ellipsis: true },
            { title: '文件名', dataIndex: 'filename', ellipsis: true },
            { title: '用户', dataIndex: 'username', width: 120 },
            {
              title: '大小',
              dataIndex: 'size',
              width: 100,
              render: (v: number) => formatFileSize(v),
            },
            {
              title: '进度',
              dataIndex: 'progress',
              width: 180,
              render: (progress: number, record) => (
                <div className="min-w-[140px]">
                  <Progress
                    percent={progress}
                    size="small"
                    status={record.status === 'failed' ? 'exception' : 'active'}
                  />
                  <span className="text-xs text-gray-500">
                    {record.receivedChunkIndexes.length}/{record.totalChunks} 分片
                  </span>
                </div>
              ),
            },
            {
              title: '断点续传',
              dataIndex: 'resumable',
              width: 100,
              render: (resumable: boolean) =>
                resumable ? (
                  <Tag color="blue">可续传</Tag>
                ) : (
                  <Tag>新任务</Tag>
                ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 90,
              render: (status: string) => {
                const color =
                  status === 'uploading'
                    ? 'processing'
                    : status === 'failed'
                      ? 'error'
                      : 'default';
                return <Tag color={color}>{status}</Tag>;
              },
            },
            {
              title: '最后活动',
              dataIndex: 'lastActivityAt',
              width: 170,
              render: (v: string) => formatDateTime(new Date(v)),
            },
            {
              title: '操作',
              key: 'actions',
              width: 100,
              fixed: 'right',
              render: (_, record) =>
                canWrite ? (
                  <Popconfirm
                    title="取消此上传任务？"
                    onConfirm={async () => {
                      try {
                        await cancelTask.mutateAsync(record.taskId);
                        feedback.success('已取消');
                        setSelectedTaskIds((prev) =>
                          prev.filter((id) => id !== record.taskId),
                        );
                      } catch (err) {
                        feedback.error(err, '取消失败');
                      }
                    }}
                  >
                    <Button
                      size="small"
                      danger
                      icon={<MdCancel />}
                      loading={cancelTask.isPending}
                    >
                      取消
                    </Button>
                  </Popconfirm>
                ) : (
                  '-'
                ),
            },
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
