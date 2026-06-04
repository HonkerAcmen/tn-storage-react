import { useState } from 'react';
import { Card, Input, Select, Table } from 'antd';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminAuditLogs } from '@/network/hooks/adminOps';
import { useAdminStaffList } from '@/network/hooks/adminStaff';
import { formatDateTime } from '@/utils/format/formatters';

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [adminId, setAdminId] = useState<number | undefined>();
  const [action, setAction] = useState<string | undefined>();
  const limit = 15;

  const { data: staffRes, isError: staffError, refetch: refetchStaff } =
    useAdminStaffList();
  const { data, isLoading, isError, refetch } = useAdminAuditLogs({
    page,
    limit,
    adminId,
    action,
  });

  const staffList = staffRes?.data?.data ?? [];
  const result = data?.data?.data;
  const items = result?.items ?? [];
  const total = result?.pagination.total ?? 0;

  return (
    <AdminLayout title="操作审计">
      <Card
        {...adminCardProps}
        extra={
          <div className="flex flex-wrap gap-2">
            <Select
              allowClear
              placeholder="筛选管理员"
              className="w-48"
              value={adminId}
              onChange={(v) => {
                setAdminId(v);
                setPage(1);
              }}
              options={staffList.map((item) => ({
                value: item.id,
                label: `${item.username} (${item.email})`,
              }))}
            />
            <Input.Search
              allowClear
              placeholder="操作类型，如 cache.clear"
              className="w-52"
              value={action}
              onChange={(e) => setAction(e.target.value || undefined)}
              onSearch={() => setPage(1)}
            />
          </div>
        }
      >
        <AdminQueryAlert
          isError={staffError}
          message="无法加载管理员列表"
          onRetry={() => refetchStaff()}
        />
        <AdminQueryAlert
          isError={isError}
          message="无法加载审计日志"
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
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 80 },
            { title: '管理员', dataIndex: 'admin_username', width: 120 },
            { title: '操作', dataIndex: 'action', width: 140 },
            {
              title: '资源',
              width: 160,
              render: (_, row) =>
                row.resource_type
                  ? `${row.resource_type}:${row.resource_id ?? '-'}`
                  : '-',
            },
            {
              title: '详情',
              dataIndex: 'detail',
              ellipsis: true,
              render: (v: string | null) => v || '-',
            },
            {
              title: 'IP',
              dataIndex: 'ip',
              width: 130,
              render: (v: string | null) => v || '-',
            },
            {
              title: '时间',
              dataIndex: 'created_at',
              width: 170,
              render: (v: string) => formatDateTime(new Date(v)),
            },
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
