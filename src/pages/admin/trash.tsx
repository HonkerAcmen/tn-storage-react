import { useState } from 'react';
import { Button, Card, Input, Popconfirm, Table } from 'antd';
import { MdDelete } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminPurgeTrash, useAdminTrash } from '@/network/hooks/admin';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { formatDateTime, formatFileSize } from '@/utils/format/formatters';

export default function AdminTrashPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const limit = 15;
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const purgeTrash = useAdminPurgeTrash();

  const { data, isLoading } = useAdminTrash({
    page,
    limit,
    keyword: search || undefined,
  });

  const result = data?.data?.data;
  const items = result?.items ?? [];
  const total = result?.pagination.total ?? 0;

  return (
    <AdminLayout title="回收站">
      <Card {...adminCardProps}>
        <Input.Search
          placeholder="搜索文件名 / UUID"
          className="mb-4 w-64"
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
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={items}
          scroll={{ x: 1000 }}
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
            {
              title: '大小',
              dataIndex: 'size',
              width: 100,
              render: (v: number) => formatFileSize(v),
            },
            { title: '用户', dataIndex: 'username', width: 100 },
            {
              title: '删除时间',
              dataIndex: 'deletedAt',
              width: 170,
              render: (v: string | null) =>
                v ? formatDateTime(new Date(v)) : '-',
            },
            {
              title: '操作',
              key: 'actions',
              width: 120,
              render: (_, record) =>
                canWrite ? (
                  <Popconfirm
                    title="永久删除？此操作不可恢复。"
                    onConfirm={async () => {
                      try {
                        await purgeTrash.mutateAsync(record.id);
                        feedback.success('已永久删除');
                      } catch (err) {
                        feedback.error(err, '删除失败');
                      }
                    }}
                  >
                    <Button size="small" danger icon={<MdDelete />}>
                      永久删除
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
