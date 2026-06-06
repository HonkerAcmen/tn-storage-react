import http from '@/network/http';

function parseFilename(contentDisposition?: string): string | null {
  if (!contentDisposition) return null;
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return plainMatch?.[1] ?? null;
}

export async function downloadSharedFileByToken(token: string): Promise<string> {
  const res = await http.get<Blob>(`/file/share/download/${token}`, {
    responseType: 'blob',
  });

  const filename =
    parseFilename(
      typeof res.headers['content-disposition'] === 'string'
        ? res.headers['content-disposition']
        : undefined,
    ) ?? `shared-${token.slice(0, 8)}`;

  const blob =
    res.data instanceof Blob
      ? res.data
      : new Blob([res.data], {
          type: res.headers['content-type'] || 'application/octet-stream',
        });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return filename;
}
