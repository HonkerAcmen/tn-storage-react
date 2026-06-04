import { ReactNode } from 'react';
import clsx from 'clsx';

/** 管理后台统一卡片样式 */
export function AdminPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-gray-100 bg-white p-5 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const adminCardProps = {
  bordered: false as const,
  className: 'shadow-sm !border-gray-100',
  styles: {
    body: { padding: '20px 24px' },
  },
};
