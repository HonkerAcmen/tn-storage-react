import { useState } from 'react';
import { Form, Input, Button, Tabs, message, Checkbox } from 'antd';
import type { TabsProps } from 'antd';
import {
  AiOutlineUser,
  AiOutlineLock,
  AiOutlineMail,
  AiOutlinePhone,
} from 'react-icons/ai';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 登录表单提交
  const onLoginFinish = async (values: any) => {
    setLoading(true);
    try {
      // 这里可以调用登录 API
      console.log('登录信息:', values);
      
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      message.success('登录成功！');
      // 跳转到主页
      router.push('/');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  // 注册表单提交
  const onRegisterFinish = async (values: any) => {
    setLoading(true);
    try {
      // 这里可以调用注册 API
      console.log('注册信息:', values);
      
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      message.success('注册成功！请登录');
      // 切换到登录标签页
      setActiveTab('login');
    } catch (error) {
      message.error('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('login');

  const tabItems: TabsProps['items'] = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          name="login"
          onFinish={onLoginFinish}
          autoComplete="off"
          size="large"
          className="mt-6"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名或邮箱' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<AiOutlineUser className="text-gray-400" />}
              placeholder="用户名或邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<AiOutlineLock className="text-gray-400" />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a className="text-[#5542f6] hover:text-[#4532e6]" href="#">
                忘记密码？
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 bg-[#5542f6] hover:bg-[#4532e6]"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          name="register"
          onFinish={onRegisterFinish}
          autoComplete="off"
          size="large"
          className="mt-6"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input
              prefix={<AiOutlineUser className="text-gray-400" />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<AiOutlineMail className="text-gray-400" />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
            ]}
          >
            <Input
              prefix={<AiOutlinePhone className="text-gray-400" />}
              placeholder="手机号"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<AiOutlineLock className="text-gray-400" />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<AiOutlineLock className="text-gray-400" />}
              placeholder="确认密码"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('请同意用户协议')),
              },
            ]}
          >
            <Checkbox>
              我已阅读并同意
              <a className="text-[#5542f6] hover:text-[#4532e6]" href="#">
                {' '}
                用户协议
              </a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 bg-[#5542f6] hover:bg-[#4532e6]"
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#5542f6] via-[#7c6cf5] to-[#9d8ef7]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* Logo 和标题 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">TNStorage</h1>
          <p className="text-gray-500">欢迎使用云存储服务</p>
        </div>

        {/* 标签页 */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
          className="w-full"
        />
      </div>
    </div>
  );
}

