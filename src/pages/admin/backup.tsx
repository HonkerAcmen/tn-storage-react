import { useState } from 'react';
import { Button, Card, Popconfirm, Space, Table, Tag } from 'antd';
import { MdBackup, MdDownload, MdDelete } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  downloadAdminBackupJob,
  useAdminBackupJobs,
  useAdminDeleteBackupJob,
  useAdminTriggerBackup,
} from '@/network/hooks/admin';
import { AdminBackupJob } from '@/network/types/Response/admin';
import { formatDateTime } from '@/utils/format/formatters';

const statusMap: Record<
  AdminBackupJob['status'],
  { color: string; label: string }
> = {
  pending: { color: 'default', label: '等待中' },
  running: { color: 'processing', label: '进行中' },
  completed: { color: 'success', label: '已完成' },
  failed: { color: 'error', label: '失败' },
};

export default function AdminBackupPage() {
  const { data, isLoading, refetch } = useAdminBackupJobs();
  const triggerBackup = useAdminTriggerBackup();
  const deleteBackup = useAdminDeleteBackupJob();
  const feedback = useAdminFeedback();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const jobs = data?.data?.data ?? [];

  const handleTrigger = async () => {
    try {
      await triggerBackup.mutateAsync();
      feedback.success('备份任务已创建');
      await refetch();
    } catch (err) {
      feedback.error(err, '创建备份失败');
    }
  };

  const handleDownload = async (job: AdminBackupJob) => {
    setDownloadingId(job.id);
    try {
      await downloadAdminBackupJob(job.id);
      feedback.success('下载已开始');
    } catch (err) {
      feedback.error(err, '下载失败');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBackup.mutateAsync(id);
      feedback.success('备份已删除');
    } catch (err) {
      feedback.error(err, '删除失败');
    }
  };

  return (
    <AdminLayout title="数据备份">
      <Card
        {...adminCardProps}
        title="备份任务"
        extra={
          <Button
            type="primary"
            icon={<MdBackup />}
            loading={triggerBackup.isPending}
            onClick={handleTrigger}
          >
            立即备份
          </Button>
        }
      >
        <p className="mb-4 text-sm text-gray-500">
          备份将导出核心数据表 JSON（用户密码字段已脱敏），若服务器安装了
          mysqldump 还会额外生成 SQL 文件。已完成任务可下载 ZIP 或删除。
        </p>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={jobs}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
          columns={[
            { title: '任务 ID', dataIndex: 'id', width: 180 },
            {
              title: '状态',
              dataIndex: 'status',
              width: 100,
              render: (status: AdminBackupJob['status']) => {
                const meta = statusMap[status];
                return <Tag color={meta.color}>{meta.label}</Tag>;
              },
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              width: 170,
              render: (v: string) => formatDateTime(new Date(v)),
            },
            {
              title: '完成时间',
              dataIndex: 'finishedAt',
              width: 170,
              render: (v: string | null) =>
                v ? formatDateTime(new Date(v)) : '-',
            },
            {
              title: '文件数',
              dataIndex: 'files',
              width: 80,
              render: (files: string[]) => files.length,
            },
            { title: '说明', dataIndex: 'message', ellipsis: true },
            {
              title: '输出文件',
              dataIndex: 'files',
              width: 160,
              render: (files: string[]) => (
                <Space direction="vertical" size={0}>
                  {files.length === 0
                    ? '-'
                    : files.map((f) => (
                        <span key={f} className="text-xs text-gray-500">
                          {f}
                        </span>
                      ))}
                </Space>
              ),
            },
            {
              title: '操作',
              key: 'actions',
              width: 160,
              fixed: 'right',
              render: (_, record) => (
                <Space>
                  <Button
                    size="small"
                    icon={<MdDownload />}
                    disabled={
                      record.status !== 'completed' || record.files.length === 0
                    }
                    loading={downloadingId === record.id}
                    onClick={() => handleDownload(record)}
                  >
                    下载
                  </Button>
                  <Popconfirm
                    title="确定删除该备份？本地文件将一并移除。"
                    disabled={
                      record.status === 'running' || record.status === 'pending'
                    }
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Button
                      size="small"
                      danger
                      icon={<MdDelete />}
                      disabled={
                        record.status === 'running' ||
                        record.status === 'pending'
                      }
                      loading={deleteBackup.isPending}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
