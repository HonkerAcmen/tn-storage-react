import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SITE_CONTENT,
  mergeSiteContent,
} from '@/config/siteContentDefaults';

describe('mergeSiteContent', () => {
  it('无远程数据时应返回默认配置', () => {
    expect(mergeSiteContent(null)).toEqual(DEFAULT_SITE_CONTENT);
  });

  it('应合并备案与企业信息并保留未覆盖字段', () => {
    const merged = mergeSiteContent({
      icp: { number: '京ICP备000000号', link: 'https://beian.miit.gov.cn/' },
      enterprise: { name: '伏羲文化科技有限公司' },
    });
    expect(merged.icp.number).toBe('京ICP备000000号');
    expect(merged.enterprise.name).toBe('伏羲文化科技有限公司');
    expect(merged.product_name).toBe(DEFAULT_SITE_CONTENT.product_name);
  });
});
