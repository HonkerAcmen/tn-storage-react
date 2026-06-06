import Head from 'next/head';
import Link from 'next/link';
import { Spin, Typography } from 'antd';
import { useSiteContent } from '@/network/hooks/siteContent';
import { DEFAULT_SITE_CONTENT } from '@/config/siteContentDefaults';

const { Title, Paragraph } = Typography;

export default function UserAgreementPage() {
  const { data, isLoading } = useSiteContent();
  const content = data ?? DEFAULT_SITE_CONTENT;
  const body =
    content.user_agreement.content.trim() ||
    '管理员尚未配置用户协议正文，请联系系统管理员。';

  return (
    <>
      <Head>
        <title>{content.user_agreement.title} - {content.product_name}</title>
      </Head>
      <div className="min-h-screen bg-[#f7f7fb] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
          <Link href="/login?tab=register" className="text-sm text-[#5542f6]">
            ← 返回注册
          </Link>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spin />
            </div>
          ) : (
            <>
              <Title level={2} className="!mt-6">
                {content.user_agreement.title}
              </Title>
              <Paragraph className="whitespace-pre-wrap text-base leading-8 text-gray-700">
                {body}
              </Paragraph>
            </>
          )}
        </div>
      </div>
    </>
  );
}
