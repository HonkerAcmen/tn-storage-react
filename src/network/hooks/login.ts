import { useMutation } from '@tanstack/react-query';
import http from '@/network/http';
import { loginPath, registerPath, forgotPasswordPath } from '../resPath';
import {
  LoginApiResponse,
  RegisterApiResponse,
  ForgotPasswordApiResponse,
} from '@/network/types/Response/auth';
import {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
} from '@/network/types/Request/auth';
import { notifyAuthChanged } from '@/utils/auth';
import { queryClient } from '@/network/queryClient';

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await http.post<LoginApiResponse>(loginPath, data);
      const token = res.data.data.token;
      const username = res.data.data.username;
      const email = res.data.data.email;
      const userId = String(res.data.data.userId);

      // 保存 token 到 localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('userId', userId);
      notifyAuthChanged();
      await queryClient.invalidateQueries({ queryKey: ['file'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });

      return { token, username, email, userId };
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest) =>
      await http.post<RegisterApiResponse>(registerPath, data),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) =>
      await http.post<ForgotPasswordApiResponse>(forgotPasswordPath, data),
  });
}
