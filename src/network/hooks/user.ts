import { useMutation, useQuery } from '@tanstack/react-query';
import http from '@/network/http';
import {
  AvatarUploadApiResponse,
  GetUserAvatarApiResponse,
  GetUserWithNameApiResponse,
  GetUserStorageApiResponse,
  UpdateUserDataApiResponse,
} from '@/network/types/Response/user';
import {
  AvatarUploadPath,
  GetUserAvatarPath,
  getUserWithNamePath,
} from '../resPath';
import { UpdateUserDataRequest } from '@/network/types/Request/user';

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

export function useGetMyProfile() {
  return useQuery({
    queryKey: ['user', 'profile', 'me'],
    queryFn: async () => {
      const res = await http.get<GetUserWithNameApiResponse>('/user/profile/me');
      return res;
    },
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

export function useGetMyAvatar() {
  return useQuery({
    queryKey: ['user', 'avatar', 'me'],
    queryFn: async () => {
      const res = await http.get<GetUserAvatarApiResponse>('/user/avatar/me');
      return res;
    },
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
        // message 提示由调用方处理
        return data;
      } catch {
        // message 提示由调用方处理
        throw new Error('Upload failed');
      }
    },
  });
}

export function useAvatarUploadMe() {
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return await http.post<AvatarUploadApiResponse>('/user/avatar/upload/me', formData);
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
        // message 提示由调用方处理
        return data;
      } catch {
        // message 提示由调用方处理
        throw new Error('Update failed');
      }
    },
  });
}

export function useUpdateMyUserData() {
  return useMutation({
    mutationFn: async (userdata: UpdateUserDataRequest) => {
      return await http.post<UpdateUserDataApiResponse>('/user/update/me', userdata);
    },
  });
}

export function useGetMyStorage() {
  return useQuery({
    queryKey: ['user', 'storage', 'me'],
    queryFn: async () => {
      return await http.get<GetUserStorageApiResponse>('/user/storage/me');
    },
  });
}
