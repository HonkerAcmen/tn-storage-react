import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import http from '@/network/http';
import {
  AvatarUploadApiResponse,
  AdminUserRoleResponse,
  ChangePasswordApiResponse,
  GetAdminUsersApiResponse,
  GetUserAvatarApiResponse,
  GetUserLoginHistoryApiResponse,
  GetUserSettingsApiResponse,
  GetUserWithNameApiResponse,
  GetUserStorageApiResponse,
  UpdateUserSettingsApiResponse,
  UpdateUserDataApiResponse,
} from '@/network/types/Response/user';
import {
  AvatarUploadPath,
  GetUserAvatarPath,
  getUserWithNamePath,
} from '../resPath';
import {
  ChangePasswordRequest,
  UpdateUserDataRequest,
  UpdateUserSettingsRequest,
} from '@/network/types/Request/user';
import { isAuthed } from '@/utils/auth';

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
  const authed = isAuthed();
  return useQuery({
    queryKey: ['user', 'profile', 'me'],
    queryFn: async () => {
      const res =
        await http.get<GetUserWithNameApiResponse>('/user/profile/me');
      return res;
    },
    enabled: authed,
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
  const authed = isAuthed();
  return useQuery({
    queryKey: ['user', 'avatar', 'me'],
    queryFn: async () => {
      const res = await http.get<GetUserAvatarApiResponse>('/user/avatar/me');
      return res;
    },
    enabled: authed,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return await http.post<AvatarUploadApiResponse>(
        '/user/avatar/upload/me',
        formData
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user', 'avatar', 'me'],
      });
      await queryClient.refetchQueries({
        queryKey: ['user', 'avatar', 'me'],
      });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userdata: UpdateUserDataRequest) => {
      return await http.post<UpdateUserDataApiResponse>(
        '/user/update/me',
        userdata
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user', 'profile', 'me'],
      });
    },
  });
}

export function useGetMyStorage() {
  const authed = isAuthed();
  return useQuery({
    queryKey: ['user', 'storage', 'me'],
    queryFn: async () => {
      return await http.get<GetUserStorageApiResponse>('/user/storage/me');
    },
    enabled: authed,
  });
}

export function useGetMySettings() {
  const authed = isAuthed();
  return useQuery({
    queryKey: ['user', 'settings', 'me'],
    queryFn: async () => {
      return await http.get<GetUserSettingsApiResponse>('/user/settings/me');
    },
    enabled: authed,
  });
}

export function useGetAdminUsers(enabled = true) {
  return useQuery({
    queryKey: ['user', 'admin', 'users'],
    queryFn: async () => {
      return await http.get<GetAdminUsersApiResponse>('/user/admin/users');
    },
    enabled,
  });
}

export function useUpdateMySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: UpdateUserSettingsRequest) => {
      return await http.post<UpdateUserSettingsApiResponse>(
        '/user/settings/me',
        settings
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user', 'settings', 'me'],
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      role,
    }: {
      id: number;
      role: AdminUserRoleResponse['role'];
    }) => {
      return await http.put('/user/admin/role/' + id, { role });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user', 'admin', 'users'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['user', 'settings', 'me'],
      });
    },
  });
}

export function useGetMyLoginHistory() {
  const authed = isAuthed();
  return useQuery({
    queryKey: ['user', 'security', 'login-history'],
    queryFn: async () => {
      return await http.get<GetUserLoginHistoryApiResponse>(
        '/user/security/login-history'
      );
    },
    enabled: authed,
  });
}

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      return await http.put<ChangePasswordApiResponse>(
        '/user/changePassword/me',
        payload
      );
    },
  });
}
