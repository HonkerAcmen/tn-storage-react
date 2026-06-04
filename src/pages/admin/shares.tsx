import { useState } from 'react';
import { Button, Card, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { MdBlock } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { AdminUserSelect } from '@/components/admin/AdminUserSelect';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminRevokeShare, useAdminShares } from '@/network/hooks/admin';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { AdminShareItem } from '@/network/types/Response/admin';
import { formatDateTime } from '@/utils/format/formatters';

const statusMap: Record<
  AdminShareItem['status'],
  { color: string; label: string }
> = {
  active: { color: 'success', label: '有效' },
  revoked: { color: 'default', label: '已撤销' },
  expired: { color: 'warning', label: '已过期' },
};

export default function AdminSharesPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    AdminShareItem['status'] | undefined
  >();
  const [userIdFilter, setUserIdFilter] = useState<number | undefined>();
  const limit = 15;
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const revokeShare = useAdminRevokeShare();

  const { data, isLoading, isError, refetch } = useAdminShares({
    page,
    limit,
    keyword: search || undefined,
    userId: userIdFilter,
    status: statusFilter,
  });

  const result = data?.data?.data;
  const items = result?.items ?? [];
  const total = result?.pagination.total ?? 0;

  return (
    <AdminLayout title="分享链接">
      <Card {...adminCardProps}>
        <Space wrap className="mb-4">
          <Input.Search
            placeholder="搜索 token / 文件名"
            className="w-64"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={(v) => {
              setSearch(v.trim());
              setPage(1);
            }}
            allowClear
            onClear={() => {
              setKeyword('');
              setSearch('');
              setPage(1);
            }}
          />
          <AdminUserSelect
            value={userIdFilter}
            onChange={(v) => {
              setUserIdFilter(v);
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="状态"
            className="w-28"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'active', label: '有效' },
              { value: 'revoked', label: '已撤销' },
              { value: 'expired', label: '已过期' },
            ]}
          />
        </Space>
        <AdminQueryAlert
          isError={isError}
          message="无法加载分享列表"
          onRetry={() => refetch()}
        />
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={items}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p) => setPage(p),
          }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 70 },
            { title: '文件', dataIndex: 'filename', ellipsis: true },
            {
              title: 'Token',
              dataIndex: 'token',
              width: 140,
              ellipsis: true,
            },
            { title: '用户', dataIndex: 'username', width: 100 },
            {
              title: '状态',
              dataIndex: 'status',
              width: 90,
              render: (status: AdminShareItem['status']) => {
                const meta = statusMap[status];
                return <Tag color={meta.color}>{meta.label}</Tag>;
              },
            },
            {
              title: '下载次数',
              dataIndex: 'downloadCount',
              width: 90,
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              width: 170,
              render: (v: string | null) =>
                v ? formatDateTime(new Date(v)) : '-',
            },
            {
              title: '操作',
              key: 'actions',
              width: 100,
              render: (_, record) =>
                canWrite && record.status === 'active' ? (
                  <Popconfirm
                    title="确定撤销该分享？"
                    onConfirm={async () => {
                      try {
                        await revokeShare.mutateAsync(record.id);
                        feedback.success('已撤销');
                      } catch (err) {
                        feedback.error(err, '撤销失败');
                      }
                    }}
                  >
                    <Button size="small" icon={<MdBlock />}>
                      撤销
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
