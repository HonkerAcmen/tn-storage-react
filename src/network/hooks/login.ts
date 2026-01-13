import { useMutation } from '@tanstack/react-query';
import http from '@/network/http';
import { loginPath, registerPath, forgotPasswordPath } from '../resPath';
import {
  LoginApiResponse,
  RegisterApiResponse,
  ForgotPasswordApiResponse,
} from '@/types/Response/auth';
import {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
} from '@/types/Request/auth';

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await http.post<LoginApiResponse>(loginPath, data);
      const token = res.data.data.token;
      const username = res.data.data.username;

      // 保存 token 到 localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      return { token, username };
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
