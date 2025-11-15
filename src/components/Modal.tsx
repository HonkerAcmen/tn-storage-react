import { ReactNode } from 'react';
import clsx from 'clsx';

interface ModalProps {
  open: boolean;

  position?: {
    top?: string;
    left?: string;
    right?: string;
  };

  size?: {
    width?: string;
    height?: string;
  };

  onClose: () => void;
  children: ReactNode;

  className?: string; // 可覆盖整体样式
}

export default function Modal({
  open,
  position = {},
  size = {},
  onClose,
  children,
  className = '',
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className={clsx(
        'animate-fadein absolute z-50 rounded-lg border border-gray-200 bg-white shadow-lg',
        // 位置
        position.top,
        position.left,
        position.right,
        // 尺寸
        size.width,
        size.height,
        // 额外样式
        className
      )}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="p-3">
        {children}
      </div>

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadein {
          animation: fadein 0.3s ease;
        }
      `}</style>
    </div>
  );
}
