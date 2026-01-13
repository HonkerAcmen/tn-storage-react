// /**
//  * 从 React Query 缓存中获取当前用户名
//  * @returns username 字符串，如果缓存中没有则返回 null
//  */
// export function getCachedUsername(): string | null {
//   return queryClient.getQueryData<string>(queryKeys.user.username()) || null;
// }

// /**
//  * 设置用户名到 React Query 缓存
//  * @param username 用户名
//  */
// export function setCachedUsername(username: string): void {
//   queryClient.setQueryData(queryKeys.user.username(), username);
// }

// /**
//  * 清除缓存的用户名
//  */
// export function clearCachedUsername(): void {
//   queryClient.removeQueries({ queryKey: queryKeys.user.username() });
// }

// /**
//  * Hook：在组件中获取缓存的用户名
//  * 使用 useQuery 可以自动响应缓存变化
//  */
// export function useCachedUsername() {
//   return useQuery({
//     queryKey: queryKeys.user.username(),
//     queryFn: async () => {
//       // 从 React Query 缓存中获取（这个函数实际上不应该被调用，因为我们设置了 initialData）
//       const cached = queryClient.getQueryData<string>(
//         queryKeys.user.username()
//       );
//       return cached || null;
//     },
//     staleTime: Infinity, // 用户名数据不会过期
//     gcTime: Infinity, // 永不过期
//     enabled: typeof window !== 'undefined', // 仅在客户端启用
//     // 使用 refetchOnMount: false 避免不必要的重新获取
//     refetchOnMount: false,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//   });
// }
export function GetUserNameWithLocalsStroger(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('username') ?? '';
}
