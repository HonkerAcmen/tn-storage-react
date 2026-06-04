import { useEffect, useMemo, useState } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { useAdminUsers } from '@/network/hooks/admin';

type AdminUserSelectProps = {
  value?: number;
  onChange?: (value: number | undefined) => void;
  className?: string;
  placeholder?: string;
};

/** 支持远程 keyword 搜索的云盘用户筛选下拉 */
export function AdminUserSelect({
  value,
  onChange,
  className = 'w-56',
  placeholder = '所属用户',
}: AdminUserSelectProps) {
  const [search, setSearch] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useAdminUsers({
    page: 1,
    limit: 50,
    keyword: debouncedKeyword || undefined,
  });

  const options = useMemo(
    () =>
      (data?.data?.data?.items ?? []).map((u) => ({
        value: u.id,
        label: `${u.username} (${u.email})`,
      })),
    [data],
  );

  const handleChange: SelectProps<number>['onChange'] = (next) => {
    onChange?.(next);
  };

  return (
    <Select
      allowClear
      showSearch
      filterOption={false}
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={handleChange}
      onSearch={setSearch}
      options={options}
      loading={isLoading}
      notFoundContent={isLoading ? '加载中…' : '无匹配用户'}
    />
  );
}
