import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import {
  MdAdd,
  MdEdit,
  MdLockReset,
  MdDelete,
  MdSecurity,
  MdBlock,
  MdCheckCircle,
  MdHistory,
  MdStorage,
} from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import {
  useAdminCreateUser,
  useAdminDeleteUser,
  useAdminResetPassword,
  useAdminUpdateUser,
  useAdminUpdateUserPermissions,
  useAdminUpdateUserStatus,
  useAdminUpdateUserQuota,
  useAdminUser,
  useAdminUserLoginLogs,
  useAdminUsers,
} from '@/network/hooks/admin';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import { AdminUserRoleResponse } from '@/network/types/Response/user';
import { formatDateTime, formatFileSize } from '@/utils/format/formatters';

const roleLabels: Record<AdminUserRoleResponse['role'], string> = {
  admin: '管理员',
  user: '普通用户',
  viewer: '只读用户',
};

const roleColors: Record<AdminUserRoleResponse['role'], string> = {
  admin: 'red',
  user: 'blue',
  viewer: 'default',
};

const permissionLabels: Record<
  | 'allow_file_upload'
  | 'allow_file_download'
  | 'allow_file_delete'
  | 'allow_favorite'
  | 'allow_share',
  string
> = {
  allow_file_upload: '文件上传',
  allow_file_download: '文件下载',
  allow_file_delete: '文件删除',
  allow_favorite: '收藏',
  allow_share: '分享',
};

type UserFormValues = {
  username: string;
  email: string;
  phone: string;
  password?: string;
  desc?: string;
  role: AdminUserRoleResponse['role'];
};

