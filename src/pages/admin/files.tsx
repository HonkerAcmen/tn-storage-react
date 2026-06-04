import { useState } from 'react';
import { Card, Input, Select, Space, Table } from 'antd';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { AdminUserSelect } from '@/components/admin/AdminUserSelect';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFiles } from '@/network/hooks/admin';
import { formatDateTime, formatFileSize } from '@/utils/format/formatters';

export default function AdminFilesPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'file' | 'folder' | undefined>();
  const [userIdFilter, setUserIdFilter] = useState<number | undefined>();
  const limit = 15;

  const { data, isLoading, isError, refetch } = useAdminFiles({
    page,
    limit,
    keyword: search || undefined,
    userId: userIdFilter,
    type: typeFilter,
  });

  const result = data?.data?.data;
  const items = result?.items ?? [];
  const total = result?.pagination.total ?? 0;

  return (
    <AdminLayout title="全局文件">
      <Card {...adminCardProps}>
        <Space wrap className="mb-4">
          <Input.Search
            placeholder="搜索文件名 / UUID"
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
            placeholder="类型"
            className="w-28"
            value={typeFilter}
            onChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'file', label: '文件' },
              { value: 'folder', label: '文件夹' },
            ]}
          />
        </Space>
        <AdminQueryAlert
          isError={isError}
          message="无法加载文件列表，请确认后端服务正常"
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
            { title: '文件名', dataIndex: 'filename', ellipsis: true },
            { title: 'UUID', dataIndex: 'UUID', width: 140, ellipsis: true },
            { title: '类型', dataIndex: 'type', width: 80 },
            {
              title: '大小',
              dataIndex: 'size',
              width: 100,
              render: (v: number, r) =>
                r.type === 'folder' ? '-' : formatFileSize(v),
            },
            { title: '用户', dataIndex: 'username', width: 100 },
            { title: '邮箱', dataIndex: 'email', ellipsis: true },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              width: 170,
              render: (v: string | null) =>
                v ? formatDateTime(new Date(v)) : '-',
            },
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
