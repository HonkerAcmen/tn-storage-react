import http from '@/network/http';
import {
  cancelUploadTaskPath,
  getUploadStatusPath,
  listUploadTasksPath,
} from '@/network/resPath';
import { BaseResponse } from '@/network/types/Response';
import { UploadStatusResponse } from '@/network/types/Response/file';

export async function fetchUploadStatus(taskId: string) {
  const res = await http.get<BaseResponse<UploadStatusResponse>>(
    `${getUploadStatusPath}/${taskId}`,
  );
  return res.data.data;
}

export async function fetchUploadTasks() {
  const res = await http.get<BaseResponse<UploadStatusResponse[]>>(
    listUploadTasksPath,
  );
  return res.data.data ?? [];
}

export async function cancelUploadTask(taskId: string) {
  await http.delete(`${cancelUploadTaskPath}/${taskId}`);
}