type PermissionFormValues = {
  allow_file_upload: boolean;
  allow_file_download: boolean;
  allow_file_delete: boolean;
  allow_favorite: boolean;
  allow_share: boolean;
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<
    AdminUserRoleResponse['role'] | undefined
  >();
  const [statusFilter, setStatusFilter] = useState<
    AdminUserRoleResponse['account_status'] | undefined
  >();
  const limit = 10;

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit,
    keyword: keyword || undefined,
    role: roleFilter,
    status: statusFilter,
  });
  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const resetPassword = useAdminResetPassword();
  const updatePermissions = useAdminUpdateUserPermissions();
  const updateStatus = useAdminUpdateUserStatus();
  const updateQuota = useAdminUpdateUserQuota();
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();

  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [permUser, setPermUser] = useState<AdminUserRoleResponse | null>(null);
  const [loginLogUser, setLoginLogUser] = useState<AdminUserRoleResponse | null>(
    null,
  );
  const [loginLogPage, setLoginLogPage] = useState(1);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [quotaUserId, setQuotaUserId] = useState<number | null>(null);
  const loginLogLimit = 10;
  const [form] = Form.useForm<UserFormValues>();
  const [resetForm] = Form.useForm<{ password: string }>();
  const [permForm] = Form.useForm<PermissionFormValues>();
  const [quotaForm] = Form.useForm<{ quotaGb: number }>();

  const { data: quotaDetailRes, isLoading: quotaDetailLoading } =
    useAdminUser(quotaUserId, quotaOpen);

  const result = data?.data?.data;
  const users = result?.items ?? [];
  const total = result?.pagination.total ?? 0;

  const { data: loginLogsRes, isLoading: loginLogsLoading } =
    useAdminUserLoginLogs(loginLogUser?.id ?? null, {
      page: loginLogPage,
      limit: loginLogLimit,
    });
  const loginLogs = loginLogsRes?.data?.data?.items ?? [];
  const loginLogsTotal = loginLogsRes?.data?.data?.pagination.total ?? 0;
  const quotaDetail = quotaDetailRes?.data?.data;

  useEffect(() => {
    if (quotaOpen && quotaDetail?.storage) {
      quotaForm.setFieldsValue({
        quotaGb: Math.round(quotaDetail.storage.quotaBytes / 1024 / 1024 / 1024),
      });
    }
  }, [quotaOpen, quotaDetail, quotaForm]);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user' });
    setFormOpen(true);
  };

  const openEdit = (record: AdminUserRoleResponse) => {
    setEditingId(record.id);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      desc: record.desc,
      role: record.role,
    });
    setFormOpen(true);
  };

  const openPermissions = (record: AdminUserRoleResponse) => {
    setPermUser(record);
    permForm.setFieldsValue({
      allow_file_upload: record.permissions.allow_file_upload,
      allow_file_download: record.permissions.allow_file_download,
      allow_file_delete: record.permissions.allow_file_delete,
      allow_favorite: record.permissions.allow_favorite,
      allow_share: record.permissions.allow_share,
    });
    setPermOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingId) {
        await updateUser.mutateAsync({
          id: editingId,
          username: values.username,
          email: values.email,
          phone: values.phone,
          desc: values.desc,
          role: values.role,
        });
        feedback.success('用户已更新');
      } else {
        await createUser.mutateAsync({
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password!,
          role: values.role,
        });
        feedback.success('用户已创建');
      }
      setFormOpen(false);
      await refetch();
    } catch (err) {
      feedback.error(err, '操作失败');
    }
  };

  const handleResetPassword = async () => {
    const values = await resetForm.validateFields();
    if (!resetUserId) return;
    try {
      await resetPassword.mutateAsync({
        id: resetUserId,
        password: values.password,
      });
      feedback.success('密码已重置');
      setResetOpen(false);
      resetForm.resetFields();
    } catch (err) {
      feedback.error(err, '重置失败');
    }
  };

  const handleSavePermissions = async () => {
    if (!permUser) return;
    const values = await permForm.validateFields();
    try {
      await updatePermissions.mutateAsync({ id: permUser.id, ...values });
      feedback.success('权限已更新');
      setPermOpen(false);
      setPermUser(null);
    } catch (err) {
      feedback.error(err, '权限更新失败');
    }
  };

  const handleToggleStatus = async (record: AdminUserRoleResponse) => {
    const nextStatus =
      record.account_status === 'active' ? 'disabled' : 'active';
    try {
      await updateStatus.mutateAsync({ id: record.id, status: nextStatus });
      feedback.success(nextStatus === 'disabled' ? '账号已禁用' : '账号已启用');
    } catch (err) {
      feedback.error(err, '状态更新失败');
    }
  };

  const handleSaveQuota = async () => {
    if (!quotaUserId) return;
    const values = await quotaForm.validateFields();
    try {
      await updateQuota.mutateAsync({
        id: quotaUserId,
        quotaBytes: values.quotaGb * 1024 * 1024 * 1024,
      });
      feedback.success('存储配额已更新');
      setQuotaOpen(false);
      setQuotaUserId(null);
    } catch (err) {
      feedback.error(err, '配额更新失败');
    }
  };

  const handleSearch = () => {
    setKeyword(searchInput.trim());
    setPage(1);
  };

  return (
    <AdminLayout title="云盘用户">
      <Card
        {...adminCardProps}
        extra={
          canWrite ? (
            <Button type="primary" icon={<MdAdd />} onClick={openCreate}>
              新建用户
            </Button>
          ) : (
            <span className="text-sm text-gray-400">只读角色无写权限</span>
          )
        }
      >
        <Space wrap className="mb-4">
          <Input.Search
            placeholder="搜索用户名 / 邮箱 / 手机"
            allowClear
            className="w-64"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={handleSearch}
            onClear={() => {
              setSearchInput('');
              setKeyword('');
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="角色"
            className="w-32"
            value={roleFilter}
            onChange={(v) => {
              setRoleFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'admin', label: '管理员' },
              { value: 'user', label: '普通用户' },
              { value: 'viewer', label: '只读用户' },
            ]}
          />
          <Select
            allowClear
            placeholder="状态"
            className="w-32"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'active', label: '正常' },
              { value: 'disabled', label: '已禁用' },
            ]}
          />
        </Space>

        <AdminQueryAlert
          isError={isError}
          message="无法加载用户列表"
          onRetry={() => refetch()}
        />

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={users}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p) => setPage(p),
          }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 70 },
            { title: '用户名', dataIndex: 'username', width: 120 },
            { title: '邮箱', dataIndex: 'email', ellipsis: true },
            { title: '手机', dataIndex: 'phone', width: 130 },
            {
              title: '角色',
              dataIndex: 'role',
              width: 110,
              render: (role: AdminUserRoleResponse['role']) => (
                <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
              ),
            },
            {
              title: '状态',
              dataIndex: 'account_status',
              width: 90,
              render: (status: AdminUserRoleResponse['account_status']) => (
                <Tag color={status === 'active' ? 'success' : 'error'}>
                  {status === 'active' ? '正常' : '已禁用'}
                </Tag>
              ),
            },
            {
              title: '简介',
              dataIndex: 'desc',
              ellipsis: true,
              render: (v: string) => v || '-',
            },
            {
              title: '操作',
              key: 'actions',
              width: 420,
              fixed: 'right',
              render: (_, record) => (
                <Space wrap>
                  <Button
                    size="small"
                    icon={<MdHistory />}
                    onClick={() => {
                      setLoginLogUser(record);
                      setLoginLogPage(1);
                    }}
                  >
                    登录历史
                  </Button>
                  {canWrite ? (
                    <>
                      <Button
                        size="small"
                        icon={<MdEdit />}
                        onClick={() => openEdit(record)}
                      >
                        编辑
                      </Button>
                    <Button
                      size="small"
                      icon={<MdSecurity />}
                      onClick={() => openPermissions(record)}
                    >
                      权限
                    </Button>
                    <Button
                      size="small"
                      icon={<MdStorage />}
                      onClick={() => {
                        setQuotaUserId(record.id);
                        setQuotaOpen(true);
                      }}
                    >
                      配额
                    </Button>
                    <Button
                      size="small"
                      icon={<MdLockReset />}
                      onClick={() => {
                        setResetUserId(record.id);
                        resetForm.resetFields();
                        setResetOpen(true);
                      }}
                    >
                      重置密码
                    </Button>
                    <Popconfirm
                      title={
                        record.account_status === 'active'
                          ? '确定禁用该账号？禁用后无法登录云盘。'
                          : '确定启用该账号？'
                      }
                      onConfirm={() => handleToggleStatus(record)}
                    >
                      <Button
                        size="small"
                        danger={record.account_status === 'active'}
                        icon={
                          record.account_status === 'active' ? (
                            <MdBlock />
                          ) : (
                            <MdCheckCircle />
                          )
                        }
                      >
                        {record.account_status === 'active' ? '禁用' : '启用'}
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="确定删除该用户？此操作不可恢复。"
                      onConfirm={async () => {
                        try {
                          await deleteUser.mutateAsync(record.id);
                          feedback.success('已删除');
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
                  ) : null}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingId ? '编辑用户' : '新建用户'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createUser.isPending || updateUser.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, min: 3 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, len: 11 }]}
          >
            <Input />
          </Form.Item>
          {!editingId && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="desc" label="简介">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'admin', label: '管理员' },
                { value: 'user', label: '普通用户' },
                { value: 'viewer', label: '只读用户' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        onOk={handleResetPassword}
        confirmLoading={resetPassword.isPending}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical" className="mt-4">
          <Form.Item
            name="password"
            label="新密码"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          quotaDetail
            ? `存储配额 — ${quotaDetail.username}`
            : '存储配额'
        }
        open={quotaOpen}
        onCancel={() => {
          setQuotaOpen(false);
          setQuotaUserId(null);
        }}
        onOk={handleSaveQuota}
        confirmLoading={updateQuota.isPending}
        destroyOnClose
      >
        {quotaDetailLoading ? (
          <p className="py-4 text-center text-gray-400">加载中…</p>
        ) : (
          <Form form={quotaForm} layout="vertical" className="mt-4">
            {quotaDetail?.storage && (
              <p className="mb-3 text-sm text-gray-500">
                已用 {formatFileSize(quotaDetail.storage.usedBytes)} /{' '}
                {formatFileSize(quotaDetail.storage.quotaBytes)}（
                {quotaDetail.storage.totalFiles} 个文件）
              </p>
            )}
            <Form.Item
              name="quotaGb"
              label="配额上限（GB）"
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber min={1} max={10240} className="w-full" />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Drawer
        title={permUser ? `权限设置 — ${permUser.username}` : '权限设置'}
        open={permOpen}
        onClose={() => {
          setPermOpen(false);
          setPermUser(null);
        }}
        width={400}
        extra={
          <Button
            type="primary"
            loading={updatePermissions.isPending}
            onClick={handleSavePermissions}
          >
            保存
          </Button>
        }
      >
        {permUser && (
          <div className="mb-4 text-sm text-gray-500">
            当前角色：{roleLabels[permUser.role]}
            {permUser.permissions.permissions_customized && (
              <Tag className="ml-2" color="orange">
                已自定义
              </Tag>
            )}
          </div>
        )}
        <Form form={permForm} layout="vertical">
          {(
            Object.keys(permissionLabels) as Array<
              keyof typeof permissionLabels
            >
          ).map((key) => (
            <Form.Item
              key={key}
              name={key}
              label={permissionLabels[key]}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          ))}
        </Form>
      </Drawer>

      <Drawer
        title={
          loginLogUser
            ? `登录历史 · ${loginLogUser.username}`
            : '登录历史'
        }
        open={!!loginLogUser}
        onClose={() => setLoginLogUser(null)}
        width={560}
      >
        <Table
          rowKey="id"
          loading={loginLogsLoading}
          dataSource={loginLogs}
          pagination={{
            current: loginLogPage,
            pageSize: loginLogLimit,
            total: loginLogsTotal,
            showSizeChanger: false,
            onChange: (p) => setLoginLogPage(p),
          }}
          columns={[
            {
              title: '时间',
              dataIndex: 'login_at',
              render: (v: string) => formatDateTime(new Date(v)),
            },
            {
              title: 'IP',
              dataIndex: 'ip',
              render: (v: string | null) => v || '-',
            },
            {
              title: 'User-Agent',
              dataIndex: 'user_agent',
              ellipsis: true,
              render: (v: string | null) => v || '-',
            },
          ]}
        />
      </Drawer>
    </AdminLayout>
  );
}
