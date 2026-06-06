import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminHttp from '@/network/adminHttp';
import { isAdminAuthed } from '@/utils/auth/adminSession';
import type { SiteContentView } from '@/config/siteContentDefaults';

const key = ['admin', 'site-content'] as const;

export type SiteContentUpdateInput = Partial<{
  product_name: string;
  brand_main_text: string;
  brand_accent_text: string;
  icp_number: string;
  icp_link: string;
  enterprise_name: string;
  enterprise_address: string;
  enterprise_phone: string;
  enterprise_email: string;
  enterprise_description: string;
  footer_title: string;
  footer_description: string;
  footer_copyright: string;
  footer_tagline: string;
  footer_links: Array<{ label: string; href: string }>;
  user_agreement_title: string;
  user_agreement_content: string;
}>;

export function useAdminSiteContent() {
  const authed = isAdminAuthed();
  return useQuery({
    queryKey: [...key],
    queryFn: async () => {
      const res = await adminHttp.get<{ data: SiteContentView }>(
        '/admin/site-content',
      );
      return res.data.data;
    },
    enabled: authed,
  });
}

export function useSaveAdminSiteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SiteContentUpdateInput) => {
      const res = await adminHttp.put<{ data: SiteContentView }>(
        '/admin/site-content',
        body,
      );
      return res.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...key] });
      await queryClient.invalidateQueries({ queryKey: ['site-content'] });
    },
  });
}
