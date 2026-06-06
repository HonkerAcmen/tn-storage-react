import { Alert, Button } from 'antd';

type AdminQueryAlertProps = {
  isError: boolean;
  message: string;
  onRetry?: () => void;
  className?: string;
};

/** 管理后台列表/图表查询失败时的统一错误提示 */
export function AdminQueryAlert({
  isError,
  message,
  onRetry,
  className = 'mb-4',
}: AdminQueryAlertProps) {
  if (!isError) return null;

  return (
    <Alert
      type="error"
      showIcon
      className={className}
      message={message}
      action={
        onRetry ? (
          <Button size="small" onClick={onRetry}>
            重试
          </Button>
        ) : undefined
      }
    />
  );
}
