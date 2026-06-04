import { Button, Card, Space, Table, Tag } from 'antd';
import { MdBackup } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  useAdminBackupJobs,
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
  const feedback = useAdminFeedback();
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
          mysqldump 还会额外生成 SQL 文件。任务记录保存在后端 backups 目录。
        </p>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={jobs}
          pagination={{ pageSize: 8 }}
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
              width: 180,
              render: (v: string) => formatDateTime(new Date(v)),
            },
            {
              title: '完成时间',
              dataIndex: 'finishedAt',
              width: 180,
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
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
