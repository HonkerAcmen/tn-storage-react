/** 与后端 upload/init 保持一致的上传文件名规范化 */
export function normalizeUploadFilename(filename: string): string {
  return filename.replace(/[“”#]/g, '').trim();
}
