import { useMutation, useQuery } from '@tanstack/react-query';
import http from '@/network/http';
import {
  AvatarUploadApiResponse,
  GetUserAvatarApiResponse,
  GetUserWithNameApiResponse,
  UpdateUserDataApiResponse,
} from '@/network/types/Response/user';
import {
  AvatarUploadPath,
  GetUserAvatarPath,
  getUserWithNamePath,
} from '../resPath';
import { UpdateUserDataRequest } from '@/network/types/Request/user';
import { message } from 'antd';

export function useGetUserWithName(username: string) {
  return useQuery({
    queryKey: ['user', 'data', username],
    queryFn: async () => {
      const res = await http.get<GetUserWithNameApiResponse>(
        getUserWithNamePath + `/${username}`
      );
      return res;
    },
    enabled: !!username,
  });
}

export function useGetAvatar(username: string) {
  return useQuery({
    queryKey: ['user', 'avatar', username],
    queryFn: async () => {
      const res = await http.get<GetUserAvatarApiResponse>(
        GetUserAvatarPath + `/${username}`
      );
      return res;
    },
    enabled: !!username,
  });
}

export function useAvatarUpload() {
  return useMutation({
    mutationFn: async ({
      username,
      file,
    }: {
      username: string;
      file: File;
    }) => {
      try {
        // 后端使用 FileInterceptor('avatar')，需要发送 FormData，字段名为 'avatar'
        const formData = new FormData();
        formData.append('avatar', file);

        // 对于 FormData，不设置 Content-Type header，让 axios 自动处理（会自动添加 boundary）
        const data = await http.post<AvatarUploadApiResponse>(
          AvatarUploadPath + `/${username}`,
          formData
        );
        message.success('上传成功');
        return data;
      } catch {
        message.error('上传出错');
      }
    },
  });
}

export function useUpdateUserData() {
  return useMutation({
    mutationFn: async (userdata: UpdateUserDataRequest) => {
      try {
        const data = await http.post<UpdateUserDataApiResponse>(
          '/user/update',
          userdata
        );
        message.success('更新成功');
        return data;
      } catch {
        message.error('更新出错！');
      }
    },
  });
}
