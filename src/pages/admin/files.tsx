import { useState } from 'react';
import { Button, Card, Input, Popconfirm, Select, Space, Table } from 'antd';
import { MdDelete, MdDownload, MdVisibility } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { AdminUserSelect } from '@/components/admin/AdminUserSelect';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  downloadAdminFile,
  previewAdminFile,
  useAdminDeleteFile,
  useAdminFiles,
} from '@/network/hooks/admin';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { formatDateTime, formatFileSize } from '@/utils/format/formatters';

export default function AdminFilesPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'file' | 'folder' | undefined>();
  const [userIdFilter, setUserIdFilter] = useState<number | undefined>();
  const limit = 15;
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const deleteFile = useAdminDeleteFile();

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
          scroll={{ x: 1200 }}
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
            {
              title: '操作',
              key: 'actions',
              width: 280,
              fixed: 'right',
              render: (_, record) => (
                <Space wrap>
                  {record.type === 'file' && (
                    <>
                      <Button
                        size="small"
                        icon={<MdDownload />}
                        onClick={async () => {
                          try {
                            await downloadAdminFile(record.id, record.filename);
                          } catch (err) {
                            feedback.error(err, '下载失败');
                          }
                        }}
                      >
                        下载
                      </Button>
                      <Button
                        size="small"
                        icon={<MdVisibility />}
                        onClick={async () => {
                          try {
                            await previewAdminFile(record.id);
                          } catch (err) {
                            feedback.error(err, '预览失败');
                          }
                        }}
                      >
                        预览
                      </Button>
                    </>
                  )}
                  {canWrite && (
                    <>
                      <Popconfirm
                        title="移入用户回收站？"
                        onConfirm={async () => {
                          try {
                            await deleteFile.mutateAsync({
                              id: record.id,
                              mode: 'trash',
                            });
                            feedback.success('已移入回收站');
                          } catch (err) {
                            feedback.error(err, '操作失败');
                          }
                        }}
                      >
                        <Button size="small" danger>
                          回收站
                        </Button>
                      </Popconfirm>
                      <Popconfirm
                        title="永久删除文件及子项？此操作不可恢复"
                        onConfirm={async () => {
                          try {
                            await deleteFile.mutateAsync({
                              id: record.id,
                              mode: 'purge',
                            });
                            feedback.success('已永久删除');
                          } catch (err) {
                            feedback.error(err, '删除失败');
                          }
                        }}
                      >
                        <Button size="small" danger icon={<MdDelete />}>
                          删除
                        </Button>
                      </Popconfirm>
                    </>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </AdminLayout>
  );
}
