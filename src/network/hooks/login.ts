import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
} from '@/types/Request/auth';
import { useMutation } from '@tanstack/react-query';
import http from '@/network/http';
import { loginPath, registerPath, forgotPasswordPath } from '../resPath';
import {
  LoginApiResponse,
  RegisterApiResponse,
  ForgotPasswordApiResponse,
} from '@/types/Response/auth';

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await http.post<LoginApiResponse>(loginPath, data);
      const token = res.data.data.token;
      localStorage.setItem('token', token);
      return { token };
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
