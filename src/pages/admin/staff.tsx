import { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import { MdAdd, MdEdit, MdLockReset, MdDelete } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminProfile } from '@/network/hooks/adminAuth';
import {
  useAdminCreateStaff,
  useAdminDeleteStaff,
  useAdminResetStaffPassword,
  useAdminStaffList,
  useAdminUpdateStaff,
} from '@/network/hooks/adminStaff';
import { AdminAuthProfile } from '@/network/types/Response/admin';
import { formatDateTime } from '@/utils/format/formatters';

const roleLabels: Record<AdminAuthProfile['role'], string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  operator: '运维只读',
};

const roleColors: Record<AdminAuthProfile['role'], string> = {
  super_admin: 'red',
  admin: 'purple',
  operator: 'blue',
};

type StaffFormValues = {
  username: string;
  email: string;
  password?: string;
  display_name?: string;
  role: AdminAuthProfile['role'];
  status: boolean;
};

export default function AdminStaffPage() {
  const { data, isLoading, refetch } = useAdminStaffList();
  const { data: profileRes } = useAdminProfile();
  const myRole = profileRes?.data?.data?.role;
  const canManage = myRole === 'super_admin' || myRole === 'admin';

  const createStaff = useAdminCreateStaff();
  const updateStaff = useAdminUpdateStaff();
  const deleteStaff = useAdminDeleteStaff();
  const resetPassword = useAdminResetStaffPassword();
  const feedback = useAdminFeedback();

  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [form] = Form.useForm<StaffFormValues>();
  const [resetForm] = Form.useForm<{ password: string }>();

  const staffList = data?.data?.data ?? [];

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ role: 'admin', status: true });
    setFormOpen(true);
  };

  const openEdit = (record: AdminAuthProfile) => {
    setEditingId(record.id);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      display_name: record.display_name ?? '',
      role: record.role,
      status: record.status === 'active',
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingId) {
        await updateStaff.mutateAsync({
          id: editingId,
          username: values.username,
          email: values.email,
          display_name: values.display_name,
          role: values.role,
          status: values.status ? 'active' : 'disabled',
        });
        feedback.success('管理员已更新');
      } else {
        await createStaff.mutateAsync({
          username: values.username,
          email: values.email,
          password: values.password!,
          display_name: values.display_name,
          role: values.role,
        });
        feedback.success('管理员已创建');
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

  return (
    <AdminLayout title="管理员账号">
      <Card
        {...adminCardProps}
        extra={
          canManage ? (
            <Button type="primary" icon={<MdAdd />} onClick={openCreate}>
              新建管理员
            </Button>
          ) : null
        }
      >
        <p className="mb-4 text-sm text-gray-500">
          管理后台独立账号，与云盘用户完全分离。operator
          角色仅可查看，不可增删改。
        </p>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={staffList}
          scroll={{ x: 1000 }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 70 },
            { title: '用户名', dataIndex: 'username' },
            { title: '显示名', dataIndex: 'display_name', render: (v) => v || '-' },
            { title: '邮箱', dataIndex: 'email' },
            {
              title: '角色',
              dataIndex: 'role',
              width: 120,
              render: (role: AdminAuthProfile['role']) => (
                <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 90,
              render: (status: AdminAuthProfile['status']) => (
                <Tag color={status === 'active' ? 'success' : 'default'}>
                  {status === 'active' ? '正常' : '禁用'}
                </Tag>
              ),
            },
            {
              title: '最近登录',
              dataIndex: 'last_login_at',
              width: 170,
              render: (v: string | null) =>
                v ? formatDateTime(new Date(v)) : '-',
            },
            {
              title: '操作',
              key: 'actions',
              width: 220,
              fixed: 'right',
              render: (_, record) =>
                canManage ? (
                  <Space>
                    <Button
                      size="small"
                      icon={<MdEdit />}
                      onClick={() => openEdit(record)}
                    >
                      编辑
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
                      title="确定删除该管理员？"
                      onConfirm={async () => {
                        try {
                          await deleteStaff.mutateAsync(record.id);
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
                  </Space>
                ) : (
                  '-'
                ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingId ? '编辑管理员' : '新建管理员'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createStaff.isPending || updateStaff.isPending}
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
          {!editingId && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="display_name" label="显示名称">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                ...(myRole === 'super_admin'
                  ? [{ value: 'super_admin', label: '超级管理员' }]
                  : []),
                { value: 'admin', label: '管理员' },
                { value: 'operator', label: '运维只读' },
              ]}
            />
          </Form.Item>
          {editingId && (
            <Form.Item
              name="status"
              label="启用"
              valuePropName="checked"
            >
              <Switch checkedChildren="正常" unCheckedChildren="禁用" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="重置管理员密码"
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
    </AdminLayout>
  );
}
