/** 分片/大文件上传单次请求超时（毫秒），与后端 UPLOAD_TIMEOUT_MS 默认 5 分钟对齐 */
export const UPLOAD_REQUEST_TIMEOUT_MS =
  Number(process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT_MS) > 0
    ? Number(process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT_MS)
    : 300_000;
