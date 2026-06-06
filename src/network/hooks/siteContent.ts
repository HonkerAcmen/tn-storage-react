import { useQuery } from '@tanstack/react-query';
import http from '@/network/http';
import {
  mergeSiteContent,
  type SiteContentView,
} from '@/config/siteContentDefaults';

export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const res = await http.get<{ data: SiteContentView }>('/site-content');
      return mergeSiteContent(res.data.data);
    },
    staleTime: 60_000,
  });
}
