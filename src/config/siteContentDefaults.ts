import { PRODUCT_NAME } from '@/config/brand';

export type FooterLink = { label: string; href: string };

export type SiteContentView = {
  product_name: string;
  brand_main_text: string;
  brand_accent_text: string;
  icp: { number: string; link: string };
  enterprise: {
    name: string;
    address: string;
    phone: string;
    email: string;
    description: string;
  };
  footer: {
    title: string;
    description: string;
    copyright: string;
    tagline: string;
    links: FooterLink[];
  };
  user_agreement: {
    title: string;
    content: string;
  };
  updated_at?: string;
};

export const DEFAULT_SITE_CONTENT: SiteContentView = {
  product_name: PRODUCT_NAME,
  brand_main_text: '伏羲文化',
  brand_accent_text: '数据云盘',
  icp: { number: '', link: '' },
  enterprise: {
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
  },
  footer: {
    title: '访客入口',
    description:
      '这里是独立的访客页面。你可以先了解系统界面、存储能力和产品结构，真正需要上传、收藏、最近记录和个人空间时，再进入登录或注册流程。',
    copyright: `© 2026 ${PRODUCT_NAME}. All rights reserved.`,
    tagline:
      'Cloud workspace for storage, organization and account-based access.',
    links: [
      { label: '登录账户', href: '/login?tab=login' },
      { label: '注册账户', href: '/login?tab=register' },
      { label: '访客首页', href: '/visitor' },
    ],
  },
  user_agreement: {
    title: '用户协议',
    content: '',
  },
};

export type SiteContentPatch = {
  product_name?: string;
  brand_main_text?: string;
  brand_accent_text?: string;
  icp?: Partial<SiteContentView['icp']>;
  enterprise?: Partial<SiteContentView['enterprise']>;
  footer?: Partial<SiteContentView['footer']>;
  user_agreement?: Partial<SiteContentView['user_agreement']>;
  updated_at?: string;
};

export function mergeSiteContent(
  remote?: SiteContentPatch | null,
): SiteContentView {
  if (!remote) {
    return DEFAULT_SITE_CONTENT;
  }
  return {
    product_name: remote.product_name || DEFAULT_SITE_CONTENT.product_name,
    brand_main_text:
      remote.brand_main_text || DEFAULT_SITE_CONTENT.brand_main_text,
    brand_accent_text:
      remote.brand_accent_text || DEFAULT_SITE_CONTENT.brand_accent_text,
    icp: {
      number: remote.icp?.number ?? DEFAULT_SITE_CONTENT.icp.number,
      link: remote.icp?.link ?? DEFAULT_SITE_CONTENT.icp.link,
    },
    enterprise: {
      name: remote.enterprise?.name ?? DEFAULT_SITE_CONTENT.enterprise.name,
      address:
        remote.enterprise?.address ?? DEFAULT_SITE_CONTENT.enterprise.address,
      phone: remote.enterprise?.phone ?? DEFAULT_SITE_CONTENT.enterprise.phone,
      email: remote.enterprise?.email ?? DEFAULT_SITE_CONTENT.enterprise.email,
      description:
        remote.enterprise?.description ??
        DEFAULT_SITE_CONTENT.enterprise.description,
    },
    footer: {
      title: remote.footer?.title ?? DEFAULT_SITE_CONTENT.footer.title,
      description:
        remote.footer?.description ?? DEFAULT_SITE_CONTENT.footer.description,
      copyright:
        remote.footer?.copyright ?? DEFAULT_SITE_CONTENT.footer.copyright,
      tagline: remote.footer?.tagline ?? DEFAULT_SITE_CONTENT.footer.tagline,
      links:
        remote.footer?.links && remote.footer.links.length > 0
          ? remote.footer.links
          : DEFAULT_SITE_CONTENT.footer.links,
    },
    user_agreement: {
      title:
        remote.user_agreement?.title ??
        DEFAULT_SITE_CONTENT.user_agreement.title,
      content:
        remote.user_agreement?.content ??
        DEFAULT_SITE_CONTENT.user_agreement.content,
    },
    updated_at: remote.updated_at,
  };
}
