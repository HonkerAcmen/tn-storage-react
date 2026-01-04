import { LoginRequest } from '@/types/Request/auth';
import { useMutation } from '@tanstack/react-query';
import http from '@/network/http';
import { loginPath } from '../resPath';
import { LoginApiResponse } from '@/types/Response/auth';

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
