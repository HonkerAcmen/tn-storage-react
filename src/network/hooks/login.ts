import { LoginRequest, RegisterRequest } from '@/types/Request/auth';
import { useMutation } from '@tanstack/react-query';
import http from '@/network/http';
import { loginPath, registerPath } from '../resPath';
import { LoginApiResponse, RegisterApiResponse } from '@/types/Response/auth';
import { message } from 'antd';
import { useRouter } from 'next/router';

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
