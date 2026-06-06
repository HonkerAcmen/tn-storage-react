import { useState } from 'react';
import { Card, Select, Table, Tag } from 'antd';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import {
  useAdminLoginLogs,
  useAdminStaffList,
} from '@/network/hooks/adminStaff';
import { formatDateTime } from '@/utils/format/formatters';

export default function AdminLoginLogsPage() {
  const [page, setPage] = useState(1);
  const [adminId, setAdminId] = useState<number | undefined>();
  const limit = 15;

  const { data: staffRes, isError: staffError, refetch: refetchStaff } =
    useAdminStaffList();
  const { data, isLoading, isError, refetch } = useAdminLoginLogs({
    page,
    limit,
    adminId,
  });

  const staffList = staffRes?.data?.data ?? [];
  const result = data?.data?.data;
  const items = result?.items ?? [];
  const total = result?.pagination.total ?? 0;

  return (
    <AdminLayout title="登录日志">
      <Card
        {...adminCardProps}
        extra={
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
        }
      >
        <AdminQueryAlert
          isError={staffError}
          message="无法加载管理员列表"
          onRetry={() => refetchStaff()}
        />
        <AdminQueryAlert
          isError={isError}
          message="无法加载登录日志"
          onRetry={() => refetch()}
        />
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={items}
          scroll={{ x: 900 }}
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
            { title: '邮箱', dataIndex: 'admin_email', ellipsis: true },
            {
              title: '结果',
              dataIndex: 'success',
              width: 90,
              render: (success: boolean) => (
                <Tag color={success ? 'success' : 'error'}>
                  {success ? '成功' : '失败'}
                </Tag>
              ),
            },
            {
              title: '说明',
              dataIndex: 'message',
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
              dataIndex: 'login_at',
              width: 170,
              render: (v: string) => formatDateTime(new Date(v)),
            },
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
