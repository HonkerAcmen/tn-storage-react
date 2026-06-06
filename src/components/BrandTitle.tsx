import localFont from 'next/font/local';
import Link from 'next/link';
import { PRODUCT_NAME } from '@/config/brand';

/** 本地字体：站酷庆科黄油体（src/fonts） */
const brandFont = localFont({
  src: '../fonts/ZCOOLQingKeHuangYou-Regular.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
});

type BrandTitleProps = {
  /** 是否作为首页链接 */
  asLink?: boolean;
  className?: string;
};

/**
 * 工作台品牌标题 — 本地展示字体 + 青紫渐变光效
 */
export default function BrandTitle({ asLink = false, className = '' }: BrandTitleProps) {
  const content = (
    <span
      className={`brand-logo ${brandFont.className} ${className}`.trim()}
      aria-label={PRODUCT_NAME}
    >
      <span className="brand-logo__bar" aria-hidden />
      <span className="brand-logo__text">
        <span className="brand-logo__main">伏羲文化</span>
        <span className="brand-logo__accent">数据云盘</span>
      </span>
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="brand-logo-link">
        {content}
      </Link>
    );
  }

  return content;
}
