import { useState } from 'react';
import { Button, Card, Input, Popconfirm, Space, Table } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import { MdDelete, MdRestore } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { AdminUserSelect } from '@/components/admin/AdminUserSelect';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  useAdminBatchPurgeTrash,
  useAdminPurgeTrash,
  useAdminRestoreTrash,
  useAdminTrash,
} from '@/network/hooks/admin';
import { AdminTrashItem } from '@/network/types/Response/admin';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { formatDateTime, formatFileSize } from '@/utils/format/formatters';

export default function AdminTrashPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [userIdFilter, setUserIdFilter] = useState<number | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const limit = 15;
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const purgeTrash = useAdminPurgeTrash();
  const restoreTrash = useAdminRestoreTrash();
  const batchPurge = useAdminBatchPurgeTrash();

  const { data, isLoading, isError, refetch } = useAdminTrash({
    page,
    limit,
    keyword: search || undefined,
    userId: userIdFilter,
  });

  const result = data?.data?.data;
  const items = result?.items ?? [];
  const total = result?.pagination.total ?? 0;

  const rowSelection: TableRowSelection<AdminTrashItem> | undefined = canWrite
    ? {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys as number[]),
      }
    : undefined;

  const handleBatchPurge = async () => {
    if (selectedRowKeys.length === 0) {
      return;
    }
    try {
      const res = await batchPurge.mutateAsync(selectedRowKeys);
      const succeeded = res.data.data.succeeded;
      feedback.success(`已永久删除 ${succeeded} 项`);
      setSelectedRowKeys([]);
    } catch (err) {
      feedback.error(err, '批量删除失败');
    }
  };

  return (
    <AdminLayout title="回收站">
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
          {canWrite && selectedRowKeys.length > 0 ? (
            <Popconfirm
              title={`永久删除选中的 ${selectedRowKeys.length} 项？此操作不可恢复`}
              onConfirm={handleBatchPurge}
            >
              <Button danger loading={batchPurge.isPending}>
                批量永久删除
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
        <AdminQueryAlert
          isError={isError}
          message="无法加载回收站列表"
          onRetry={() => refetch()}
        />
        <Table<AdminTrashItem>
          rowKey="id"
          loading={isLoading}
          dataSource={items}
          rowSelection={rowSelection}
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
              width: 200,
              render: (_, record) =>
                canWrite ? (
                  <Space>
                    <Popconfirm
                      title="恢复至用户文件区？"
                      onConfirm={async () => {
                        try {
                          await restoreTrash.mutateAsync(record.id);
                          feedback.success('已恢复');
                        } catch (err) {
                          feedback.error(err, '恢复失败');
                        }
                      }}
                    >
                      <Button size="small" icon={<MdRestore />}>
                        恢复
                      </Button>
                    </Popconfirm>
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
                  </Space>
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
