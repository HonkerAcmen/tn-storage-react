import { useMutation, useQuery } from '@tanstack/react-query';
import http from '@/network/http';
import {
  AvatarUploadApiResponse,
  GetUserAvatarApiResponse,
  GetUserWithNameApiResponse,
} from '@/types/Response/user';
import {
  AvatarUploadPath,
  GetUserAvatarPath,
  getUserWithNamePath,
} from '../resPath';

export function useGetUserWithName(username: string) {
  return useQuery({
    queryKey: ['username', username],
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
    queryKey: ['username', username],
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
      // 后端使用 FileInterceptor('avatar')，需要发送 FormData，字段名为 'avatar'
      const formData = new FormData();
      formData.append('avatar', file);

      // 对于 FormData，不设置 Content-Type header，让 axios 自动处理（会自动添加 boundary）
      return await http.post<AvatarUploadApiResponse>(
        AvatarUploadPath + `/${username}`,
        formData
      );
    },
  });
}
