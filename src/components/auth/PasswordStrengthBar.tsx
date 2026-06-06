import {
  getPasswordStrength,
  PasswordStrengthLevel,
} from '@/utils/passwordStrength';

const LEVEL_ORDER: PasswordStrengthLevel[] = ['low', 'medium', 'high'];

const SEGMENT_COLORS: Record<PasswordStrengthLevel, string> = {
  low: 'bg-red-500',
  medium: 'bg-yellow-400',
  high: 'bg-green-500',
};

interface PasswordStrengthBarProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthBar({
  password,
  className = '',
}: PasswordStrengthBarProps) {
  const { level, label } = getPasswordStrength(password);
  const activeIndex = LEVEL_ORDER.indexOf(level);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-1">
        {LEVEL_ORDER.map((segmentLevel, index) => {
          const active = index <= activeIndex;
          return (
            <div
              key={segmentLevel}
              className={`h-2 flex-1 rounded-full transition-colors ${
                active ? SEGMENT_COLORS[level] : 'bg-gray-200'
              }`}
              aria-hidden
            />
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        密码复杂度：
        <span
          className={
            level === 'low'
              ? 'text-red-500'
              : level === 'medium'
                ? 'text-yellow-600'
                : 'text-green-600'
          }
        >
          {password ? label : '请输入密码'}
        </span>
      </p>
    </div>
  );
}

export function PasswordStrengthField({
  password,
  className = '',
}: PasswordStrengthBarProps) {
  return <PasswordStrengthBar password={password} className={className} />;
}
