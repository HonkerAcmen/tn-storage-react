import { useEffect } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Space,
  Tabs,
  Typography,
} from 'antd';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminQueryAlert } from '@/components/admin/AdminQueryAlert';
import { adminCardProps } from '@/components/admin/AdminPanel';
import { useAdminFeedback } from '@/hooks/useAdminFeedback';
import { useAdminCanWrite } from '@/network/hooks/adminAuth';
import {
  useAdminSiteContent,
  useSaveAdminSiteContent,
} from '@/network/hooks/adminSiteContent';

const { TextArea } = Input;
const { Text } = Typography;

function toFormValues(data?: ReturnType<typeof useAdminSiteContent>['data']) {
  if (!data) {
    return undefined;
  }
  return {
    product_name: data.product_name,
    brand_main_text: data.brand_main_text,
    brand_accent_text: data.brand_accent_text,
    icp_number: data.icp.number,
    icp_link: data.icp.link,
    enterprise_name: data.enterprise.name,
    enterprise_address: data.enterprise.address,
    enterprise_phone: data.enterprise.phone,
    enterprise_email: data.enterprise.email,
    enterprise_description: data.enterprise.description,
    footer_title: data.footer.title,
    footer_description: data.footer.description,
    footer_copyright: data.footer.copyright,
    footer_tagline: data.footer.tagline,
    footer_links_text: data.footer.links
      .map((item) => `${item.label}|${item.href}`)
      .join('\n'),
    user_agreement_title: data.user_agreement.title,
    user_agreement_content: data.user_agreement.content,
  };
}

function parseFooterLinks(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split('|').map((part) => part.trim());
      return { label: label ?? '', href: href ?? '' };
    })
    .filter((item) => item.label && item.href);
}

export default function AdminSiteContentPage() {
  const feedback = useAdminFeedback();
  const canWrite = useAdminCanWrite();
  const { data, isLoading, isError, error, refetch } = useAdminSiteContent();
  const saveContent = useSaveAdminSiteContent();
  const [form] = Form.useForm();

  useEffect(() => {
    const values = toFormValues(data);
    if (values) {
      form.setFieldsValue(values);
    }
  }, [data, form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      await saveContent.mutateAsync({
        product_name: values.product_name,
        brand_main_text: values.brand_main_text,
        brand_accent_text: values.brand_accent_text,
        icp_number: values.icp_number,
        icp_link: values.icp_link,
        enterprise_name: values.enterprise_name,
        enterprise_address: values.enterprise_address,
        enterprise_phone: values.enterprise_phone,
        enterprise_email: values.enterprise_email,
        enterprise_description: values.enterprise_description,
        footer_title: values.footer_title,
        footer_description: values.footer_description,
        footer_copyright: values.footer_copyright,
        footer_tagline: values.footer_tagline,
        footer_links: parseFooterLinks(values.footer_links_text ?? ''),
        user_agreement_title: values.user_agreement_title,
        user_agreement_content: values.user_agreement_content,
      });
      feedback.success('站点内容已保存');
    } catch (err) {
      feedback.error(err, '保存失败');
    }
  };

  return (
    <AdminLayout title="站点内容">
      <AdminQueryAlert
        isError={isError}
        message={error instanceof Error ? error.message : '加载站点内容失败'}
        onRetry={() => refetch()}
      />
      <Card {...adminCardProps} loading={isLoading}>
        <p className="mb-4 text-sm text-gray-500">
          配置备案信息、企业信息、访客页 Footer 与注册页用户协议。保存后访客页、登录页与协议页将自动读取最新内容。
        </p>
        <Form form={form} layout="vertical" disabled={!canWrite}>
          <Tabs
            items={[
              {
                key: 'icp',
                label: '备案信息',
                children: (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Form.Item name="icp_number" label="ICP 备案号">
                      <Input placeholder="京ICP备00000000号-1" />
                    </Form.Item>
                    <Form.Item name="icp_link" label="备案查询链接">
                      <Input placeholder="https://beian.miit.gov.cn/" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'enterprise',
                label: '企业信息',
                children: (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Form.Item name="enterprise_name" label="企业名称">
                      <Input placeholder="伏羲文化科技有限公司" />
                    </Form.Item>
                    <Form.Item name="enterprise_phone" label="联系电话">
                      <Input placeholder="010-00000000" />
                    </Form.Item>
                    <Form.Item
                      name="enterprise_email"
                      label="联系邮箱"
                      className="md:col-span-2"
                    >
                      <Input placeholder="contact@example.com" />
                    </Form.Item>
                    <Form.Item
                      name="enterprise_address"
                      label="企业地址"
                      className="md:col-span-2"
                    >
                      <Input placeholder="北京市朝阳区..." />
                    </Form.Item>
                    <Form.Item
                      name="enterprise_description"
                      label="企业简介"
                      className="md:col-span-2"
                    >
                      <TextArea rows={4} placeholder="用于 Footer 或关于我们展示" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'footer',
                label: 'Footer 信息',
                children: (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Form.Item name="product_name" label="产品全称">
                        <Input />
                      </Form.Item>
                      <Form.Item name="footer_title" label="Footer 主标题">
                        <Input />
                      </Form.Item>
                      <Form.Item name="brand_main_text" label="品牌主文案">
                        <Input />
                      </Form.Item>
                      <Form.Item name="brand_accent_text" label="品牌副文案">
                        <Input />
                      </Form.Item>
                    </div>
                    <Form.Item name="footer_description" label="Footer 描述">
                      <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="footer_copyright" label="版权行">
                      <Input />
                    </Form.Item>
                    <Form.Item name="footer_tagline" label="英文副标语">
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="footer_links_text"
                      label="快捷链接"
                      extra="每行一条，格式：标签|链接，例如：登录账户|/login?tab=login"
                    >
                      <TextArea rows={5} />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'agreement',
                label: '用户协议',
                children: (
                  <div className="space-y-4">
                    <Form.Item name="user_agreement_title" label="协议标题">
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="user_agreement_content"
                      label="协议正文"
                      extra="支持纯文本或 Markdown，将在 /legal/agreement 页面展示"
                    >
                      <TextArea rows={16} placeholder="请输入用户协议正文..." />
                    </Form.Item>
                    <Text type="secondary">
                      预览地址：
                      <a href="/legal/agreement" target="_blank" rel="noreferrer">
                        /legal/agreement
                      </a>
                    </Text>
                  </div>
                ),
              },
            ]}
          />
          <Space className="mt-4">
            <Button
              type="primary"
              onClick={handleSave}
              loading={saveContent.isPending}
              disabled={!canWrite}
            >
              保存全部
            </Button>
          </Space>
        </Form>
      </Card>
    </AdminLayout>
  );
}
