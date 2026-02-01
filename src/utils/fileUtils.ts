/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 格式化时间（相对时间）
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const FILE_TYPE_MAP: Record<string, string[]> = {
  documentExts: [
    'doc',
    'docx',
    'xls',
    'xlsx',
    'csv',
    'ppt',
    'pptx',
    'pdf',
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'txt',
    'md',
    'log',
    'rtf',
    'js',
    'ts',
    'html',
    'css',
    'json',
    'xml',
    'yaml',
    'yml',
  ],
  imageExts: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'heic'],
  videoExts: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm'],
  audioExts: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
};
