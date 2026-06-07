import { Button, Input, Spin } from 'antd';
import { useCaptcha, useAdminCaptcha } from '@/network/hooks/verification';

interface CaptchaFieldProps {
  value?: { captchaId: string; captchaCode: string };
  onChange?: (value: { captchaId: string; captchaCode: string }) => void;
  admin?: boolean;
}

export default function CaptchaField({
  value,
  onChange,
  admin = false,
}: CaptchaFieldProps) {
  const query = admin ? useAdminCaptcha() : useCaptcha();

  const refresh = () => {
    void query.refetch();
    onChange?.({ captchaId: '', captchaCode: value?.captchaCode ?? '' });
  };

  const captchaId = query.data?.captchaId ?? value?.captchaId ?? '';

  return (
    <div className="flex items-center gap-3">
      <Input
        placeholder="图形验证码"
        value={value?.captchaCode ?? ''}
        maxLength={6}
        onChange={(e) =>
          onChange?.({
            captchaId,
            captchaCode: e.target.value,
          })
        }
        onFocus={() => {
          if (!captchaId && query.data?.captchaId) {
            onChange?.({
              captchaId: query.data.captchaId,
              captchaCode: value?.captchaCode ?? '',
            });
          }
        }}
      />
      <button
        type="button"
        className="flex h-10 w-[120px] shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50"
        onClick={refresh}
        title="点击刷新验证码"
      >
        {query.isLoading ? (
          <Spin size="small" />
        ) : query.data?.imageBase64 ? (
          <img
            src={`data:image/svg+xml;base64,${query.data.imageBase64}`}
            alt="captcha"
            className="h-full w-full object-cover"
            onLoad={() => {
              if (query.data?.captchaId) {
                onChange?.({
                  captchaId: query.data.captchaId,
                  captchaCode: value?.captchaCode ?? '',
                });
              }
            }}
          />
        ) : (
          <span className="text-xs text-gray-400">加载失败</span>
        )}
      </button>
      <Button type="link" size="small" onClick={refresh}>
        刷新
      </Button>
    </div>
  );
}
