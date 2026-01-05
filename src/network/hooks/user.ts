import { useQuery } from '@tanstack/react-query';
import http from '@/network/http';
import { GetUserWithNameApiResponse } from '@/types/Response/user';
import { getUserWithNamePath } from '../resPath';

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
